import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { CustomTestService } from './custom-test.service';
import { CreateCustomTestDto } from './dto/create-custom-test.dto';
import { SubmitCustomTestDto } from './dto/submit-custom-test.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('custom-test')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomTestController {
  constructor(private readonly customTestService: CustomTestService) {}

  // Create test
  @Post()
  @Roles(Role.client)
  createTest(
    @CurrentUser('id') clientId: string,
    @Body() dto: CreateCustomTestDto,
  ) {
    return this.customTestService.createTest(clientId, dto);
  }

  // Send calendly
  @Post('match/:matchId/send-calendly')
  @Roles(Role.client)
  sendCalendly(
    @Param('matchId') matchId: string,
    @CurrentUser('id') clientId: string,
    @Body('calendly_url') calendlyUrl: string,
  ) {
    return this.customTestService.sendCalendlyDirectly(matchId, clientId, calendlyUrl);
  }

  // Récupère client tests
  @Get('client')
  @Roles(Role.client)
  getClientTests(@CurrentUser('id') clientId: string) {
    return this.customTestService.getTestsForClient(clientId);
  }

  // Request retest
  @Post(':id/retest')
  @Roles(Role.client)
  requestRetest(
    @Param('id') testId: string,
    @CurrentUser('id') clientId: string,
  ) {
    return this.customTestService.requestRetest(testId, clientId);
  }

  // Récupère test by match
  @Get('match/:matchId')
  getTestByMatch(
    @Param('matchId') matchId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.customTestService.getTestByMatch(matchId, userId);
  }

  // Récupère candidate tests
  @Get('candidate')
  @Roles(Role.candidat)
  getCandidateTests(@CurrentUser('id') candidateId: string) {
    return this.customTestService.getTestsForCandidate(candidateId);
  }

  // Récupère test
  @Get(':id')
  getTest(
    @Param('id') testId: string,
    @CurrentUser('id') candidateId: string,
  ) {
    return this.customTestService.getTestForCandidate(testId, candidateId);
  }

  // Start test
  @Patch(':id/start')
  @Roles(Role.candidat)
  startTest(
    @Param('id') testId: string,
    @CurrentUser('id') candidateId: string,
  ) {
    return this.customTestService.startTest(testId, candidateId);
  }

  // Submit test
  @Post(':id/submit')
  @Roles(Role.candidat)
  submitTest(
    @Param('id') testId: string,
    @CurrentUser('id') candidateId: string,
    @Body() dto: SubmitCustomTestDto,
  ) {
    return this.customTestService.submitTest(testId, candidateId, dto);
  }
}
