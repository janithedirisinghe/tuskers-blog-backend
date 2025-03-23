import { Test, TestingModule } from '@nestjs/testing';
import { TuskerService } from './tusker.service';

describe('TuskerService', () => {
  let service: TuskerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TuskerService],
    }).compile();

    service = module.get<TuskerService>(TuskerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
