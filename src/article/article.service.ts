import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { SlugUtil } from '../utils/slug.util';

@Injectable()
export class ArticleService {
  constructor(@InjectModel(Article.name) private articleModel: Model<Article>) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    // Generate slug if not provided
    let slug = createArticleDto.slug;
    if (!slug) {
      slug = SlugUtil.generateSlug(createArticleDto.title);
      
      // Ensure slug is unique
      const existingSlugs = await this.getAllSlugs();
      slug = SlugUtil.generateUniqueSlug(slug, existingSlugs);
    } else {
      // Validate provided slug
      if (!SlugUtil.isValidSlug(slug)) {
        throw new ConflictException('Invalid slug format');
      }
      
      // Check if slug already exists
      const existingArticle = await this.articleModel.findOne({ slug }).exec();
      if (existingArticle) {
        throw new ConflictException('Article with this slug already exists');
      }
    }

    const newArticle = new this.articleModel({
      ...createArticleDto,
      slug
    });
    return newArticle.save();
  }

  async findAll(): Promise<Article[]> {
    return this.articleModel.find().exec();
  }

  async findOne(id: string): Promise<Article> {
    const article = await this.articleModel.findById(id).exec();
    if (!article) {
      throw new NotFoundException(`Article #${id} not found`);
    }
    return article;
  }

  async findBySlug(slug: string): Promise<Article> {
    const article = await this.articleModel.findOne({ slug }).exec();
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
    const articles = await this.articleModel.find().select('tags').exec();
    const tags = articles.flatMap(article => article.tags);
    return [...new Set(tags)];
  }

  async getRecentArticles(limit: number = 5): Promise<Article[]> {
    return this.articleModel.find()
      .sort({ publishDate: -1 })
      .limit(limit)
      .exec();
  }

  async getArticlesByCategory(category: string): Promise<Article[]> {
    return this.articleModel.find({ category: { $regex: category, $options: 'i' } }).exec();
  }

  async getArticlesByTag(tag: string): Promise<Article[]> {
    return this.articleModel.find({ tags: { $elemMatch: { $regex: tag, $options: 'i' } } }).exec();
  }

  async searchArticles(query: string): Promise<Article[]> {
    return this.articleModel.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { excerpt: { $regex: query, $options: 'i' } }
      ]
    }).exec();
  }

  // Helper method to get all existing slugs
  private async getAllSlugs(excludeId?: string): Promise<string[]> {
    const query = excludeId ? { _id: { $ne: excludeId } } : {};
    const articles = await this.articleModel.find(query).select('slug').exec();
    return articles.map(article => article.slug).filter(slug => slug);
  }
}
