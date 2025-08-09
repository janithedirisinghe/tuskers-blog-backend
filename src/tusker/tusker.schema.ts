import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Tusker extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  age: string;

  @Prop()
  location: string;

  @Prop()
  status: string;

  @Prop()
  category: string;

  @Prop()
  description: string;

  @Prop([String])
  tags: string[];

  @Prop([String])
  imageUrl: string[];
}

export const TuskerSchema = SchemaFactory.createForClass(Tusker);