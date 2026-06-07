import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TimesheetsService } from './timesheets.service';
import {
  CreateTimesheetDto,
  UpdateTimesheetDto,
  StartTimerDto,
  GetReportDto,
} from './dto/timesheet.dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string; // The payload sub mapped to id
    email: string;
    role: string;
  };
}

@Controller('timesheets')
@UseGuards(JwtAuthGuard)
export class TimesheetsController {
  constructor(private readonly timesheetsService: TimesheetsService) {}

  // Start timer
  @Post('timer/start')
  startTimer(@Body() startTimerDto: StartTimerDto, @Req() req: AuthenticatedRequest) {
    return this.timesheetsService.startTimer(req.user.id, startTimerDto);
  }

  // Pause timer
  @Post('timer/pause')
  pauseTimer(@Req() req: AuthenticatedRequest) {
    return this.timesheetsService.pauseTimer(req.user.id);
  }

  // Resume timer
  @Post('timer/resume')
  resumeTimer(@Req() req: AuthenticatedRequest) {
    return this.timesheetsService.resumeTimer(req.user.id);
  }

  // Stop timer
  @Post('timer/stop')
  stopTimer(@Req() req: AuthenticatedRequest) {
    return this.timesheetsService.stopTimer(req.user.id);
  }

  // Récupère active timer
  @Get('timer/active')
  getActiveTimer(@Req() req: AuthenticatedRequest) {
    return this.timesheetsService.getActiveTimer(req.user.id);
  }

  // Create entry
  @Post()
  createEntry(@Body() createDto: CreateTimesheetDto, @Req() req: AuthenticatedRequest) {
    return this.timesheetsService.createEntry(req.user.id, createDto);
  }

  // Update entry
  @Put(':id')
  updateEntry(
    @Param('id') id: string,
    @Body() updateDto: UpdateTimesheetDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.timesheetsService.updateEntry(req.user.id, id, updateDto);
  }

  // Delete entry
  @Delete(':id')
  deleteEntry(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.timesheetsService.deleteEntry(req.user.id, id);
  }

  // Récupère entries
  @Get()
  getEntries(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('matchId') matchId?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    return this.timesheetsService.getEntries(
      req!.user.id,
      matchId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  // Récupère report
  @Get('report')
  getReport(@Query() reportDto: GetReportDto, @Req() req: AuthenticatedRequest) {
    return this.timesheetsService.getReport(reportDto, req.user.id, req.user.role);
  }
}
