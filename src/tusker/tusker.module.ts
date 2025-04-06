import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TuskerService } from './tusker.service';
import { TuskerController } from './tusker.controller';
import { Tusker, TuskerSchema } from './tusker.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tusker.name, schema: TuskerSchema }])
  ],
  providers: [TuskerService],
  controllers: [TuskerController],
  exports: [TuskerService],
})
export class TuskerModule {}
