import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Article extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  excerpt: string;

  @Prop({ required: true })
  content: string;

  @Prop([String])
  images: string[];

  @Prop({ required: true })
  category: string;

  @Prop([String])
  tags: string[];

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  publishDate: string;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
