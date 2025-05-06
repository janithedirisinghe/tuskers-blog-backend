import { Injectable } from '@nestjs/common';
import { SitemapStream, streamToPromise } from 'sitemap';
import { TuskerService } from '../tusker/tusker.service';
import { ArticleService } from '../article/article.service';

@Injectable()
export class SitemapService {
  constructor(
    private readonly tuskerService: TuskerService,
    private readonly articleService: ArticleService,
  ) {}

  async generateSitemap(): Promise<string> {
    const smStream = new SitemapStream({ hostname: 'https://www.srilankantusckers.com' });

    // Static URLs
    smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
    smStream.write({ url: '/about', changefreq: 'monthly', priority: 0.8 });
    smStream.write({ url: '/contact', changefreq: 'monthly', priority: 0.8 });
    smStream.write({ url: '/tuskers', changefreq: 'daily', priority: 1.0 });
    smStream.write({ url: '/articles', changefreq: 'daily', priority: 1.0 });
    smStream.write({ url: '/search-results', changefreq: 'daily', priority: 1.0 });

    // Dynamic tusker URLs
    const tuskers = await this.tuskerService.getAllTuskers(); // Should return tusker[] with slug/id
    tuskers.forEach(tusker => {
      smStream.write({
        url: `/tusker/${tusker.id}`,
        changefreq: 'daily',
        priority: 1.0,
      });
    });

    // Dynamic article URLs
    const articles = await this.articleService.findAll();
    articles.forEach(article => {
      smStream.write({
        url: `/article/${article.id}`,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: article.publishDate,
      });
    });

    smStream.end();
    const sitemapOutput = await streamToPromise(smStream);
    return sitemapOutput.toString();
  }
}
