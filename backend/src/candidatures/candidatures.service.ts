import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCandidatureDto } from './dto/create-candidature.dto';
import { CandidatureStatus, NotificationType, Role } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class CandidaturesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private mailService: MailService,
  ) {}

  async create(candidateId: string, dto: CreateCandidatureDto) {
    // Vérifier si le candidat a déjà postulé
    const existing = await this.prisma.candidature.findFirst({
      where: {
        candidate_id: candidateId,
        job_offer_id: dto.job_offer_id,
      },
    });

    if (existing) {
      throw new ConflictException('Vous avez déjà postulé à cette offre.');
    }

    const jobOffer = await this.prisma.jobOffer.findUnique({
      where: { id: dto.job_offer_id },
      include: { client: true },
    });

    if (!jobOffer) {
      throw new NotFoundException('Offre introuvable.');
    }

    const candidature = await this.prisma.candidature.create({
      data: {
        candidate_id: candidateId,
        job_offer_id: dto.job_offer_id,
        message: dto.message,
      },
      include: {
        candidate: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    // Incrémenter le compteur de candidatures sur l'offre
    await this.prisma.jobOffer.update({
      where: { id: dto.job_offer_id },
      data: { applications_count: { increment: 1 } },
    });

    // Notification au client
    const candidateName = `${candidature.candidate.first_name} ${candidature.candidate.last_name}`;
    await this.notificationsService.create({
      user_id: jobOffer.client_id,
      type: NotificationType.new_application,
      title: 'Nouvelle candidature reçue',
      message: `${candidateName} a postulé à votre offre : ${jobOffer.title}`,
      link: `/client/dashboard`,
    });

    // Notification au candidat
    await this.notificationsService.create({
      user_id: candidateId,
      type: NotificationType.new_application,
      title: 'Candidature envoyée',
      message: `Votre candidature pour le poste "${jobOffer.title}" a bien été transmise au client.`,
      link: `/candidat/dashboard`,
    });

    return candidature;
  }

  async findAllForCandidate(candidateId: string) {
    return this.prisma.candidature.findMany({
      where: { candidate_id: candidateId },
      include: {
        job_offer: {
          include: {
            client: {
              include: {
                client: true,
              },
            },
          },
        },
      },
      orderBy: { applied_at: 'desc' },
    });
  }

  async findAllForClient(clientId: string) {
    return this.prisma.candidature.findMany({
      where: {
        job_offer: {
          client_id: clientId,
        },
      },
      include: {
        candidate: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            candidate: {
              include: {
                experiences: true,
                educations: true,
                candidate_skills: { include: { skill: true } }
              }
            },
          },
        },
        job_offer: true,
      },
      orderBy: { applied_at: 'desc' },
    });
  }

  async updateStatus(id: string, clientId: string, status: CandidatureStatus) {
    const candidature = await this.prisma.candidature.findUnique({
      where: { id },
      include: {
        job_offer: true,
        candidate: true,
      },
    });

    if (!candidature) {
      throw new NotFoundException('Candidature introuvable.');
    }

    if (candidature.job_offer.client_id !== clientId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier cette candidature.');
    }

    const updatedCandidature = await this.prisma.candidature.update({
      where: { id },
      data: { status },
    });

    // Logique si accepté (Match) ou refusé
    if (status === CandidatureStatus.matched) {
      // Créer un Match automatique CONFIRMÉ (plus besoin de confirmation candidat selon demande USER)
      const match = await this.prisma.match.create({
        data: {
          candidate_id: candidature.candidate_id,
          client_id: clientId,
          job_offer_id: candidature.job_offer_id,
          status: 'confirmed',
          initiated_by: 'candidate',
          matched_at: new Date(),
        },
        include: {
          client: { include: { client: true } },
          candidate: true,
        }
      });

      // Notification de match confirmé au candidat
      await this.notificationsService.create({
        user_id: candidature.candidate_id,
        type: NotificationType.match_confirmed,
        title: 'Match Matché !',
        message: `Félicitations ! Le client a accepté votre candidature pour : ${candidature.job_offer.title}. Votre match est confirmé.`,
        link: `/candidat/dashboard`,
      });

      // Email automatique de match confirmé
      try {
        await this.mailService.sendMatchConfirmationEmail(
          candidature.candidate.email,
          'candidate',
          candidature.job_offer.client_id // Nom du client à récupérer idéalement
        );
      } catch (e) {}
    } else if (status === CandidatureStatus.rejected) {
      await this.notificationsService.create({
        user_id: candidature.candidate_id,
        type: NotificationType.match_rejected,
        title: 'Candidature refusée',
        message: `Votre candidature pour l'offre ${candidature.job_offer.title} n'a pas été retenue.`,
      });
      
      // Email automatique de refus
      try {
        await this.mailService.sendCandidatureRejectionEmail(
          candidature.candidate.email,
          candidature.job_offer.title
        );
      } catch (e) {
        console.error('Error sending rejection email:', e);
      }
    }

    return updatedCandidature;
  }
}
