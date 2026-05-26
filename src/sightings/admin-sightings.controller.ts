import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AdminRoleGuard } from '../auth/admin-role.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSightingDto } from './dto/create-sighting.dto';
import { UpdateSightingDto } from './dto/update-sighting.dto';
import { SightingsService } from './sightings.service';

@Controller('admin/sightings')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
export class AdminSightingsController {
  constructor(private readonly sightingsService: SightingsService) {}

  @Get()
  findAll() {
    return this.sightingsService.findAll();
  }

  @Get('approved')
  findApproved() {
    return this.sightingsService.findApproved();
  }

  @Get('pending')
  findPending() {
    return this.sightingsService.findPending();
  }

  @Get('rejected')
  findRejected() {
    return this.sightingsService.findRejected();
  }

  @Get('places')
  findPlaces() {
    return this.sightingsService.findPlaces();
  }

  @Post()
  create(@Body() createSightingDto: CreateSightingDto, @Request() request: { user: JwtPayload }) {
    return this.sightingsService.createAdmin(createSightingDto, request.user);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Request() request: { user: JwtPayload }) {
    return this.sightingsService.approve(id, request.user);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Request() request: { user: JwtPayload }) {
    return this.sightingsService.reject(id, request.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSightingDto: UpdateSightingDto,
    @Request() request: { user: JwtPayload },
  ) {
    return this.sightingsService.update(id, updateSightingDto, request.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sightingsService.remove(id);
  }
}