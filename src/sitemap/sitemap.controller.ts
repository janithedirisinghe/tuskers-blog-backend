import { Controller, Get, Res } from '@nestjs/common';
import { SitemapService } from './sitemap.service';
import { Response } from 'express';

@Controller('sitemap')
export class SitemapController {
  constructor(private readonly sitemapService: SitemapService) {}

  @Get('sitemap.xml')
  async getSitemap(@Res() res: Response) {
    const sitemap = await this.sitemapService.generateSitemap();
    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemap);
  }
}
