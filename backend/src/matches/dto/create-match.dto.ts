import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateMatchDto {
  @IsUUID()
  @IsNotEmpty()
  candidate_id: string;

  @IsUUID()
  @IsOptional()
  job_offer_id?: string;
}
