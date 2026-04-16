import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsEmail,
} from 'class-validator';
import { CompanySize, Country } from '@prisma/client';

export class CreateClientProfileDto {
  @IsString()
  @IsNotEmpty()
  company_name: string;

  @IsOptional()
  @IsEnum(CompanySize)
  company_size?: CompanySize;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsEnum(Country)
  @IsNotEmpty()
  country: Country;

  @IsOptional()
  @IsString()
  city?: string;

  @IsString()
  @IsNotEmpty()
  contact_name: string;

  @IsEmail()
  @IsNotEmpty()
  contact_email: string;

  @IsOptional()
  @IsString()
  contact_phone?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  interview_availability?: string;
}
