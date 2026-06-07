import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomTestDto } from './dto/create-custom-test.dto';
import { SubmitCustomTestDto } from './dto/submit-custom-test.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { NotificationType, MatchStatus, Prisma } from '@prisma/client';
import { generateMockQuestions, evaluateMockAnswers } from './mock-questions.generator';

@Injectable()
export class CustomTestService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private mailService: MailService,
  ) { }

  // Create test
  async createTest(clientId: string, dto: CreateCustomTestDto) {
    const match = await this.prisma.match.findUnique({
      where: { id: dto.match_id },
      include: {
        client: { include: { client: true } },
        candidate: true,
        job_offer: true,
        custom_test: true,
      },
    });

    if (!match) throw new NotFoundException('Match introuvable.');
    if (match.client_id !== clientId) throw new ForbiddenException('Accès refusé.');
    if (match.status !== MatchStatus.confirmed) throw new BadRequestException('Le match doit être confirmé pour envoyer un test.');

    if (match.custom_test && !match.custom_test.retest_used) {
      if (match.custom_test.status === 'scored' && match.custom_test.retest_allowed && !match.custom_test.retest_used) {
      } else if (match.custom_test.status !== 'expired') {
        throw new ConflictException('Un test existe déjà pour ce match.');
      }
    }

    const difficulty = dto.difficulty || await this.inferDifficulty(dto.candidate_id);

    const skills = await this.prisma.skill.findMany({
      where: { id: { in: dto.skills_tested } }
    });
    const skillNames = dto.skills_tested.map(id => {
      const s = skills.find(sk => sk.id === id);
      return s ? s.name : id;
    });

    const questions = generateMockQuestions(skillNames, difficulty);

    if (match.custom_test) {
      await this.prisma.customTest.update({
        where: { id: match.custom_test.id },
        data: { status: 'expired', retest_used: true },
      });
    }

    const test = await this.prisma.customTest.create({
      data: {
        client_id: clientId,
        candidate_id: dto.candidate_id,
        match_id: dto.match_id,
        skills_tested: skillNames,
        difficulty,
        duration_minutes: dto.duration_minutes,
        custom_instructions: dto.custom_instructions,
        threshold: 75,
        questions: questions as any,
        status: 'sent',
      },
    });

    const companyName = match.client.client?.company_name || 'Un client';
    const projectName = match.job_offer?.title || 'un projet';

    await this.notificationsService.create({
      user_id: dto.candidate_id,
      type: NotificationType.test_result,
      title: 'Nouveau test technique reçu',
      message: `${companyName} vous a envoyé un test technique pour le projet : ${projectName}. Durée : ${dto.duration_minutes} min.`,
      link: '/candidat/dashboard',
    });

    try {
      await this.mailService.sendCustomTestInvitationEmail(
        match.candidate.email,
        companyName,
        projectName,
        skillNames,
        dto.duration_minutes,
        dto.custom_instructions,
      );
    } catch (e) {
      console.error('Failed to send custom test invitation email:', e);
    }

    return test;
  }

  // Start test
  async startTest(testId: string, candidateId: string) {
    const test = await this.prisma.customTest.findUnique({ where: { id: testId } });
    if (!test) throw new NotFoundException('Test introuvable.');
    if (test.candidate_id !== candidateId) throw new ForbiddenException('Accès refusé.');
    if (test.status === 'in_progress') {
      return test;
    }
    if (test.status !== 'sent') throw new BadRequestException('Ce test ne peut pas être démarré dans son état actuel.');

    return this.prisma.customTest.update({
      where: { id: testId },
      data: { status: 'in_progress', started_at: new Date() },
    });
  }

  // Submit test
  async submitTest(testId: string, candidateId: string, dto: SubmitCustomTestDto) {
    const test = await this.prisma.customTest.findUnique({
      where: { id: testId },
      include: {
        match: {
          include: {
            client: { include: { client: true } },
            candidate: true,
            job_offer: true,
          },
        },
      },
    });

    if (!test) throw new NotFoundException('Test introuvable.');
    if (test.candidate_id !== candidateId) throw new ForbiddenException('Accès refusé.');
    if (!['sent', 'in_progress'].includes(test.status)) {
      throw new BadRequestException('Ce test a déjà été soumis.');
    }

    const questions = test.questions as any[];
    const { score, details } = evaluateMockAnswers(questions, dto.answers);
    const passed = score >= test.threshold;

    const updatedTest = await this.prisma.customTest.update({
      where: { id: testId },
      data: {
        answers: dto.answers as any,
        score,
        score_details: details as any,
        status: 'scored',
        submitted_at: new Date(),
        retest_allowed: !passed, // Retest possible seulement si échec
      },
    });

    const companyName = test.match.client.client?.company_name || 'Le client';
    const candidateName = `${test.match.candidate.first_name || ''} ${test.match.candidate.last_name || ''}`.trim() || 'Le candidat';
    const projectName = test.match.job_offer?.title || 'le projet';

    if (passed) {
      await this.notificationsService.create({
        user_id: candidateId,
        type: NotificationType.test_result,
        title: '  Test réussi !',
        message: `Félicitations ! Vous avez obtenu ${score}% au test technique pour ${projectName}. ${companyName} va vous contacter pour l'entretien.`,
        link: '/candidat/dashboard',
      });

      await this.notificationsService.create({
        user_id: test.client_id,
        type: NotificationType.test_result,
        title: '  Test réussi par le candidat',
        message: `${candidateName} a obtenu ${score}% au test pour ${projectName}. Un lien Calendly a été envoyé au candidat.`,
        link: '/client/dashboard',
      });

      try {
        await this.mailService.sendCustomTestResultEmail(
          test.match.candidate.email, 'candidate', score, true, companyName, projectName,
        );
        await this.mailService.sendCustomTestResultEmail(
          test.match.client.email, 'client', score, true, candidateName, projectName,
        );
      } catch (e) {
        console.error('Failed to send test result emails:', e);
      }
    } else {
      await this.prisma.match.update({
        where: { id: test.match_id },
        data: { status: MatchStatus.rejected, rejected_at: new Date() },
      });

      if (test.match.job_offer_id) {
        await this.prisma.candidature.updateMany({
          where: {
            candidate_id: test.candidate_id,
            job_offer_id: test.match.job_offer_id,
          },
          data: { status: 'rejected' },
        });
      }

      await this.notificationsService.create({
        user_id: candidateId,
        type: NotificationType.test_result,
        title: ' Test non validé',
        message: `Vous avez obtenu ${score}% (seuil 75%) au test pour ${projectName}. Le client peut proposer un retest.`,
        link: '/candidat/dashboard',
      });

      await this.notificationsService.create({
        user_id: test.client_id,
        type: NotificationType.test_result,
        title: 'Candidat non validé',
        message: `${candidateName} a obtenu ${score}% (seuil 75%) au test pour ${projectName}. Vous pouvez proposer un retest depuis votre dashboard.`,
        link: '/client/dashboard',
      });

      try {
        await this.mailService.sendCustomTestResultEmail(
          test.match.candidate.email, 'candidate', score, false, companyName, projectName,
        );
        await this.mailService.sendCustomTestResultEmail(
          test.match.client.email, 'client', score, false, candidateName, projectName,
        );
      } catch (e) {
        console.error('Failed to send test result emails:', e);
      }
    }

    return { ...updatedTest, passed, threshold: test.threshold };
  }

  // Request retest
  async requestRetest(testId: string, clientId: string) {
    const test = await this.prisma.customTest.findUnique({
      where: { id: testId },
      include: { match: { include: { candidate: true, job_offer: true, client: { include: { client: true } } } } },
    });

    if (!test) throw new NotFoundException('Test introuvable.');
    if (test.client_id !== clientId) throw new ForbiddenException('Accès refusé.');
    if (!test.retest_allowed || test.retest_used) {
      throw new BadRequestException('Le retest n\'est plus disponible pour ce test.');
    }
    if (test.score !== null && test.score >= test.threshold) {
      throw new BadRequestException('Le candidat a déjà réussi le test, pas de retest nécessaire.');
    }

    await this.prisma.match.update({
      where: { id: test.match_id },
      data: { status: MatchStatus.confirmed, rejected_at: null },
    });

    if (test.match.job_offer_id) {
      await this.prisma.candidature.updateMany({
        where: {
          candidate_id: test.candidate_id,
          job_offer_id: test.match.job_offer_id,
        },
        data: { status: 'matched' },
      });
    }

    const newQuestions = generateMockQuestions(test.skills_tested, test.difficulty || 'mid');

    const updatedTest = await this.prisma.customTest.update({
      where: { id: testId },
      data: {
        questions: newQuestions as any,
        answers: Prisma.DbNull,
        score: null,
        score_details: Prisma.DbNull,
        status: 'sent',
        started_at: null,
        submitted_at: null,
        retest_allowed: false,
        retest_used: true,
      },
    });

    const companyName = test.match.client.client?.company_name || 'Un client';
    const projectName = test.match.job_offer?.title || 'un projet';

    await this.notificationsService.create({
      user_id: test.candidate_id,
      type: NotificationType.test_result,
      title: 'Retest disponible',
      message: `${companyName} vous propose un retest pour le projet ${projectName}. C'est votre dernière chance !`,
      link: '/candidat/dashboard',
    });

    try {
      await this.mailService.sendCustomTestInvitationEmail(
        test.match.candidate.email,
        companyName,
        projectName,
        test.skills_tested,
        test.duration_minutes,
        '⚠️ Retest — ' + (test.custom_instructions || 'Faites de votre mieux !'),
      );
    } catch (e) {
      console.error('Failed to send retest invitation email:', e);
    }

    return updatedTest;
  }

  // Send calendly directly
  async sendCalendlyDirectly(matchId: string, clientId: string, calendlyUrl?: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        client: { include: { client: true } },
        candidate: true,
        job_offer: true,
      },
    });

    if (!match) throw new NotFoundException('Match introuvable.');
    if (match.client_id !== clientId) throw new ForbiddenException('Accès refusé.');
    if (match.status !== MatchStatus.confirmed) throw new BadRequestException('Le match doit être confirmé.');

    await this.prisma.match.update({
      where: { id: matchId },
      data: {
        calendly_url: calendlyUrl || 'https://calendly.com/opside',
      },
    });

    const companyName = match.client.client?.company_name || 'Le client';
    const projectName = match.job_offer?.title || 'le projet';

    await this.notificationsService.create({
      user_id: match.candidate_id,
      type: NotificationType.match_confirmed,
      title: 'Lien d\'entretien reçu !',
      message: `${companyName} vous a envoyé un lien pour planifier votre entretien pour le projet ${projectName}.`,
      link: '/candidat/dashboard',
    });

    try {
      await this.mailService.sendCalendlyLinkEmail(
        match.candidate.email,
        companyName,
        projectName,
        calendlyUrl || 'https://calendly.com/opside',
      );
    } catch (e) {
      console.error('Failed to send Calendly email:', e);
    }

    return { success: true, message: 'Lien Calendly envoyé au candidat.' };
  }

  // Récupère test by match
  async getTestByMatch(matchId: string, userId: string) {
    const test = await this.prisma.customTest.findUnique({
      where: { match_id: matchId },
    });
    if (!test) return null;
    if (test.client_id !== userId && test.candidate_id !== userId) {
      throw new ForbiddenException('Accès refusé.');
    }
    return test;
  }

  // Récupère test for candidate
  async getTestForCandidate(testId: string, candidateId: string) {
    const test = await this.prisma.customTest.findUnique({
      where: { id: testId },
      include: {
        match: { include: { client: { include: { client: true } }, job_offer: true } },
      },
    });
    if (!test) throw new NotFoundException('Test introuvable.');
    if (test.candidate_id !== candidateId) throw new ForbiddenException('Accès refusé.');
    return test;
  }

  // Récupère tests for client
  async getTestsForClient(clientId: string) {
    return this.prisma.customTest.findMany({
      where: { client_id: clientId },
      include: {
        candidate: { select: { id: true, first_name: true, last_name: true, email: true, candidate: true } },
        match: { include: { job_offer: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // Récupère tests for candidate
  async getTestsForCandidate(candidateId: string) {
    return this.prisma.customTest.findMany({
      where: { candidate_id: candidateId },
      include: {
        match: {
          include: {
            client: { include: { client: true } },
            job_offer: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // Infer difficulty
  private async inferDifficulty(candidateId: string): Promise<string> {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { user_id: candidateId },
    });
    const years = profile?.experience_years || 0;
    if (years < 2) return 'junior';
    if (years <= 5) return 'mid';
    return 'senior';
  }
}
