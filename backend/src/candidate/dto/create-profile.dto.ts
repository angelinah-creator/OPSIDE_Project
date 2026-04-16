import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  IsArray,
  IsUUID,
} from 'class-validator';
import { Speciality, Currency, Availability } from '@prisma/client';

export class CreateCandidateProfileDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsEnum(Speciality)
  speciality: Speciality;

  @IsOptional()
  @IsString()
  custom_speciality?: string;

  @IsInt()
  @Min(0)
  @Max(50)
  experience_years: number;

  @IsNumber()
  @Min(0)
  daily_rate: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(Availability)
  availability: Availability;

  @IsOptional()
  @IsUrl()
  linkedin_url?: string;

  @IsOptional()
  @IsUrl()
  portfolio_url?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  skill_ids: string[];
}
