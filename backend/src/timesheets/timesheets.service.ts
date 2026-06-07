import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimerStatus, Timesheet } from '@prisma/client';
import {
  CreateTimesheetDto,
  UpdateTimesheetDto,
  StartTimerDto,
  GetReportDto,
} from './dto/timesheet.dtos';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

const EDITABLE_DAYS = 7;

@Injectable()
export class TimesheetsService {
  constructor(private prisma: PrismaService) {}

  private async checkIfEditable(entryId: string, userId: string): Promise<Timesheet> {
    const entry = await this.prisma.timesheet.findUnique({
      where: { id: entryId, user_id: userId },
    });
    
    if (!entry) {
      throw new NotFoundException('Entrée non trouvée');
    }

    const now = new Date();
    const limitDate = new Date();
    limitDate.setDate(now.getDate() - EDITABLE_DAYS);
    const entryDate = new Date(entry.start_time);
    entryDate.setHours(0, 0, 0, 0);
    const limitDateStart = new Date(limitDate);
    limitDateStart.setHours(0, 0, 0, 0);

    if (entryDate < limitDateStart) {
      throw new ForbiddenException(
        `Cette entrée est trop ancienne pour être modifiée (> ${EDITABLE_DAYS} jours)`,
      );
    }
    return entry;
  }

  async startTimer(userId: string, startTimerDto: StartTimerDto): Promise<Timesheet> {
    const activeTimer = await this.prisma.timesheet.findFirst({
      where: {
        user_id: userId,
        status: { in: [TimerStatus.running, TimerStatus.paused] },
      },
    });

    if (activeTimer) {
      throw new ConflictException("Un timer est déjà actif. Arrêtez-le d'abord.");
    }

    // Vérifier que le match appartient bien au candidat
    const match = await this.prisma.match.findUnique({
      where: { id: startTimerDto.match_id, candidate_id: userId },
    });

    if (!match) {
      throw new NotFoundException('Match non trouvé ou non autorisé');
    }

    return this.prisma.timesheet.create({
      data: {
        user_id: userId,
        match_id: startTimerDto.match_id,
        description: startTimerDto.description,
        start_time: new Date(),
        date: startOfDay(new Date()),
        status: TimerStatus.running,
        duration: 0,
      },
    });
  }

  async pauseTimer(userId: string): Promise<Timesheet> {
    const activeTimer = await this.getActiveTimer(userId);

    if (activeTimer.status !== TimerStatus.running) {
      throw new BadRequestException("Le timer n'est pas en cours d'exécution");
    }

    const now = new Date();
    const duration = activeTimer.duration + Math.floor((now.getTime() - new Date(activeTimer.start_time).getTime()) / 1000);

    return this.prisma.timesheet.update({
      where: { id: activeTimer.id },
      data: {
        status: TimerStatus.paused,
        duration,
        paused_at: { push: now },
      },
    });
  }

  async resumeTimer(userId: string): Promise<Timesheet> {
    const activeTimer = await this.getActiveTimer(userId);

    if (activeTimer.status !== TimerStatus.paused) {
      throw new BadRequestException("Le timer n'est pas en pause");
    }

    const now = new Date();
    return this.prisma.timesheet.update({
      where: { id: activeTimer.id },
      data: {
        status: TimerStatus.running,
        start_time: now,
        resumed_at: { push: now },
      },
    });
  }

  async stopTimer(userId: string): Promise<Timesheet> {
    const activeTimer = await this.getActiveTimer(userId);

    const now = new Date();
    let duration = activeTimer.duration;

    if (activeTimer.status === TimerStatus.running) {
      duration += Math.floor((now.getTime() - new Date(activeTimer.start_time).getTime()) / 1000);
    }

    return this.prisma.timesheet.update({
      where: { id: activeTimer.id },
      data: {
        status: TimerStatus.stopped,
        duration,
        end_time: now,
      },
    });
  }

  async getActiveTimer(userId: string): Promise<Timesheet> {
    const activeTimer = await this.prisma.timesheet.findFirst({
      where: {
        user_id: userId,
        status: { in: [TimerStatus.running, TimerStatus.paused] },
      },
    });

    if (!activeTimer) {
      throw new NotFoundException('Aucun timer actif');
    }

    return activeTimer;
  }

  async createEntry(userId: string, createDto: CreateTimesheetDto): Promise<Timesheet> {
    const now = new Date();
    const limitDate = new Date();
    limitDate.setDate(now.getDate() - EDITABLE_DAYS);
    limitDate.setHours(0, 0, 0, 0);

    const startDate = new Date(createDto.start_time);
    startDate.setHours(0, 0, 0, 0);

    if (startDate < limitDate) {
      throw new ForbiddenException(`Date trop ancienne (> ${EDITABLE_DAYS} jours)`);
    }

    return this.prisma.timesheet.create({
      data: {
        user_id: userId,
        match_id: createDto.match_id,
        description: createDto.description,
        start_time: new Date(createDto.start_time),
        end_time: createDto.end_time ? new Date(createDto.end_time) : undefined,
        duration: createDto.duration || 0,
        status: createDto.status || TimerStatus.stopped,
        date: startOfDay(new Date(createDto.start_time)),
      },
    });
  }

  async updateEntry(userId: string, id: string, updateDto: UpdateTimesheetDto): Promise<Timesheet> {
    await this.checkIfEditable(id, userId);
    
    return this.prisma.timesheet.update({
      where: { id },
      data: {
        ...updateDto,
        start_time: updateDto.start_time ? new Date(updateDto.start_time) : undefined,
        end_time: updateDto.end_time ? new Date(updateDto.end_time) : undefined,
      },
    });
  }

  async deleteEntry(userId: string, id: string): Promise<void> {
    await this.checkIfEditable(id, userId);
    await this.prisma.timesheet.delete({ where: { id } });
  }

  async getEntries(userId: string, matchId?: string, startDate?: Date, endDate?: Date): Promise<Timesheet[]> {
    const where: any = { user_id: userId };
    if (matchId) {
      where.match_id = matchId;
    }
    if (startDate && endDate) {
      where.date = {
        gte: startOfDay(startDate),
        lte: endOfDay(endDate),
      };
    }

    return this.prisma.timesheet.findMany({
      where,
      orderBy: [{ date: 'desc' }, { start_time: 'desc' }],
      include: {
        match: {
          include: { client: true }
        }
      }
    });
  }

  async getReport(reportDto: GetReportDto, requesterId: string, requesterRole: string) {
    let targetUserId = reportDto.user_id;

    if (!targetUserId) {
      if (requesterRole === 'client') {
        throw new BadRequestException("Vous devez spécifier l'ID du collaborateur");
      }
      targetUserId = requesterId;
    }

    // Si le requêteur est client, vérifier s'il y a un match avec le targetUserId
    if (requesterRole === 'client') {
      const match = await this.prisma.match.findFirst({
        where: { client_id: requesterId, candidate_id: targetUserId, status: 'in_workspace' }
      });
      if (!match) {
        throw new ForbiddenException("Vous n'avez pas accès aux données de ce collaborateur");
      }
    }

    const startDate = reportDto.start_date ? new Date(reportDto.start_date) : startOfWeek(new Date(), { weekStartsOn: 1 });
    const endDate = reportDto.end_date ? new Date(reportDto.end_date) : endOfWeek(new Date(), { weekStartsOn: 1 });

    const where: any = {
      user_id: targetUserId,
      date: {
        gte: startOfDay(startDate),
        lte: endOfDay(endDate),
      },
      status: TimerStatus.stopped,
    };

    if (reportDto.match_id) {
      where.match_id = reportDto.match_id;
    }

    const entries = await this.prisma.timesheet.findMany({
      where,
      include: {
        match: {
          include: { client: true }
        }
      },
      orderBy: [{ date: 'asc' }, { start_time: 'asc' }],
    });

    const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);

    const byDescription = new Map<string, number>();
    entries.forEach((entry) => {
      const desc = entry.description || 'Sans description';
      byDescription.set(desc, (byDescription.get(desc) || 0) + entry.duration);
    });

    const byDay = new Map<string, number>();
    entries.forEach((entry) => {
      if (!entry.end_time) {
        const day = entry.date.toISOString().split('T')[0];
        byDay.set(day, (byDay.get(day) || 0) + entry.duration);
        return;
      }

      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      const elapsedSec = (end.getTime() - start.getTime()) / 1000;

      if (elapsedSec <= 0) {
        const day = entry.date.toISOString().split('T')[0];
        byDay.set(day, (byDay.get(day) || 0) + entry.duration);
        return;
      }

      let current = new Date(start.getTime());
      while (current < end) {
        const year = current.getUTCFullYear();
        const month = current.getUTCMonth();
        const date = current.getUTCDate();
        const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

        const nextMidnight = new Date(Date.UTC(year, month, date + 1));
        const segmentEnd = nextMidnight < end ? nextMidnight : end;

        const segmentMs = segmentEnd.getTime() - current.getTime();
        const segmentSec = segmentMs / 1000;

        const proportion = segmentSec / elapsedSec;
        const dayDuration = Math.round(proportion * entry.duration);

        byDay.set(dayStr, (byDay.get(dayStr) || 0) + dayDuration);

        current = segmentEnd;
      }
    });

    return {
      period: { start: startDate, end: endDate },
      totalDuration,
      totalHours: totalDuration / 3600,
      entriesCount: entries.length,
      byDescription: Array.from(byDescription.entries()).map(([description, duration]) => ({
        description,
        duration,
        hours: duration / 3600,
        percentage: totalDuration > 0 ? (duration / totalDuration) * 100 : 0,
      })),
      byDay: Array.from(byDay.entries()).map(([day, duration]) => ({
        day,
        duration,
        hours: duration / 3600,
      })),
      entries: entries.map((entry: any) => ({
        id: entry.id,
        matchId: entry.match_id,
        clientName: entry.match?.client?.company_name || entry.match?.client?.first_name || 'Inconnu',
        description: entry.description,
        startTime: entry.start_time,
        endTime: entry.end_time,
        duration: entry.duration,
        hours: entry.duration / 3600,
        date: entry.date,
      })),
    };
  }
}
