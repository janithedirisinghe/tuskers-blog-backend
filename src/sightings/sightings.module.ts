import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminRoleGuard } from '../auth/admin-role.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminSightingsController } from './admin-sightings.controller';
import { Sighting, SightingSchema } from './schemas/sighting.schema';
import { SightingsController } from './sightings.controller';
import { SightingsService } from './sightings.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Sighting.name, schema: SightingSchema }])],
  controllers: [SightingsController, AdminSightingsController],
  providers: [SightingsService, AdminRoleGuard, JwtAuthGuard],
  exports: [SightingsService],
})
export class SightingsModule {}