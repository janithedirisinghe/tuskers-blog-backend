import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { getModelToken } from '@nestjs/mongoose';
import { Article } from './entities/article.entity';
import { NotFoundException } from '@nestjs/common';

describe('ArticleService', () => {
  let service: ArticleService;

  const mockArticle = {
    _id: 'testId',
    title: 'Test Article',
    excerpt: 'This is a test article',
    content: 'Content for test article',
    image: 'http://example.com/image.jpg',
    category: 'education',
    tags: ['test', 'education'],
    author: 'Test Author',
    publishDate: '2025-05-01'
  };

  const mockArticleModel = {
    new: jest.fn().mockResolvedValue(mockArticle),
    constructor: jest.fn().mockResolvedValue(mockArticle),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
    select: jest.fn(),
    sort: jest.fn(),
    limit: jest.fn(),
    aggregate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: getModelToken(Article.name),
          useValue: mockArticleModel,
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all articles', async () => {
      mockArticleModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([mockArticle]),
      });
      expect(await service.findAll()).toEqual([mockArticle]);
    });
  });

  describe('findOne', () => {
    it('should return a single article', async () => {
      mockArticleModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockArticle),
      });
      expect(await service.findOne('testId')).toEqual(mockArticle);
    });

    it('should throw an error if article is not found', async () => {
      mockArticleModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      });
      await expect(service.findOne('nonexistentId')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should successfully create an article', async () => {
      const createArticleDto = {
        title: 'New Article',
        excerpt: 'New excerpt',
        content: 'New content',
        image: 'http://example.com/new.jpg',
        category: 'research',
        tags: ['new', 'research'],
        author: 'New Author',
        publishDate: '2025-05-02'
      };
      
      jest.spyOn(mockArticleModel, 'save').mockResolvedValueOnce(mockArticle);
      
      const newArticleMock = {
        ...createArticleDto,
        save: jest.fn().mockResolvedValueOnce(mockArticle)
      };
      
      jest.spyOn(mockArticleModel, 'constructor').mockImplementationOnce(() => newArticleMock);
      
      expect(await service.create(createArticleDto as any)).toEqual(mockArticle);
    });
  });
});
