import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string, category?: string) {
    return this.prisma.skill.findMany({
      where: {
        AND: [
          userId ? { OR: [{ owner_id: null }, { owner_id: userId }] } : { owner_id: null },
          category ? { category } : {},
        ],
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async create(userId: string, data: { name: string; category: string }) {
    return this.prisma.skill.create({
      data: {
        ...data,
        is_custom: true,
        owner_id: userId,
      },
    });
  }

  async update(userId: string, id: string, data: { name?: string; category?: string }) {
    const skill = await this.prisma.skill.findUniqueOrThrow({ where: { id } });
    if (skill.owner_id !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier cette compétence.');
    }
    return this.prisma.skill.update({
      where: { id },
      data,
    });
  }

  async remove(userId: string, id: string) {
    const skill = await this.prisma.skill.findUniqueOrThrow({ where: { id } });
    if (skill.owner_id !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer cette compétence.');
    }
    return this.prisma.skill.delete({ where: { id } });
  }

  async findOne(id: string) {
    return this.prisma.skill.findUniqueOrThrow({ where: { id } });
  }
}
