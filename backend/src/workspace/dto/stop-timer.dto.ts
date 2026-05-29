import { IsString, IsOptional } from 'class-validator';

export class StopTimerDto {
  @IsString()
  sessionId: string;

  @IsOptional()
  @IsString()
  note?: string;
}
