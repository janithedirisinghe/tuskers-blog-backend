import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminRoleGuard } from '../auth/admin-role.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ArticleService } from './article.service';
import { ArticleStatus } from './enums/article.enums';

@Controller('admin/articles')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  findAll(@Query('status') status?: ArticleStatus) {
    return this.articleService.findAllAdmin(status);
  }

  @Get('pending')
  findPending() {
    return this.articleService.findAllAdmin(ArticleStatus.Pending);
  }

  @Get('approved')
  findApproved() {
    return this.articleService.findAllAdmin(ArticleStatus.Approved);
  }

  @Get('rejected')
  findRejected() {
    return this.articleService.findAllAdmin(ArticleStatus.Rejected);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articleService.findOneAdmin(id);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.articleService.approve(id);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.articleService.reject(id);
  }
}
