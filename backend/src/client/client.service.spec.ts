import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from './client.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';

const mockPrismaService = {
  user: { findUnique: jest.fn() },
  clientProfile: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockUploadService = {
  uploadImage: jest.fn(),
  deleteFile: jest.fn(),
};

const clientUser = { id: 'user-2', email: 'client@test.com', role: 'client', status: 'active' };
const clientProfile = {
  id: 'client-profile-1',
  user_id: 'user-2',
  company_name: 'Tech Corp',
  country: 'France',
  contact_name: 'Marie Dupont',
  contact_email: 'marie@techcorp.com',
};

describe('ClientService', () => {
  let service: ClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UploadService, useValue: mockUploadService },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
    jest.clearAllMocks();
  });

  describe('createProfile', () => {
    const dto = {
      company_name: 'Tech Corp',
      country: 'France',
      contact_name: 'Marie Dupont',
      contact_email: 'marie@techcorp.com',
    };

    it('devrait créer un profil client avec succès', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(clientUser);
      mockPrismaService.clientProfile.findUnique.mockResolvedValue(null);
      mockPrismaService.clientProfile.create.mockResolvedValue({
        ...clientProfile,
        user: clientUser,
      });

      const result = await service.createProfile('user-2', dto);

      expect(result.message).toBe('Profil client créé avec succès');
      expect(result.profile.company_name).toBe('Tech Corp');
    });

    it('devrait interdire si l\'utilisateur n\'est pas client', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ ...clientUser, role: 'candidat' });

      await expect(service.createProfile('user-2', dto)).rejects.toThrow(ForbiddenException);
    });

    it('devrait lever une erreur si le profil existe déjà', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(clientUser);
      mockPrismaService.clientProfile.findUnique.mockResolvedValue(clientProfile);

      await expect(service.createProfile('user-2', dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('getMyProfile', () => {
    it('devrait retourner le profil client', async () => {
      mockPrismaService.clientProfile.findUnique.mockResolvedValue({
        ...clientProfile,
        user: clientUser,
      });

      const result = await service.getMyProfile('user-2');

      expect(result.user_id).toBe('user-2');
    });

    it('devrait lever une erreur si le profil n\'existe pas', async () => {
      mockPrismaService.clientProfile.findUnique.mockResolvedValue(null);

      await expect(service.getMyProfile('user-2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('devrait mettre à jour le profil client', async () => {
      mockPrismaService.clientProfile.findUnique.mockResolvedValue(clientProfile);
      mockPrismaService.clientProfile.update.mockResolvedValue({
        ...clientProfile,
        company_name: 'New Corp',
        user: clientUser,
      });

      const result = await service.updateProfile('user-2', { company_name: 'New Corp' });

      expect(result.message).toBe('Profil client mis à jour');
      expect(result.profile.company_name).toBe('New Corp');
    });
  });

  describe('uploadLogo', () => {
    it('devrait uploader le logo et supprimer l\'ancien', async () => {
      mockPrismaService.clientProfile.findUnique.mockResolvedValue({
        ...clientProfile,
        logo_public_id: 'old-public-id',
      });
      mockUploadService.deleteFile.mockResolvedValue(undefined);
      mockUploadService.uploadImage.mockResolvedValue({
        url: 'https://cloudinary.com/logo.png',
        public_id: 'new-public-id',
      });
      mockPrismaService.clientProfile.update.mockResolvedValue({
        ...clientProfile,
        logo_url: 'https://cloudinary.com/logo.png',
        logo_public_id: 'new-public-id',
      });

      const mockFile = { buffer: Buffer.from(''), mimetype: 'image/png', size: 1000 } as any;
      const result = await service.uploadLogo('user-2', mockFile);

      expect(mockUploadService.deleteFile).toHaveBeenCalledWith('old-public-id');
      expect(result.message).toBe('Logo uploadé avec succès');
    });
  });
});
