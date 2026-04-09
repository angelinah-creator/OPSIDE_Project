import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  },
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('test_secret'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'Password123',
      role: 'candidat' as any,
      first_name: 'Jean',
      last_name: 'Dupont',
    };

    it('devrait inscrire un candidat avec succès', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'uuid-1',
        ...registerDto,
        password: 'hashed',
        created_at: new Date(),
        status: 'active',
      });
      mockJwtService.signAsync
        .mockResolvedValueOnce('access_token')
        .mockResolvedValueOnce('refresh_token');
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(result.message).toBe('Inscription réussie');
      expect(result.access_token).toBe('access_token');
      expect(result.refresh_token).toBe('refresh_token');
      expect(result.user.email).toBe(registerDto.email);
    });

    it('devrait lever une erreur si l\'email existe déjà', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('devrait interdire l\'inscription avec le rôle admin', async () => {
      await expect(
        service.register({ ...registerDto, role: 'admin' as any }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('devrait connecter un utilisateur avec succès', async () => {
      const hashedPassword = await bcrypt.hash('Password123', 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'uuid-1',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'candidat',
        first_name: 'Jean',
        last_name: 'Dupont',
        status: 'active',
      });
      mockJwtService.signAsync
        .mockResolvedValueOnce('access_token')
        .mockResolvedValueOnce('refresh_token');
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.login({
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(result.message).toBe('Connexion réussie');
      expect(result.access_token).toBeDefined();
    });

    it('devrait refuser si l\'email est inconnu', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('devrait refuser si le mot de passe est incorrect', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPass1', 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'uuid-1',
        email: 'test@example.com',
        password: hashedPassword,
        status: 'active',
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'WrongPass1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('devrait refuser un compte suspendu', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'uuid-1',
        email: 'test@example.com',
        password: 'hashed',
        status: 'suspended',
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('devrait révoquer le refresh token', async () => {
      mockPrismaService.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.logout('user-id', 'refresh_token_value');

      expect(result.message).toBe('Déconnexion réussie');
      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { user_id: 'user-id', token: 'refresh_token_value' },
        data: { is_revoked: true },
      });
    });
  });

  describe('logoutAll', () => {
    it('devrait révoquer tous les refresh tokens de l\'utilisateur', async () => {
      mockPrismaService.refreshToken.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.logoutAll('user-id');

      expect(result.message).toBe('Déconnexion de tous les appareils réussie');
      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { user_id: 'user-id' },
        data: { is_revoked: true },
      });
    });
  });
});
