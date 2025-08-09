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
    smStream.write({ url: '/privacy-policy', changefreq: 'daily', priority: 1.0 });
    smStream.write({ url: '/terms-of-service', changefreq: 'daily', priority: 1.0 });

    // Dynamic tusker URLs (use slugs)
    const tuskers = await this.tuskerService.getAllTuskers();
    tuskers.forEach(tusker => {
      if (!tusker.slug) return; // skip if slug not present
      smStream.write({
        url: `/tuskers/${tusker.slug}`,
        changefreq: 'daily',
        priority: 1.0,
      });
    });

    // Dynamic article URLs (use slugs)
    const articles = await this.articleService.findAll();
    articles.forEach(article => {
      if (!article.slug) return; // skip if slug not present
      smStream.write({
        url: `/articles/${article.slug}`,
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
