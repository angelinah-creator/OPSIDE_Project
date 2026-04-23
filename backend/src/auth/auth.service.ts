import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { Role, UserStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.role === Role.admin) {
      throw new BadRequestException('Impossible de créer un compte admin via inscription');
    }

    const email = dto.email.toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Un compte avec cet email existe déjà');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: dto.role,
        first_name: dto.first_name ?? null,
        last_name: dto.last_name ?? null,
        status: UserStatus.pending,
        email_verification_token: verificationToken,
      },
    });

    try {
      await this.mailService.sendVerificationEmail(user.email, verificationToken);
    } catch (error) {
      console.error('Error sending verification email:', error);
    }

    return {
      message: 'Inscription réussie. Veuillez vérifier votre e-mail pour activer votre compte.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`Login failed: User not found for email ${email}`);
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (user.status === UserStatus.pending) {
      throw new UnauthorizedException('Veuillez vérifier votre e-mail avant de vous connecter');
    }

    if (user.status !== UserStatus.active) {
      throw new UnauthorizedException('Votre compte est suspendu ou supprimé');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      console.log(`Login failed: Invalid password for user ${email}`);
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      message: 'Connexion réussie',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      ...tokens,
    };
  }

  async refreshTokens(userId: string, email: string, role: string, oldRefreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: oldRefreshToken },
      data: { is_revoked: true },
    });

    const tokens = await this.generateTokens(userId, email, role as Role);
    return {
      message: 'Tokens renouvelés',
      ...tokens,
    };
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: {
        user_id: userId,
        token: refreshToken,
      },
      data: { is_revoked: true },
    });

    return { message: 'Déconnexion réussie' };
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { user_id: userId },
      data: { is_revoked: true },
    });

    return { message: 'Déconnexion de tous les appareils réussie' };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { email_verification_token: token },
    });

    if (!user) {
      throw new BadRequestException('Jeton de vérification invalide ou expiré');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        status: UserStatus.active,
        email_verification_token: null,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      message: 'E-mail vérifié avec succès',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      ...tokens,
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        first_name: true,
        last_name: true,
        created_at: true,
        status: true,
        candidate: {
          select: {
            id: true,
            profile_completed: true,
            photo_url: true,
            speciality: true,
          },
        },
        client: {
          select: {
            id: true,
            company_name: true,
            logo_url: true,
          },
        },
      },
    });

    return user;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // Pour des raisons de sécurité, on ne dit pas si l'email existe ou non
      return { message: 'Si votre adresse e-mail est enregistrée, vous recevrez un lien de réinitialisation.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Expire dans 1 heure

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        reset_password_token: token,
        reset_password_expires: expires,
      },
    });

    try {
      await this.mailService.sendPasswordResetEmail(user.email, token);
    } catch (error) {
      console.error('Error sending reset password email:', error);
    }

    return { message: 'Si votre adresse e-mail est enregistrée, vous recevrez un lien de réinitialisation.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        reset_password_token: dto.token,
        reset_password_expires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Le jeton de réinitialisation est invalide ou a expiré');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        reset_password_token: null,
        reset_password_expires: null,
      },
    });

    // Optionnel: révoquer tous les refresh tokens existants pour forcer une nouvelle connexion partout
    await this.logoutAll(user.id);

    return { message: 'Votre mot de passe a été réinitialisé avec succès.' };
  }

  private async generateTokens(userId: string, email: string, role: Role) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        user_id: userId,
        expires_at: expiresAt,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
