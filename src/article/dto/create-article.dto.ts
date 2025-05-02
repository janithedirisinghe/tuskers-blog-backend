import { IsString, IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  excerpt: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  image: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsArray()
  @IsOptional()
  tags: string[];

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  publishDate: string;
}
