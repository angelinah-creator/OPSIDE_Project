import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SkillCategory } from '@prisma/client';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: SkillCategory) {
    return this.prisma.skill.findMany({
      where: category ? { category } : {},
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    return this.prisma.skill.findUniqueOrThrow({ where: { id } });
  }
}
