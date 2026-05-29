import {
  Controller, Post, Patch, Get, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { StartTimerDto } from './dto/start-timer.dto';
import { StopTimerDto } from './dto/stop-timer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('workspace')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  // ─── Timer (Candidat) ────────────────────────────────────────────────────

  @Post('timer/start')
  @Roles('candidat')
  @HttpCode(HttpStatus.CREATED)
  startTimer(
    @CurrentUser('id') candidateId: string,
    @Body() dto: StartTimerDto,
  ) {
    return this.workspaceService.startTimer(candidateId, dto);
  }

  @Post('timer/stop')
  @Roles('candidat')
  @HttpCode(HttpStatus.OK)
  stopTimer(
    @CurrentUser('id') candidateId: string,
    @Body() dto: StopTimerDto,
  ) {
    return this.workspaceService.stopTimer(candidateId, dto);
  }

  @Get(':matchId/sessions/active')
  @Roles('candidat')
  getActiveSessions(
    @CurrentUser('id') candidateId: string,
    @Param('matchId') matchId: string,
  ) {
    return this.workspaceService.getActiveSessions(candidateId, matchId);
  }

  // ─── Timesheet ───────────────────────────────────────────────────────────

  @Post(':matchId/timesheet/generate')
  @Roles('candidat')
  @HttpCode(HttpStatus.CREATED)
  generateTimesheet(
    @CurrentUser('id') candidateId: string,
    @Param('matchId') matchId: string,
    @Body('weekStart') weekStart: string,
  ) {
    return this.workspaceService.generateTimesheet(
      candidateId,
      matchId,
      new Date(weekStart),
    );
  }

  @Patch('timesheet/:id/submit')
  @Roles('candidat')
  submitTimesheet(
    @CurrentUser('id') candidateId: string,
    @Param('id') timesheetId: string,
  ) {
    return this.workspaceService.submitTimesheet(candidateId, timesheetId);
  }

  @Patch('timesheet/:id/approve')
  @Roles('client')
  approveTimesheet(
    @CurrentUser('id') clientId: string,
    @Param('id') timesheetId: string,
  ) {
    return this.workspaceService.approveTimesheet(clientId, timesheetId);
  }

  @Get('timesheets/candidate')
  @Roles('candidat')
  getCandidateTimesheets(@CurrentUser('id') candidateId: string) {
    return this.workspaceService.getCandidateTimesheets(candidateId);
  }

  @Get('timesheets/client')
  @Roles('client')
  getClientTimesheets(@CurrentUser('id') clientId: string) {
    return this.workspaceService.getClientTimesheets(clientId);
  }

  // ─── Workspace Home ───────────────────────────────────────────────────────

  @Get(':matchId/home')
  @Roles('candidat', 'client')
  getWorkspaceHome(
    @CurrentUser('id') userId: string,
    @Param('matchId') matchId: string,
  ) {
    return this.workspaceService.getWorkspaceHome(userId, matchId);
  }
}
