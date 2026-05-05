import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';

@Injectable()
export class JobOffersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateJobOfferDto) {
    const { skills, ...offerData } = dto;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'client') {
      throw new ForbiddenException('Seuls les clients peuvent créer une offre');
    }

    const resolvedSkills: any[] = [];
    if (skills && skills.length > 0) {
      for (const skillName of skills) {
        let skill = await this.prisma.skill.findFirst({ where: { name: { equals: skillName, mode: 'insensitive' } } });
        if (!skill) {
           skill = await this.prisma.skill.create({
             data: { name: skillName, category: 'other', is_custom: true }
           });
        }
        resolvedSkills.push(skill);
      }
    }

    const offer = await this.prisma.jobOffer.create({
      data: {
        ...offerData,
        client_id: userId,
        skills_required: {
          create: resolvedSkills.map(s => ({
            skill: { connect: { id: s.id } }
          }))
        }
      },
      include: {
        skills_required: {
          include: { skill: true }
        }
      }
    });

    return { message: 'Offre créée avec succès', offer };
  }

  async findAllForCandidates() {
    const offers = await this.prisma.jobOffer.findMany({
      where: { status: 'active' },
      orderBy: { created_at: 'desc' },
      include: {
        skills_required: {
          include: { skill: true }
        }
      }
    });

    return offers.map(offer => ({
      ...offer,
      skills: offer.skills_required.map(s => s.skill.name)
    }));
  }

  async findAllForClient(userId: string) {
    const offers = await this.prisma.jobOffer.findMany({
      where: { client_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        skills_required: {
          include: { skill: true }
        }
      }
    });

    return offers.map(offer => ({
      ...offer,
      skills: offer.skills_required.map(s => s.skill.name)
    }));
  }

  async findOne(id: string) {
    const offer = await this.prisma.jobOffer.findUnique({
      where: { id },
      include: {
        skills_required: {
          include: { skill: true }
        }
      }
    });

    if (!offer) {
      throw new NotFoundException('Offre non trouvée');
    }

    return {
      ...offer,
      skills: offer.skills_required.map(s => s.skill.name)
    };
  }

  async update(id: string, userId: string, dto: UpdateJobOfferDto) {
    const offer = await this.prisma.jobOffer.findUnique({ where: { id } });
    if (!offer) {
      throw new NotFoundException('Offre non trouvée');
    }

    if (offer.client_id !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres offres');
    }

    const { skills, ...offerData } = dto;
    
    if (skills) {
      await this.prisma.jobOfferSkill.deleteMany({ where: { job_offer_id: id } });
      
      const resolvedSkills: any[] = [];
      for (const skillName of skills) {
        let skill = await this.prisma.skill.findFirst({ where: { name: { equals: skillName, mode: 'insensitive' } } });
        if (!skill) {
           skill = await this.prisma.skill.create({
             data: { name: skillName, category: 'other', is_custom: true }
           });
        }
        resolvedSkills.push(skill);
      }

      await this.prisma.jobOffer.update({
        where: { id },
        data: {
          ...offerData,
          skills_required: {
            create: resolvedSkills.map(s => ({
              skill: { connect: { id: s.id } }
            }))
          }
        }
      });
    } else {
      await this.prisma.jobOffer.update({
        where: { id },
        data: offerData
      });
    }

    return this.findOne(id);
  }

  async remove(id: string, userId: string) {
    const offer = await this.prisma.jobOffer.findUnique({ where: { id } });
    if (!offer) {
      throw new NotFoundException('Offre non trouvée');
    }

    if (offer.client_id !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres offres');
    }

    await this.prisma.jobOffer.update({
      where: { id },
      data: { status: 'closed' }
    });

    return { message: 'Offre clôturée' };
  }
}
