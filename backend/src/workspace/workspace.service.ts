import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartTimerDto } from './dto/start-timer.dto';
import { StopTimerDto } from './dto/stop-timer.dto';
import { TimesheetStatus } from '@prisma/client';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Timer ───────────────────────────────────────────────────────────────

  async startTimer(candidateId: string, dto: StartTimerDto) {
    // Vérifie que le match existe et est en workspace
    const match = await this.prisma.match.findUnique({
      where: { id: dto.matchId },
      include: { candidate: { select: { id: true } } },
    });

    if (!match) throw new NotFoundException('Match introuvable');
    if (match.candidate_id !== candidateId)
      throw new ForbiddenException("Ce match ne vous appartient pas");

    // Vérifie qu'il n'y a pas déjà une session ouverte
    const activeSession = await this.prisma.workspaceSession.findFirst({
      where: { match_id: dto.matchId, candidate_id: candidateId, stopped_at: null },
    });
    if (activeSession)
      throw new BadRequestException('Un timer est déjà en cours pour ce match');

    const session = await this.prisma.workspaceSession.create({
      data: {
        match_id: dto.matchId,
        candidate_id: candidateId,
        client_id: match.client_id,
        note: dto.note,
      },
    });

    return { success: true, session };
  }

  async stopTimer(candidateId: string, dto: StopTimerDto) {
    const session = await this.prisma.workspaceSession.findUnique({
      where: { id: dto.sessionId },
    });

    if (!session) throw new NotFoundException('Session introuvable');
    if (session.candidate_id !== candidateId)
      throw new ForbiddenException("Cette session ne vous appartient pas");
    if (session.stopped_at)
      throw new BadRequestException('Ce timer est déjà arrêté');

    const stoppedAt = new Date();
    const durationMs = stoppedAt.getTime() - session.started_at.getTime();
    const durationMin = Math.round(durationMs / 60000);

    const updated = await this.prisma.workspaceSession.update({
      where: { id: dto.sessionId },
      data: {
        stopped_at: stoppedAt,
        duration_min: durationMin,
        note: dto.note ?? session.note,
      },
    });

    return { success: true, session: updated, duration_min: durationMin };
  }

  async getActiveSessions(candidateId: string, matchId: string) {
    return this.prisma.workspaceSession.findMany({
      where: { candidate_id: candidateId, match_id: matchId, stopped_at: null },
      orderBy: { started_at: 'desc' },
    });
  }

  // ─── Timesheet ───────────────────────────────────────────────────────────

  async generateTimesheet(candidateId: string, matchId: string, weekStart: Date) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        candidate: {
          include: { candidate: true },
        },
      },
    });

    if (!match) throw new NotFoundException('Match introuvable');
    if (match.candidate_id !== candidateId)
      throw new ForbiddenException("Ce match ne vous appartient pas");

    // Récupère le TJM du candidat
    const candidateProfile = await this.prisma.candidateProfile.findUnique({
      where: { user_id: candidateId },
    });
    if (!candidateProfile)
      throw new NotFoundException('Profil candidat introuvable');

    const dailyRate = Number(candidateProfile.daily_rate);

    // Récupère les sessions de la semaine
    const sessions = await this.prisma.workspaceSession.findMany({
      where: {
        match_id: matchId,
        candidate_id: candidateId,
        stopped_at: { not: null },
        started_at: { gte: weekStart, lte: weekEnd },
      },
    });

    const totalMin = sessions.reduce((sum, s) => sum + (s.duration_min ?? 0), 0);
    const totalHours = Math.round((totalMin / 60) * 100) / 100;
    const amountDue = Math.round(((totalHours / 8) * dailyRate) * 100) / 100;

    // Upsert : crée ou met à jour la timesheet de cette semaine
    const timesheet = await this.prisma.timesheet.upsert({
      where: { match_id_week_start: { match_id: matchId, week_start: weekStart } },
      create: {
        match_id: matchId,
        candidate_id: candidateId,
        client_id: match.client_id,
        week_start: weekStart,
        week_end: weekEnd,
        total_hours: totalHours,
        daily_rate: dailyRate,
        amount_due: amountDue,
        status: TimesheetStatus.draft,
      },
      update: {
        total_hours: totalHours,
        daily_rate: dailyRate,
        amount_due: amountDue,
      },
    });

    return { success: true, timesheet };
  }

  async submitTimesheet(candidateId: string, timesheetId: string) {
    const timesheet = await this.prisma.timesheet.findUnique({
      where: { id: timesheetId },
    });

    if (!timesheet) throw new NotFoundException('Timesheet introuvable');
    if (timesheet.candidate_id !== candidateId)
      throw new ForbiddenException("Cette timesheet ne vous appartient pas");
    if (timesheet.status !== TimesheetStatus.draft)
      throw new BadRequestException('Seules les timesheets en brouillon peuvent être soumises');

    const updated = await this.prisma.timesheet.update({
      where: { id: timesheetId },
      data: {
        status: TimesheetStatus.submitted,
        submitted_at: new Date(),
      },
    });

    return { success: true, timesheet: updated };
  }

  async approveTimesheet(clientId: string, timesheetId: string) {
    const timesheet = await this.prisma.timesheet.findUnique({
      where: { id: timesheetId },
    });

    if (!timesheet) throw new NotFoundException('Timesheet introuvable');
    if (timesheet.client_id !== clientId)
      throw new ForbiddenException("Cette timesheet ne vous appartient pas");
    if (timesheet.status !== TimesheetStatus.submitted)
      throw new BadRequestException('La timesheet doit être soumise pour être approuvée');

    const updated = await this.prisma.timesheet.update({
      where: { id: timesheetId },
      data: { status: TimesheetStatus.approved, approved_at: new Date() },
    });

    return { success: true, timesheet: updated };
  }

  // ─── Workspace Home ───────────────────────────────────────────────────────

  async getWorkspaceHome(userId: string, matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        candidate: { select: { id: true, first_name: true, last_name: true, email: true } },
        client:    { select: { id: true, first_name: true, last_name: true, email: true } },
        job_offer: { select: { id: true, title: true } },
        workspace_sessions: {
          where: { stopped_at: { not: null } },
          orderBy: { started_at: 'desc' },
          take: 10,
        },
        timesheets: {
          orderBy: { week_start: 'desc' },
          take: 4,
        },
      },
    });

    if (!match) throw new NotFoundException('Match introuvable');

    const isParticipant = match.candidate_id === userId || match.client_id === userId;
    if (!isParticipant) throw new ForbiddenException("Accès refusé à ce workspace");

    const activeSession = await this.prisma.workspaceSession.findFirst({
      where: {
        match_id: matchId,
        candidate_id: match.candidate_id,
        stopped_at: null,
      },
    });

    const totalMinAll = match.workspace_sessions.reduce(
      (sum, s) => sum + (s.duration_min ?? 0), 0,
    );

    return {
      match,
      active_session: activeSession ?? null,
      total_hours_logged: Math.round((totalMinAll / 60) * 100) / 100,
      recent_sessions: match.workspace_sessions,
      timesheets: match.timesheets,
    };
  }

  async getCandidateTimesheets(candidateId: string) {
    return this.prisma.timesheet.findMany({
      where: { candidate_id: candidateId },
      orderBy: { week_start: 'desc' },
      include: { match: { select: { id: true, client_id: true } } },
    });
  }

  async getClientTimesheets(clientId: string) {
    return this.prisma.timesheet.findMany({
      where: { client_id: clientId },
      orderBy: { week_start: 'desc' },
      include: {
        candidate: { select: { first_name: true, last_name: true, email: true } },
        match: { select: { id: true } },
      },
    });
  }
}
