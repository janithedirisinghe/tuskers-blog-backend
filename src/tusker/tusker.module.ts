import { Module } from '@nestjs/common';
import { TuskerService } from './tusker.service';
import { TuskerController } from './tusker.controller';

@Module({
  providers: [TuskerService],
  controllers: [TuskerController],
})
export class TuskerModule {}
