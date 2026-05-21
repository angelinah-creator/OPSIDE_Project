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
    const candidateName = `${candidature.candidate.first_name || ''} ${candidature.candidate.last_name || ''}`.trim() || 'Un candidat';
    await this.notificationsService.create({
      user_id: jobOffer.client_id,
      type: NotificationType.new_application,
      title: 'Nouvelle candidature reçue',
      message: `${candidateName} a postulé à votre offre : ${jobOffer.title}`,
      link: `/client/dashboard`,
    });

    // Email au client
    try {
      await this.mailService.sendNewCandidatureEmail(
        jobOffer.client.email,
        candidateName,
        jobOffer.title,
        dto.message
      );
    } catch (e) {
      console.error('Error sending new candidature email to client:', e);
    }

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
    const candidatures = await this.prisma.candidature.findMany({
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

    // Fetch all client matches to identify sourced candidates and their test statuses
    const matches = await this.prisma.match.findMany({
      where: {
        client_id: clientId,
      },
      include: {
        custom_test: true,
      },
    });

    return candidatures.map((cand) => {
      const match = matches.find(
        (m) =>
          m.candidate_id === cand.candidate_id &&
          m.job_offer_id === cand.job_offer_id
      );

      // A candidate is sourced if the match was initiated by the client.
      const isSourced = match?.initiated_by === 'client';
      const hasTest = !!match?.custom_test;
      const testPassed =
        match?.custom_test?.status === 'scored' &&
        match?.custom_test?.score !== null &&
        match?.custom_test?.score >= match?.custom_test?.threshold;

      // Anonymization rules:
      // - Sourced profiles start anonymous.
      // - If a test was sent: they remain anonymous until the test is PASSED (>75%).
      // - If NO test was sent: they are NOT anonymous (so the client can see the profile before sending Calendly link).
      const shouldAnonymize = isSourced && hasTest && !testPassed;

      if (shouldAnonymize) {
        return {
          ...cand,
          candidate: {
            ...cand.candidate,
            first_name: 'Candidat',
            last_name: `Sourced (#${cand.candidate.id.slice(0, 4)})`,
            email: 'anonyme@opside.com',
            candidate: cand.candidate.candidate
              ? {
                  ...cand.candidate.candidate,
                  photo_url: null, // Mask profile picture
                }
              : null,
          },
        };
      }

      return cand;
    });
  }

  async updateStatus(id: string, clientId: string, status: CandidatureStatus) {
    const candidature = await this.prisma.candidature.findUnique({
      where: { id },
      include: {
        job_offer: {
          include: {
            client: {
              include: {
                client: true
              }
            }
          }
        },
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
        const companyName = candidature.job_offer.client.client?.company_name || 'Le client';
        const candidateName = `${candidature.candidate.first_name || ''} ${candidature.candidate.last_name || ''}`.trim() || 'Un candidat';
        
        // Email au candidat
        await this.mailService.sendMatchConfirmationEmail(
          candidature.candidate.email,
          'candidate',
          companyName,
          candidature.job_offer.title
        );

        // Email au client
        await this.mailService.sendMatchConfirmationEmail(
          candidature.job_offer.client.email,
          'client',
          candidateName,
          candidature.job_offer.title
        );
      } catch (e) {
        console.error('Error sending match confirmation emails:', e);
      }
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
