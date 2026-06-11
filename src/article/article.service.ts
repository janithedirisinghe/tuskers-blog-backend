import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { CreateArticleDto } from './dto/create-article.dto';
import { CreateBotArticleDto } from './dto/create-bot-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { ArticleStatus } from './enums/article.enums';
import { SlugUtil } from '../utils/slug.util';

@Injectable()
export class ArticleService {
  constructor(@InjectModel(Article.name) private articleModel: Model<Article>) {}

  // Matches approved articles and legacy articles created before publishedStatus existed
  private publicFilter(): FilterQuery<Article> {
    return { publishedStatus: { $nin: [ArticleStatus.Pending, ArticleStatus.Rejected] } };
  }

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const slug = await this.resolveSlug(createArticleDto.title, createArticleDto.slug);

    const newArticle = new this.articleModel({
      ...createArticleDto,
      slug
    });
    return newArticle.save();
  }

  async createBotArticle(createBotArticleDto: CreateBotArticleDto): Promise<Article> {
    const slug = await this.resolveSlug(createBotArticleDto.title, createBotArticleDto.slug);

    const newArticle = new this.articleModel({
      ...createBotArticleDto,
      slug,
      publishedStatus: ArticleStatus.Pending,
      botCreated: true
    });
    return newArticle.save();
  }

  async findAll(): Promise<Article[]> {
    return this.articleModel.find(this.publicFilter()).exec();
  }

  async findOne(id: string): Promise<Article> {
    const article = await this.articleModel.findOne({ _id: id, ...this.publicFilter() }).exec();
    if (!article) {
      throw new NotFoundException(`Article #${id} not found`);
    }
    return article;
  }

  async findBySlug(slug: string): Promise<Article> {
    const article = await this.articleModel.findOne({ slug, ...this.publicFilter() }).exec();
    if (!article) {
      throw new NotFoundException(`Article with slug '${slug}' not found`);
    }
    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto): Promise<Article> {
    // If title is being updated, regenerate slug
    if (updateArticleDto.title) {
      const existingArticle = await this.articleModel.findById(id).exec();
      if (!existingArticle) {
        throw new NotFoundException(`Article #${id} not found`);
      }

      let slug = updateArticleDto.slug;
      if (!slug) {
        slug = SlugUtil.generateSlug(updateArticleDto.title);

        // Ensure slug is unique (excluding current article)
        const existingSlugs = await this.getAllSlugs(id);
        slug = SlugUtil.generateUniqueSlug(slug, existingSlugs);
      } else {
        // Validate provided slug
        if (!SlugUtil.isValidSlug(slug)) {
          throw new ConflictException('Invalid slug format');
        }

        // Check if slug already exists (excluding current article)
        const existingSlugArticle = await this.articleModel.findOne({
          slug,
          _id: { $ne: id }
        }).exec();
        if (existingSlugArticle) {
          throw new ConflictException('Article with this slug already exists');
        }
      }

      updateArticleDto = { ...updateArticleDto, slug };
    }

    const existingArticle = await this.articleModel.findByIdAndUpdate(id, updateArticleDto, { new: true });
    if (!existingArticle) {
      throw new NotFoundException(`Article #${id} not found`);
    }
    return existingArticle;
  }

  async remove(id: string): Promise<Article> {
    const deletedArticle = await this.articleModel.findByIdAndDelete(id);
    if (!deletedArticle) {
      throw new NotFoundException(`Article #${id} not found`);
    }
    return deletedArticle;
  }

  async getAllTags(): Promise<string[]> {
    const articles = await this.articleModel.find(this.publicFilter()).select('tags').exec();
    const tags = articles.flatMap(article => article.tags);
    return [...new Set(tags)];
  }

  async getRecentArticles(limit: number = 5): Promise<Article[]> {
    return this.articleModel.find(this.publicFilter())
      .sort({ publishDate: -1 })
      .limit(limit)
      .exec();
  }

  async getArticlesByCategory(category: string): Promise<Article[]> {
    return this.articleModel.find({
      ...this.publicFilter(),
      category: { $regex: category, $options: 'i' }
    }).exec();
  }

  async getArticlesByTag(tag: string): Promise<Article[]> {
    return this.articleModel.find({
      ...this.publicFilter(),
      tags: { $elemMatch: { $regex: tag, $options: 'i' } }
    }).exec();
  }

  async searchArticles(query: string): Promise<Article[]> {
    return this.articleModel.find({
      ...this.publicFilter(),
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { excerpt: { $regex: query, $options: 'i' } }
      ]
    }).exec();
  }

  // ----- Admin moderation -----

  async findAllAdmin(status?: ArticleStatus): Promise<Article[]> {
    const filter: FilterQuery<Article> = status ? { publishedStatus: status } : {};
    return this.articleModel.find(filter).sort({ publishDate: -1 }).exec();
  }

  async findOneAdmin(id: string): Promise<Article> {
    const article = await this.articleModel.findById(id).exec();
    if (!article) {
      throw new NotFoundException(`Article #${id} not found`);
    }
    return article;
  }

  async approve(id: string): Promise<Article> {
    return this.setStatus(id, ArticleStatus.Approved);
  }

  async reject(id: string): Promise<Article> {
    return this.setStatus(id, ArticleStatus.Rejected);
  }

  private async setStatus(id: string, status: ArticleStatus): Promise<Article> {
    const article = await this.articleModel.findByIdAndUpdate(
      id,
      { publishedStatus: status },
      { new: true }
    );
    if (!article) {
      throw new NotFoundException(`Article #${id} not found`);
    }
    return article;
  }

  // Helper to resolve/validate a slug for new articles
  private async resolveSlug(title: string, providedSlug?: string): Promise<string> {
    if (!providedSlug) {
      const slug = SlugUtil.generateSlug(title);

      // Ensure slug is unique
      const existingSlugs = await this.getAllSlugs();
      return SlugUtil.generateUniqueSlug(slug, existingSlugs);
    }

    // Validate provided slug
    if (!SlugUtil.isValidSlug(providedSlug)) {
      throw new ConflictException('Invalid slug format');
    }

    // Check if slug already exists
    const existingArticle = await this.articleModel.findOne({ slug: providedSlug }).exec();
    if (existingArticle) {
      throw new ConflictException('Article with this slug already exists');
    }

    return providedSlug;
  }

  // Helper method to get all existing slugs (includes pending articles so slugs stay unique)
  private async getAllSlugs(excludeId?: string): Promise<string[]> {
    const query = excludeId ? { _id: { $ne: excludeId } } : {};
    const articles = await this.articleModel.find(query).select('slug').exec();
    return articles.map(article => article.slug).filter(slug => slug);
  }
}
