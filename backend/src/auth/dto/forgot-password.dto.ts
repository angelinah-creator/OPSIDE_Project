import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Veuillez saisir une adresse e-mail valide' })
  @IsNotEmpty({ message: 'L\'adresse e-mail est requise' })
  email: string;
}
