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
      },
    });

    // Notification au candidat
    const companyName = match.client.client?.company_name || 'Un client';
    await this.notificationsService.create({
      user_id: dto.candidate_id,
      type: NotificationType.sourcing_invitation,
      title: 'Nouvelle invitation reçue',
      message: `${companyName} souhaite vous rencontrer pour une opportunité.`,
      link: `/candidat/dashboard`,
    });

    // Envoi d'email au candidat via MailService
    try {
      const candidateEmail = (await this.prisma.user.findUnique({ where: { id: dto.candidate_id } }))?.email;
      if (candidateEmail) {
        // Optionnel: Ajouter une méthode sendSourcingEmail plus tard, pour l'instant on se concentre sur le Match
      }
    } catch (e) {}

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
        message: `${rejectorName} a décliné le match.`,
      });

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

      // Notification aux deux parties
      await this.notificationsService.create({
        user_id: match.candidate_id,
        type: NotificationType.match_confirmed,
        title: 'Match confirmé !',
        message: `Félicitations ! Votre match avec ${match.client.client?.company_name} est confirmé. Vous allez recevoir un email pour l'entretien.`,
        link: `/candidat/dashboard`,
      });

      await this.notificationsService.create({
        user_id: match.client_id,
        type: NotificationType.match_confirmed,
        title: 'Match confirmé !',
        message: `Le candidat a accepté votre invitation. Vous allez recevoir un email avec les détails.`,
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
            match.client.client?.company_name || 'le client'
          );
        }
        
        if (clientUser) {
          const candidateName = `${match.candidate.first_name} ${match.candidate.last_name}`;
          await this.mailService.sendMatchConfirmationEmail(
            clientUser.email, 
            'client', 
            candidateName
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
      where: { candidate_id: candidateId },
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
            candidate: true,
          },
        },
        job_offer: true,
      },
      orderBy: { matched_at: 'desc' },
    });
  }
}
