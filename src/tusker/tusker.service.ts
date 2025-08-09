import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tusker } from './tusker.schema';
import { CreateTuskerDto } from './dto/create-tusker.dto';
import { UpdateTuskerDto } from './dto/update-tusker.dto';
import { SlugUtil } from '../utils/slug.util';

@Injectable()
export class TuskerService {
  constructor(@InjectModel(Tusker.name) private tuskerModel: Model<Tusker>) {}

  async createTusker(createTuskerDto: CreateTuskerDto): Promise<Tusker> {
    // Generate slug if not provided
    let slug = createTuskerDto.slug;
    if (!slug) {
      slug = SlugUtil.generateSlug(createTuskerDto.name);
      
      // Ensure slug is unique
      const existingSlugs = await this.getAllSlugs();
      slug = SlugUtil.generateUniqueSlug(slug, existingSlugs);
    } else {
      // Validate provided slug
      if (!SlugUtil.isValidSlug(slug)) {
        throw new ConflictException('Invalid slug format');
      }
      
      // Check if slug already exists
      const existingTusker = await this.tuskerModel.findOne({ slug }).exec();
      if (existingTusker) {
        throw new ConflictException('Tusker with this slug already exists');
      }
    }

    const newTusker = new this.tuskerModel({
      ...createTuskerDto,
      slug
    });
    return newTusker.save();
  }

  async updateTusker(id: string, updateTuskerDto: UpdateTuskerDto): Promise<Tusker> {
    // If name is being updated, regenerate slug
    if (updateTuskerDto.name) {
      const existingTusker = await this.tuskerModel.findById(id).exec();
      if (!existingTusker) {
        throw new NotFoundException(`Tusker #${id} not found`);
      }

      let slug = updateTuskerDto.slug;
      if (!slug) {
        slug = SlugUtil.generateSlug(updateTuskerDto.name);
        
        // Ensure slug is unique (excluding current tusker)
        const existingSlugs = await this.getAllSlugs(id);
        slug = SlugUtil.generateUniqueSlug(slug, existingSlugs);
      } else {
        // Validate provided slug
        if (!SlugUtil.isValidSlug(slug)) {
          throw new ConflictException('Invalid slug format');
        }
        
        // Check if slug already exists (excluding current tusker)
        const existingSlugTusker = await this.tuskerModel.findOne({ 
          slug, 
          _id: { $ne: id } 
        }).exec();
        if (existingSlugTusker) {
          throw new ConflictException('Tusker with this slug already exists');
        }
      }

      updateTuskerDto = { ...updateTuskerDto, slug };
    }

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

  async getTuskerBySlug(slug: string): Promise<Tusker> {
    const tusker = await this.tuskerModel.findOne({ slug }).exec();
    if (!tusker) {
      throw new NotFoundException(`Tusker with slug '${slug}' not found`);
    }
    return tusker;
  }

  async getAllTags(): Promise<string[]> {
    const tuskers = await this.tuskerModel.find().select('tags').exec();
    const tags = tuskers.flatMap(tusker => tusker.tags);
    return [...new Set(tags)];
  }

  async getRandomTuskers(): Promise<Tusker[]> {
    return this.tuskerModel.aggregate([{ $sample: { size: 3 } }]).exec();
  }

  async getTuskersByName(name: string): Promise<Tusker[]> {
    return this.tuskerModel.find({ name: { $regex: name, $options: 'i' } }).exec();
  }

  async getTuskersByCategory(category: string): Promise<Tusker[]> {
    return this.tuskerModel.find({ category: { $regex: category, $options: 'i' } }).exec();
  }

  // Helper method to get all existing slugs
  private async getAllSlugs(excludeId?: string): Promise<string[]> {
    const query = excludeId ? { _id: { $ne: excludeId } } : {};
    const tuskers = await this.tuskerModel.find(query).select('slug').exec();
    return tuskers.map(tusker => tusker.slug).filter(slug => slug);
  }
}
