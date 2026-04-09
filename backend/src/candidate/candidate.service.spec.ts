import { Test, TestingModule } from '@nestjs/testing';
import { CandidateService } from './candidate.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

const mockPrismaService = {
  user: { findUnique: jest.fn() },
  candidateProfile: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  candidateSkill: { deleteMany: jest.fn() },
  skill: { findMany: jest.fn() },
  experience: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  experienceSkill: { deleteMany: jest.fn() },
  experienceMedia: {
    create: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
  education: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  educationSkill: { deleteMany: jest.fn() },
  educationMedia: {
    create: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
};

const mockUploadService = {
  uploadImage: jest.fn(),
  uploadMedia: jest.fn(),
  deleteFile: jest.fn(),
};

const candidateUser = {
  id: 'user-1',
  email: 'candidate@test.com',
  role: 'candidat',
  status: 'active',
};

const candidateProfile = {
  id: 'profile-1',
  user_id: 'user-1',
  country: 'Madagascar',
  speciality: 'backend',
  experience_years: 3,
  daily_rate: 50,
  currency: 'EUR',
  availability: 'immediate',
  profile_completed: true,
};

describe('CandidateService', () => {
  let service: CandidateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidateService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UploadService, useValue: mockUploadService },
      ],
    }).compile();

    service = module.get<CandidateService>(CandidateService);
    jest.clearAllMocks();
  });

  describe('createProfile', () => {
    const dto = {
      country: 'Madagascar',
      speciality: 'backend' as any,
      experience_years: 3,
      daily_rate: 50,
      currency: 'EUR' as any,
      availability: 'immediate' as any,
      skill_ids: [],
    };

    it('devrait créer un profil candidat avec succès', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(candidateUser);
      mockPrismaService.candidateProfile.findUnique.mockResolvedValue(null);
      mockPrismaService.skill.findMany.mockResolvedValue([]);
      mockPrismaService.candidateProfile.create.mockResolvedValue({
        ...candidateProfile,
        candidate_skills: [],
        user: candidateUser,
      });

      const result = await service.createProfile('user-1', dto);

      expect(result.message).toBe('Profil créé avec succès');
      expect(mockPrismaService.candidateProfile.create).toHaveBeenCalled();
    });

    it('devrait lever une erreur si le profil existe déjà', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(candidateUser);
      mockPrismaService.candidateProfile.findUnique.mockResolvedValue(candidateProfile);

      await expect(service.createProfile('user-1', dto)).rejects.toThrow(ConflictException);
    });

    it('devrait interdire la création si l\'utilisateur n\'est pas candidat', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ ...candidateUser, role: 'client' });

      await expect(service.createProfile('user-1', dto)).rejects.toThrow(ForbiddenException);
    });

    it('devrait lever une erreur si des skill_ids sont invalides', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(candidateUser);
      mockPrismaService.candidateProfile.findUnique.mockResolvedValue(null);
      mockPrismaService.skill.findMany.mockResolvedValue([]);

      await expect(
        service.createProfile('user-1', { ...dto, skill_ids: ['invalid-uuid'] }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMyProfile', () => {
    it('devrait retourner le profil du candidat', async () => {
      mockPrismaService.candidateProfile.findUnique.mockResolvedValue({
        ...candidateProfile,
        candidate_skills: [],
        experiences: [],
        educations: [],
        user: candidateUser,
      });

      const result = await service.getMyProfile('user-1');

      expect(result.user_id).toBe('user-1');
    });

    it('devrait lever une erreur si le profil n\'existe pas', async () => {
      mockPrismaService.candidateProfile.findUnique.mockResolvedValue(null);

      await expect(service.getMyProfile('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createExperience', () => {
    const expDto = {
      title: 'Développeur NestJS',
      employment_type: 'temps_plein' as any,
      company: 'Tech Corp',
      start_month: 1,
      start_year: 2022,
      skill_ids: [],
    };

    it('devrait créer une expérience avec succès', async () => {
      mockPrismaService.candidateProfile.findUnique.mockResolvedValue(candidateProfile);
      mockPrismaService.skill.findMany.mockResolvedValue([]);
      mockPrismaService.experience.create.mockResolvedValue({
        id: 'exp-1',
        ...expDto,
        candidate_id: 'profile-1',
        experience_skills: [],
        experience_medias: [],
      });

      const result = await service.createExperience('user-1', expDto);

      expect(result.message).toBe('Expérience ajoutée avec succès');
      expect(result.experience.title).toBe('Développeur NestJS');
    });

    it('devrait lever une erreur si le profil candidat n\'existe pas', async () => {
      mockPrismaService.candidateProfile.findUnique.mockResolvedValue(null);

      await expect(service.createExperience('user-1', expDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteExperience', () => {
    it('devrait supprimer une expérience', async () => {
      mockPrismaService.candidateProfile.findUnique.mockResolvedValue(candidateProfile);
      mockPrismaService.experience.findFirst.mockResolvedValue({ id: 'exp-1' });
      mockPrismaService.experience.delete.mockResolvedValue({});

      const result = await service.deleteExperience('user-1', 'exp-1');

      expect(result.message).toBe('Expérience supprimée avec succès');
    });

    it('devrait lever une erreur si l\'expérience n\'appartient pas au candidat', async () => {
      mockPrismaService.candidateProfile.findUnique.mockResolvedValue(candidateProfile);
      mockPrismaService.experience.findFirst.mockResolvedValue(null);

      await expect(service.deleteExperience('user-1', 'exp-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createEducation', () => {
    const eduDto = {
      school: 'École Polytechnique',
      start_month: 9,
      start_year: 2018,
      skill_ids: [],
    };

    it('devrait créer une formation avec succès', async () => {
      mockPrismaService.candidateProfile.findUnique.mockResolvedValue(candidateProfile);
      mockPrismaService.skill.findMany.mockResolvedValue([]);
      mockPrismaService.education.create.mockResolvedValue({
        id: 'edu-1',
        ...eduDto,
        candidate_id: 'profile-1',
        education_skills: [],
        education_medias: [],
      });

      const result = await service.createEducation('user-1', eduDto);

      expect(result.message).toBe('Formation ajoutée avec succès');
    });
  });

  describe('uploadPhoto', () => {
    it('devrait uploader une photo de profil', async () => {
      mockPrismaService.candidateProfile.findUnique.mockResolvedValue(candidateProfile);
      mockUploadService.uploadImage.mockResolvedValue({
        url: 'https://cloudinary.com/photo.jpg',
        public_id: 'public-id-1',
      });
      mockPrismaService.candidateProfile.update.mockResolvedValue({
        ...candidateProfile,
        photo_url: 'https://cloudinary.com/photo.jpg',
      });

      const mockFile = { buffer: Buffer.from(''), mimetype: 'image/jpeg', size: 1000 } as any;
      const result = await service.uploadPhoto('user-1', mockFile);

      expect(result.message).toBe('Photo uploadée avec succès');
      expect(result.photo_url).toBe('https://cloudinary.com/photo.jpg');
    });
  });
});
