import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { TuskerService } from './tusker.service';
import { CreateTuskerDto } from './dto/create-tusker.dto';
import { UpdateTuskerDto } from './dto/update-tusker.dto';
import { Tusker } from './tusker.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';


@Controller('tuskers')
export class TuskerController {
  constructor(private readonly tuskerService: TuskerService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createTusker(@Body() createTuskerDto: CreateTuskerDto): Promise<Tusker> {
    return this.tuskerService.createTusker(createTuskerDto);
  }
  
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateTusker(@Param('id') id: string, @Body() updateTuskerDto: UpdateTuskerDto): Promise<Tusker> {
    return this.tuskerService.updateTusker(id, updateTuskerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteTusker(@Param('id') id: string): Promise<Tusker> {
    return this.tuskerService.deleteTusker(id);
  }

  @Get()
  async getAllTuskers(): Promise<Tusker[]> {
    return this.tuskerService.getAllTuskers();
  }

  @Get('tags/all')
  async getAllTags(): Promise<string[]> {
    return this.tuskerService.getAllTags();
  }

  @Get('random/tusker')
  async getRandomTuskers(): Promise<Tusker[]> {
    return this.tuskerService.getRandomTuskers();
  }

  @Get('search/search-by-name')
  async getTuskersByName(@Query('name') name: string): Promise<Tusker[]> {
    return this.tuskerService.getTuskersByName(name);
  }

  @Get('search/search-by-category')
  async getTuskersByCategory(@Query('category') category: string): Promise<Tusker[]> {
    return this.tuskerService.getTuskersByCategory(category);
  }

  @Get('slug/:slug')
  async getTuskerBySlug(@Param('slug') slug: string): Promise<Tusker> {
    return this.tuskerService.getTuskerBySlug(slug);
  }

  @Get(':id')
  async getTuskerById(@Param('id') id: string): Promise<Tusker> {
    return this.tuskerService.getTuskerById(id);
  }
}
