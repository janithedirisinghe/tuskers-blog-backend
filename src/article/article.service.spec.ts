import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { getModelToken } from '@nestjs/mongoose';
import { Article } from './entities/article.entity';

describe('ArticleService', () => {
  let service: ArticleService;
  let mockArticleModel: any;

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
  beforeEach(async () => {
    const mockArticleInstance = {
      save: jest.fn().mockResolvedValue(mockArticle),
    };

    mockArticleModel = jest.fn().mockImplementation(() => mockArticleInstance);
    mockArticleModel.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockArticle]),
      }),
      exec: jest.fn().mockResolvedValue([mockArticle]),
    });
    mockArticleModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockArticle),
    });
    mockArticleModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockArticle);
    mockArticleModel.findByIdAndDelete = jest.fn().mockResolvedValue(mockArticle);

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
      
      const result = await service.create(createArticleDto as any);
      expect(mockArticleModel).toHaveBeenCalledWith({
        ...createArticleDto,
        slug: 'new-article'
      });
      expect(result).toEqual(mockArticle);
    });
  });
});
