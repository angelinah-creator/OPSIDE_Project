import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { MatchStatus, NotificationType, Role, MatchInitiatedBy } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class MatchesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private mailService: MailService,
  ) {}

  async sourceCandidate(clientId: string, dto: CreateMatchDto) {
    // Vérifier si un match existe déjà
    const existing = await this.prisma.match.findFirst({
      where: {
        candidate_id: dto.candidate_id,
        client_id: clientId,
        job_offer_id: dto.job_offer_id || null,
      },
    });

    if (existing) {
      throw new ConflictException('Vous avez déjà invité ce candidat.');
    }

    const match = await this.prisma.match.create({
      data: {
        candidate_id: dto.candidate_id,
        client_id: clientId,
        job_offer_id: dto.job_offer_id,
        status: MatchStatus.pending_candidate,
        initiated_by: MatchInitiatedBy.client,
      },
      include: {
        client: {
          include: {
            client: true,
          },
        },
        job_offer: true,
      },
    });

    // Notification au candidat
    const companyName = match.client.client?.company_name || 'Un client';
    const projectName = match.job_offer?.title || 'une opportunité';
    
    await this.notificationsService.create({
      user_id: dto.candidate_id,
      type: NotificationType.sourcing_invitation,
      title: 'Nouvelle invitation reçue',
      message: `${companyName} souhaite vous rencontrer pour le projet : ${projectName}.`,
      link: `/candidat/dashboard`,
    });

    // Envoi d'email au candidat
    try {
      const candidateUser = await this.prisma.user.findUnique({ where: { id: dto.candidate_id } });
      if (candidateUser?.email) {
        await this.mailService.sendSourcingInvitationEmail(
          candidateUser.email,
          companyName,
          projectName
        );
      }
    } catch (e) {
      console.error('Failed to send sourcing invitation email:', e);
    }

    return match;
  }

  async respondToMatch(matchId: string, userId: string, role: Role, action: 'confirm' | 'reject') {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        client: { include: { client: true } },
        candidate: true,
        job_offer: true,
      },
    });

    if (!match) {
      throw new NotFoundException('Match introuvable.');
    }

    // Vérifier les permissions
    if (role === Role.candidat && match.candidate_id !== userId) {
      throw new ForbiddenException('Accès refusé.');
    }
    if (role === Role.client && match.client_id !== userId) {
      throw new ForbiddenException('Accès refusé.');
    }

    if (action === 'reject') {
      const updatedMatch = await this.prisma.match.update({
        where: { id: matchId },
        data: {
          status: MatchStatus.rejected,
          rejected_at: new Date(),
          rejected_by: role,
        },
      });

      // Notification à l'autre partie
      const recipientId = role === Role.candidat ? match.client_id : match.candidate_id;
      const rejectorName = role === Role.candidat ? 'Le candidat' : 'Le client';
      
      await this.notificationsService.create({
        user_id: recipientId,
        type: NotificationType.match_rejected,
        title: 'Match refusé',
        message: `${rejectorName} a décliné le match${match.job_offer ? ` pour le projet ${match.job_offer.title}` : ''}.`,
      });

      // Email au client si le candidat refuse
      if (role === Role.candidat) {
        try {
          const clientUser = await this.prisma.user.findUnique({ where: { id: match.client_id } });
          if (clientUser?.email) {
            const candidateName = `${match.candidate.first_name || ''} ${match.candidate.last_name || ''}`.trim() || 'Un candidat';
            await this.mailService.sendMatchDecisionEmail(
              clientUser.email,
              candidateName,
              'refused',
              match.job_offer?.title
            );
          }
        } catch (e) {
          console.error('Failed to send rejection email to client:', e);
        }
      }

      return updatedMatch;
    }

    if (action === 'confirm') {
      // Un match ne peut être confirmé que par la partie qui n'a pas initié, ou selon le flux
      // Ici, on considère que si le statut est pending_candidate, seul le candidat peut confirmer
      if (match.status === MatchStatus.pending_candidate && role !== Role.candidat) {
        throw new ForbiddenException('Seul le candidat peut confirmer ce match.');
      }
      if (match.status === MatchStatus.pending_client && role !== Role.client) {
        throw new ForbiddenException('Seul le client peut confirmer ce match.');
      }

      const updatedMatch = await this.prisma.match.update({
        where: { id: matchId },
        data: {
          status: MatchStatus.confirmed,
          matched_at: new Date(),
        },
      });

      // --- SOURCING TO CANDIDATURE BRIDGE ---
      // If the candidate confirmed the invitation, automatically create a Candidature record with status 'matched'.
      // This bridges them seamlessly into the post-match validation and testing flow.
      if (match.job_offer_id) {
        const existingCandidature = await this.prisma.candidature.findFirst({
          where: {
            candidate_id: match.candidate_id,
            job_offer_id: match.job_offer_id,
          },
        });
        if (!existingCandidature) {
          await this.prisma.candidature.create({
            data: {
              candidate_id: match.candidate_id,
              job_offer_id: match.job_offer_id,
              status: 'matched',
              message: 'Candidat matché via sourcing',
            },
          });
        }
      }

      // Notification aux deux parties
      const companyName = match.client.client?.company_name || 'Le client';
      const candidateName = `${match.candidate.first_name || ''} ${match.candidate.last_name || ''}`.trim() || 'Un candidat';
      const projectName = match.job_offer?.title || 'sourcing';

      await this.notificationsService.create({
        user_id: match.candidate_id,
        type: NotificationType.match_confirmed,
        title: 'Match confirmé !',
        message: `Félicitations ! Votre match avec ${companyName} est confirmé pour le projet ${projectName}.`,
        link: `/candidat/dashboard`,
      });

      await this.notificationsService.create({
        user_id: match.client_id,
        type: NotificationType.match_confirmed,
        title: 'Match confirmé !',
        message: `Le candidat ${candidateName} a accepté votre invitation pour le projet ${projectName}.`,
        link: `/client/dashboard`,
      });

      // Email avec lien Calendly (confirmé)
      try {
        const candidateUser = await this.prisma.user.findUnique({ where: { id: match.candidate_id } });
        const clientUser = await this.prisma.user.findUnique({ where: { id: match.client_id } });
        
        if (candidateUser) {
          await this.mailService.sendMatchConfirmationEmail(
            candidateUser.email, 
            'candidate', 
            companyName,
            match.job_offer?.title
          );
        }
        
        if (clientUser) {
          await this.mailService.sendMatchConfirmationEmail(
            clientUser.email, 
            'client', 
            candidateName,
            match.job_offer?.title
          );
        }
      } catch (e) {
        console.error('Failed to send match confirmation email:', e);
      }
      
      return updatedMatch;
    }
  }

  async findAllForCandidate(candidateId: string) {
    return this.prisma.match.findMany({
      where: {
        candidate_id: candidateId,
      },
      include: {
        client: {
          include: {
            client: true,
          },
        },
        job_offer: true,
      },
      orderBy: { matched_at: 'desc' },
    });
  }

  async findAllForClient(clientId: string) {
    return this.prisma.match.findMany({
      where: { client_id: clientId },
      include: {
        candidate: {
          include: {
            candidate: {
              include: {
                candidate_skills: { include: { skill: true } },
                experiences: true,
                educations: true,
              },
            },
          },
        },
        job_offer: true,
        custom_test: true,
      },
      orderBy: { matched_at: 'desc' },
    });
  }

  async endContract(matchId: string, clientId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        candidate: true,
        client: { include: { client: true } },
        job_offer: true,
      },
    });

    if (!match) throw new NotFoundException('Match introuvable.');
    if (match.client_id !== clientId) throw new ForbiddenException('Accès refusé.');

    const updated = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.rejected,
        rejected_at: new Date(),
        rejected_by: Role.client,
      },
    });

    const companyName = match.client.client?.company_name || 'Le client';
    const projectName = match.job_offer?.title || 'un projet';

    await this.notificationsService.create({
      user_id: match.candidate_id,
      type: NotificationType.match_rejected,
      title: 'Fin de contrat',
      message: `${companyName} a mis fin à votre collaboration sur le projet ${projectName}.`,
      link: '/candidat/dashboard',
    });

    return updated;
  }

  async addToWorkspace(matchId: string, clientId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        candidate: true,
        client: { include: { client: true } },
        job_offer: true,
      },
    });

    if (!match) throw new NotFoundException('Match introuvable.');
    if (match.client_id !== clientId) throw new ForbiddenException('Accès refusé.');
    if (match.status !== MatchStatus.confirmed) throw new ForbiddenException('Le match doit être confirmé.');

    const updated = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.in_workspace,
      },
    });

    const companyName = match.client.client?.company_name || 'Le client';
    const projectName = match.job_offer?.title || 'un projet';

    await this.notificationsService.create({
      user_id: match.candidate_id,
      type: NotificationType.workspace_invitation,
      title: 'Bienvenue dans le Workspace',
      message: `${companyName} a officiellement démarré la collaboration. Votre Workspace est débloqué !`,
      link: '/candidat/workspace',
    });

    try {
      await this.mailService.sendWorkspaceInvitationEmail(
        match.candidate.email,
        companyName,
        projectName,
      );
    } catch (e) {
      console.error('Failed to send workspace invitation email:', e);
    }

    return updated;
  }

  async findAllForAdmin() {
    return this.prisma.match.findMany({
      include: {
        candidate: {
          include: {
            candidate: true,
          },
        },
        client: {
          include: {
            client: true,
          },
        },
        job_offer: true,
      },
      orderBy: {
        matched_at: 'desc',
      },
    });
  }

  async findOne(matchId: string, userId: string, role: Role) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        client: {
          include: {
            client: true,
          },
        },
        candidate: {
          include: {
            candidate: true,
          },
        },
        job_offer: true,
      },
    });

    if (!match) {
      throw new NotFoundException('Match introuvable.');
    }

    // Vérifier les permissions
    if (role === Role.candidat && match.candidate_id !== userId) {
      throw new ForbiddenException('Accès refusé.');
    }
    if (role === Role.client && match.client_id !== userId) {
      throw new ForbiddenException('Accès refusé.');
    }

    return match;
  }
}


