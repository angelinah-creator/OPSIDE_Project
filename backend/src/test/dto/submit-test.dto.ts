import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class SubmitTestDto {
  @IsUUID()
  @IsNotEmpty()
  testId: string;

  @IsArray()
  answers: any[];
}