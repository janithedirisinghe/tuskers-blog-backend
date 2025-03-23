import { Test, TestingModule } from '@nestjs/testing';
import { TuskerController } from './tusker.controller';

describe('TuskerController', () => {
  let controller: TuskerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TuskerController],
    }).compile();

    controller = module.get<TuskerController>(TuskerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
