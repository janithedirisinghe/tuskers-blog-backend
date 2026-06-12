import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SightingStatus, SightingType } from '../enums/sighting.enums';

@Schema({ _id: false })
export class GeoPoint {
  @Prop({ required: true, enum: ['Point'], default: 'Point' })
  type: 'Point';

  @Prop({ type: [Number], required: true })
  coordinates: [number, number];
}

export const GeoPointSchema = SchemaFactory.createForClass(GeoPoint);

@Schema()
export class Sighting extends Document {
  @Prop({ type: GeoPointSchema, required: true })
  location: GeoPoint;

  @Prop({ required: true, enum: Object.values(SightingType) })
  type: SightingType;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, enum: Object.values(SightingStatus), default: SightingStatus.Pending })
  status: SightingStatus;

  @Prop({ required: true, trim: true, default: 'anonymous' })
  submittedBy: string;

  @Prop({ trim: true })
  verifiedBy?: string;
}

export const SightingSchema = SchemaFactory.createForClass(Sighting);
SightingSchema.index({ location: '2dsphere' });