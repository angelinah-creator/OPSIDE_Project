import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
  })
  password: string;

  @IsEnum([Role.candidat, Role.client], {
    message: 'Le rôle doit être candidat ou client',
  })
  role: Role;

  @IsString()
  @IsNotEmpty({ message: 'Le prénom est obligatoire' })
  first_name: string;

  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  last_name: string;
}
