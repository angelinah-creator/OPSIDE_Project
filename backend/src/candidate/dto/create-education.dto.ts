import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { EducationLevel } from '@prisma/client';

export class CreateEducationDto {
  @IsString()
  @IsNotEmpty()
  school: string;

  @IsOptional()
  @IsString()
  degree?: string;

  @IsOptional()
  @IsString()
  field?: string;

  @IsInt()
  @Min(1)
  @Max(12)
  start_month: number;

  @IsInt()
  @Min(1900)
  @Max(2100)
  start_year: number;

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
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  skill_ids?: string[];
}
