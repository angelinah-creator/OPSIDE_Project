import { Test, TestingModule } from '@nestjs/testing';
import { SkillsService } from './skills.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  skill: {
    findMany: jest.fn(),
    findUniqueOrThrow: jest.fn(),
  },
};

describe('SkillsService', () => {
  let service: SkillsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('devrait retourner toutes les compétences', async () => {
      const skills = [
        { id: 'skill-1', name: 'React', category: 'frontend' },
        { id: 'skill-2', name: 'NestJS', category: 'backend' },
      ];
      mockPrismaService.skill.findMany.mockResolvedValue(skills);

      const result = await service.findAll();

      expect(result).toEqual(skills);
      expect(mockPrismaService.skill.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      });
    });

    it('devrait filtrer par catégorie', async () => {
      const frontendSkills = [{ id: 'skill-1', name: 'React', category: 'frontend' }];
      mockPrismaService.skill.findMany.mockResolvedValue(frontendSkills);

      const result = await service.findAll('frontend' as any);

      expect(mockPrismaService.skill.findMany).toHaveBeenCalledWith({
        where: { category: 'frontend' },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      });
      expect(result.length).toBe(1);
    });
  });

  describe('findOne', () => {
    it('devrait retourner une compétence par ID', async () => {
      const skill = { id: 'skill-1', name: 'React', category: 'frontend' };
      mockPrismaService.skill.findUniqueOrThrow.mockResolvedValue(skill);

      const result = await service.findOne('skill-1');

      expect(result).toEqual(skill);
    });
  });
});
