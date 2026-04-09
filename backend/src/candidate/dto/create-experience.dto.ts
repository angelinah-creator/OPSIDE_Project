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
  Min,
} from 'class-validator';
import { EmploymentType } from '@prisma/client';

export class CreateExperienceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(EmploymentType)
  employment_type: EmploymentType;

  @IsString()
  @IsNotEmpty()
  company: string;

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
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  skill_ids?: string[];
}
