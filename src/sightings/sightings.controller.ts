import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateSightingDto } from './dto/create-sighting.dto';
import { NearbySightingsQueryDto } from './dto/nearby-sightings-query.dto';
import { SightingsService } from './sightings.service';

@Controller('sightings')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
export class SightingsController {
  constructor(private readonly sightingsService: SightingsService) {}

  @Post()
  create(@Body() createSightingDto: CreateSightingDto) {
    return this.sightingsService.create(createSightingDto);
  }

  @Get()
  findApproved() {
    return this.sightingsService.findApproved();
  }

  @Get('near')
  findNearby(@Query() nearbySightingsQueryDto: NearbySightingsQueryDto) {
    return this.sightingsService.findNearby(nearbySightingsQueryDto);
  }
}