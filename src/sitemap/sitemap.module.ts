import { Module } from '@nestjs/common';
import { SitemapService } from './sitemap.service';
import { SitemapController } from './sitemap.controller';
import { TuskerModule } from '../tusker/tusker.module'; // Import the module containing TuskerService

@Module({
  imports: [TuskerModule], // Add the import here
  controllers: [SitemapController],
  providers: [SitemapService],
})
export class SitemapModule {}
