import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tusker } from './tusker.schema';
import { CreateTuskerDto } from './dto/create-tusker.dto';
import { UpdateTuskerDto } from './dto/update-tusker.dto';

@Injectable()
export class TuskerService {
  constructor(@InjectModel(Tusker.name) private tuskerModel: Model<Tusker>) {}

  async createTusker(createTuskerDto: CreateTuskerDto): Promise<Tusker> {
    const newTusker = new this.tuskerModel(createTuskerDto);
    return newTusker.save();
  }

  async updateTusker(id: string, updateTuskerDto: UpdateTuskerDto): Promise<Tusker> {
    const existingTusker = await this.tuskerModel.findByIdAndUpdate(id, updateTuskerDto, { new: true });
    if (!existingTusker) {
      throw new NotFoundException(`Tusker #${id} not found`);
    }
    return existingTusker;
  }

  async deleteTusker(id: string): Promise<Tusker> {
    const deletedTusker = await this.tuskerModel.findByIdAndDelete(id);
    if (!deletedTusker) {
      throw new NotFoundException(`Tusker #${id} not found`);
    }
    return deletedTusker;
  }

  async getAllTuskers(): Promise<Tusker[]> {
    return this.tuskerModel.find().exec();
  }

  async getTuskerById(id: string): Promise<Tusker> {
    const tusker = await this.tuskerModel.findById(id).exec();
    if (!tusker) {
      throw new NotFoundException(`Tusker #${id} not found`);
    }
    return tusker;
  }

  async getAllTags(): Promise<string[]> {
    const tuskers = await this.tuskerModel.find().select('tags').exec();
    const tags = tuskers.flatMap(tusker => tusker.tags);
    return [...new Set(tags)];
  }
}
