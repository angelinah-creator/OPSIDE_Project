import { IsArray, IsEnum, IsNotEmpty, IsString, ArrayMaxSize } from 'class-validator';

export class StartTestDto {
  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  skills: string[];

  @IsEnum(['frontend', 'backend', 'fullstack', 'mobile', 'devops', 'data'])
  speciality: string;
}