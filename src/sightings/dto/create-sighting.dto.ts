import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { SightingType } from '../enums/sighting.enums';

export class CreateSightingDto {
  @IsEnum(SightingType)
  type: SightingType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  date: string;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  submittedBy?: string;
}