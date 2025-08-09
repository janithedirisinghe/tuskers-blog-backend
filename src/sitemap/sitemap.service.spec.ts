import { Test, TestingModule } from '@nestjs/testing';
import { SitemapService } from './sitemap.service';
import { TuskerService } from '../tusker/tusker.service';
import { ArticleService } from '../article/article.service';

describe('SitemapService', () => {
  let service: SitemapService;

  const mockTuskerService = {
    getAllTuskers: jest.fn().mockResolvedValue([
      { id: '1', name: 'Test Tusker', slug: 'test-tusker' }
    ]),
  };

  const mockArticleService = {
    findAll: jest.fn().mockResolvedValue([
      { id: '1', title: 'Test Article', slug: 'test-article', publishDate: '2025-01-01' }
    ]),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SitemapService,
        {
          provide: TuskerService,
          useValue: mockTuskerService,
        },
        {
          provide: ArticleService,
          useValue: mockArticleService,
        },
      ],
    }).compile();

    service = module.get<SitemapService>(SitemapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateSitemap', () => {
    it('should generate a sitemap with static and dynamic URLs', async () => {
      const sitemap = await service.generateSitemap();
      
      expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(sitemap).toContain('<urlset');
      expect(sitemap).toContain('https://www.srilankantusckers.com/');
  expect(sitemap).toContain('/tuskers/test-tusker');
  expect(sitemap).toContain('/articles/test-article');
      
      expect(mockTuskerService.getAllTuskers).toHaveBeenCalled();
      expect(mockArticleService.findAll).toHaveBeenCalled();
    });
  });
});
