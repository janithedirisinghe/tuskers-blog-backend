import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';

@Injectable()
export class ArticleService {
  constructor(@InjectModel(Article.name) private articleModel: Model<Article>) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const newArticle = new this.articleModel(createArticleDto);
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

  async update(id: string, updateArticleDto: UpdateArticleDto): Promise<Article> {
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
}
