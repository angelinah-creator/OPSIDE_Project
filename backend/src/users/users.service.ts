import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(role?: string) {
    return this.prisma.user.findMany({
      where: role ? { role: role as any } : {},
      select: {
        id: true,
        email: true,
        role: true,
        first_name: true,
        last_name: true,
        created_at: true,
        status: true,
        candidate: { select: { id: true, profile_completed: true, photo_url: true, speciality: true } },
        client: { select: { id: true, company_name: true, logo_url: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        first_name: true,
        last_name: true,
        created_at: true,
        status: true,
        candidate: {
          include: {
            candidate_skills: { include: { skill: true } },
            experiences: {
              include: {
                experience_skills: { include: { skill: true } },
                experience_medias: true,
              },
            },
            educations: {
              include: {
                education_skills: { include: { skill: true } },
                education_medias: true,
              },
            },
          },
        },
        client: true,
      },
    });

    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  async updateStatus(id: string, status: UserStatus) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    if (user.role === 'admin') {
      throw new ForbiddenException('Impossible de modifier le statut d\'un admin');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        role: true,
        first_name: true,
        last_name: true,
        status: true,
      },
    });

    return { message: `Statut mis à jour: ${status}`, user: updated };
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    if (user.role === 'admin') {
      throw new ForbiddenException('Impossible de supprimer un admin');
    }

    await this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.deleted },
    });

    return { message: 'Utilisateur supprimé (soft delete)' };
  }
}
