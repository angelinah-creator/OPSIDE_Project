import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCandidatureDto {
  @IsUUID()
  @IsNotEmpty()
  job_offer_id: string;

  @IsString()
  @IsOptional()
  message?: string;
}
