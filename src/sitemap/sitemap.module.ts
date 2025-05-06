import { Module } from '@nestjs/common';
import { SitemapService } from './sitemap.service';
import { SitemapController } from './sitemap.controller';
import { TuskerModule } from '../tusker/tusker.module';
import { ArticleModule } from '../article/article.module';

@Module({
  imports: [TuskerModule, ArticleModule],
  controllers: [SitemapController],
  providers: [SitemapService],
})
export class SitemapModule {}
