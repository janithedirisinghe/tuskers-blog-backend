import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateSightingDto } from './dto/create-sighting.dto';
import { NearbySightingsQueryDto } from './dto/nearby-sightings-query.dto';
import { UpdateSightingDto } from './dto/update-sighting.dto';
import { SightingStatus } from './enums/sighting.enums';
import { Sighting } from './schemas/sighting.schema';

@Injectable()
export class SightingsService {
  constructor(@InjectModel(Sighting.name) private readonly sightingModel: Model<Sighting>) {}

  async create(createSightingDto: CreateSightingDto): Promise<Sighting> {
    return this.createSightingRecord(createSightingDto, {
      status: SightingStatus.Pending,
      submittedBy: createSightingDto.submittedBy?.trim() || 'anonymous',
    });
  }

  async createAdmin(createSightingDto: CreateSightingDto, admin: JwtPayload): Promise<Sighting> {
    return this.createSightingRecord(createSightingDto, {
      status: SightingStatus.Approved,
      submittedBy: createSightingDto.submittedBy?.trim() || admin.sub,
      verifiedBy: admin.sub,
    });
  }

  async findApproved(): Promise<Sighting[]> {
    return this.findByStatus(SightingStatus.Approved);
  }

  async findPending(): Promise<Sighting[]> {
    return this.findByStatus(SightingStatus.Pending);
  }

  async findRejected(): Promise<Sighting[]> {
    return this.findByStatus(SightingStatus.Rejected);
  }

  async findAll(): Promise<Sighting[]> {
    return this.sightingModel.find().sort({ date: -1 }).exec();
  }

  async findPlaces(): Promise<Sighting[]> {
    return this.sightingModel
      .find({ status: SightingStatus.Approved })
      .select('location type description date status submittedBy verifiedBy')
      .sort({ date: -1 })
      .exec();
  }

  async findNearby(query: NearbySightingsQueryDto) {
    return this.sightingModel.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [query.lng, query.lat],
          },
          distanceField: 'distanceKm',
          spherical: true,
          maxDistance: query.radius * 1000,
          distanceMultiplier: 0.001,
          query: {
            status: SightingStatus.Approved,
          },
        },
      },
      {
        $sort: {
          distanceKm: 1,
        },
      },
    ]).exec();
  }

  async approve(id: string, admin: JwtPayload): Promise<Sighting> {
    return this.updateModerationStatus(id, SightingStatus.Approved, admin.sub);
  }

  async reject(id: string, admin: JwtPayload): Promise<Sighting> {
    return this.updateModerationStatus(id, SightingStatus.Rejected, admin.sub);
  }

  async remove(id: string): Promise<Sighting> {
    const deletedSighting = await this.sightingModel.findByIdAndDelete(id).exec();
    if (!deletedSighting) {
      throw new NotFoundException(`Sighting #${id} not found`);
    }
    return deletedSighting;
  }

  async update(id: string, updateSightingDto: UpdateSightingDto, admin: JwtPayload): Promise<Sighting> {
    const existingSighting = await this.sightingModel.findById(id).exec();
    if (!existingSighting) {
      throw new NotFoundException(`Sighting #${id} not found`);
    }

    const hasLongitude = updateSightingDto.longitude !== undefined;
    const hasLatitude = updateSightingDto.latitude !== undefined;
    if (hasLongitude !== hasLatitude) {
      throw new BadRequestException('Longitude and latitude must be provided together');
    }

    const updatePayload: Record<string, unknown> = {
      verifiedBy: admin.sub,
    };

    if (updateSightingDto.type !== undefined) {
      updatePayload.type = updateSightingDto.type;
    }

    if (updateSightingDto.description !== undefined) {
      updatePayload.description = updateSightingDto.description;
    }

    if (updateSightingDto.date !== undefined) {
      updatePayload.date = new Date(updateSightingDto.date);
    }

    if (updateSightingDto.submittedBy !== undefined) {
      updatePayload.submittedBy = updateSightingDto.submittedBy.trim() || 'anonymous';
    }

    if (hasLongitude && hasLatitude) {
      updatePayload.location = {
        type: 'Point',
        coordinates: [updateSightingDto.longitude, updateSightingDto.latitude],
      };
    }

    const updatedSighting = await this.sightingModel
      .findByIdAndUpdate(id, { $set: updatePayload }, { new: true, runValidators: true })
      .exec();

    if (!updatedSighting) {
      throw new NotFoundException(`Sighting #${id} not found`);
    }

    return updatedSighting;
  }

  private async createSightingRecord(
    createSightingDto: CreateSightingDto,
    options: { status: SightingStatus; submittedBy: string; verifiedBy?: string },
  ): Promise<Sighting> {
    const newSighting = new this.sightingModel({
      location: {
        type: 'Point',
        coordinates: [createSightingDto.longitude, createSightingDto.latitude],
      },
      type: createSightingDto.type,
      description: createSightingDto.description,
      date: new Date(createSightingDto.date),
      status: options.status,
      submittedBy: options.submittedBy,
      verifiedBy: options.verifiedBy,
    });

    return newSighting.save();
  }

  private async findByStatus(status: SightingStatus): Promise<Sighting[]> {
    return this.sightingModel.find({ status }).sort({ date: -1 }).exec();
  }

  private async updateModerationStatus(id: string, status: SightingStatus, verifiedBy: string): Promise<Sighting> {
    const updatedSighting = await this.sightingModel
      .findByIdAndUpdate(
        id,
        {
          status,
          verifiedBy,
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();

    if (!updatedSighting) {
      throw new NotFoundException(`Sighting #${id} not found`);
    }

    return updatedSighting;
  }
}