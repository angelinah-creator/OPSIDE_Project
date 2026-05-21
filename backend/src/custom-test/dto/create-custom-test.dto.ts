import { IsArray, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateCustomTestDto {
  @IsUUID()
  candidate_id: string;

  @IsUUID()
  match_id: string;

  @IsArray()
  @IsString({ each: true })
  skills_tested: string[];

  @IsOptional()
  @IsEnum(['junior', 'mid', 'senior'])
  difficulty?: 'junior' | 'mid' | 'senior';

  @IsInt()
  @Min(30)
  @Max(120)
  duration_minutes: number;

  @IsOptional()
  @IsString()
  custom_instructions?: string;
}
