import { IsString, IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { TimerStatus } from '@prisma/client';

export class CreateTimesheetDto {
  @IsString()
  match_id: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  start_time: string;

  @IsOptional()
  @IsDateString()
  end_time?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsEnum(TimerStatus)
  status?: TimerStatus;
}

export class UpdateTimesheetDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  start_time?: string;

  @IsOptional()
  @IsDateString()
  end_time?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsEnum(TimerStatus)
  status?: TimerStatus;
}

export class StartTimerDto {
  @IsString()
  match_id: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class GetReportDto {
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  match_id?: string;

  @IsOptional()
  @IsString()
  user_id?: string; // Pour admin/manager ou client (vérifiera que le user fait partie du match)
}
