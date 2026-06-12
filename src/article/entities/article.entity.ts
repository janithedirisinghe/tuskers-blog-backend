import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ArticleStatus } from '../enums/article.enums';

@Schema()
export class Article extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

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

  @Prop({ default: 'standard' })
  articleType: string;

  @Prop({ type: String, enum: ArticleStatus, default: ArticleStatus.Approved })
  publishedStatus: ArticleStatus;

  @Prop({ default: false })
  botCreated: boolean;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
