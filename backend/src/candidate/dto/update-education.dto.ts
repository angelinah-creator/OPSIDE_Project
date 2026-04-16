import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { EducationLevel } from '@prisma/client';

export class UpdateEducationDto {
  @IsOptional()
  @IsString()
  school?: string;

  @IsOptional()
  @IsString()
  degree?: string;

  @IsOptional()
  @IsString()
  field?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  start_month?: number;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  start_year?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  end_month?: number;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  end_year?: number;

  @IsOptional()
  @IsBoolean()
  is_current?: boolean;

  @IsOptional()
  @IsEnum(EducationLevel)
  level?: EducationLevel;

  @IsOptional()
  @IsString()
  custom_level?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  skill_ids?: string[];
}
