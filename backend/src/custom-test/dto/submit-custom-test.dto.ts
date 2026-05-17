import { IsObject } from 'class-validator';

export class SubmitCustomTestDto {
  @IsObject()
  answers: Record<string, any>;
}
