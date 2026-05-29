import { IsString, IsOptional } from 'class-validator';

export class StartTimerDto {
  @IsString()
  matchId: string;

  @IsOptional()
  @IsString()
  note?: string;
}
