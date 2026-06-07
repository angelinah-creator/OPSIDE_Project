import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerificationDto {
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty()
  email: string;
}
