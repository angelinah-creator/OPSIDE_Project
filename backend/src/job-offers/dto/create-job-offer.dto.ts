import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { Speciality, WorkType, JobOfferStatus } from '@prisma/client';

export class CreateJobOfferDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(Speciality)
  @IsNotEmpty()
  speciality: Speciality;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  skills: string[];

  @IsInt()
  @IsOptional()
  experience_min?: number;

  @IsNumber()
  @IsNotEmpty()
  tjm_client: number;

  @IsString()
  @IsOptional()
  contract_duration?: string;

  @IsEnum(WorkType)
  @IsNotEmpty()
  work_type: WorkType;

  @IsString()
  @IsOptional()
  timezone_preference?: string;

  @IsString()
  @IsOptional()
  start_date?: string;

  @IsEnum(JobOfferStatus)
  @IsOptional()
  status?: JobOfferStatus;

  @IsBoolean()
  @IsOptional()
  is_anonymous?: boolean;
}
