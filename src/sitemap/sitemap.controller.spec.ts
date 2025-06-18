import { Test, TestingModule } from '@nestjs/testing';
import { SitemapController } from './sitemap.controller';
import { SitemapService } from './sitemap.service';

describe('SitemapController', () => {
  let controller: SitemapController;

  const mockSitemapService = {
    generateSitemap: jest.fn().mockResolvedValue('<?xml version="1.0" encoding="UTF-8"?><urlset></urlset>'),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SitemapController],
      providers: [
        {
          provide: SitemapService,
          useValue: mockSitemapService,
        },
      ],
    }).compile();

    controller = module.get<SitemapController>(SitemapController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
