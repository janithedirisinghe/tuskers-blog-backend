import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @UseGuards(JwtAuthGuard) 
  @Post()
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articleService.create(createArticleDto);
  }

  @Get()
  findAll() {
    return this.articleService.findAll();
  }

  @Get('tags/all')
  getAllTags() {
    return this.articleService.getAllTags();
  }

  @Get('recent')
  getRecentArticles(@Query('limit') limit: number) {
    return this.articleService.getRecentArticles(limit);
  }
 
  @Get('category/:category')
  getArticlesByCategory(@Param('category') category: string) {
    return this.articleService.getArticlesByCategory(category);
  }

  @Get('tag/:tag')
  getArticlesByTag(@Param('tag') tag: string) {
    return this.articleService.getArticlesByTag(tag);
  }

  @Get('search')
  searchArticles(@Query('q') query: string) {
    return this.articleService.searchArticles(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articleService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articleService.update(id, updateArticleDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articleService.remove(id);
  }
}
