import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TestService } from './test.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StartTestDto } from './dto/start-test.dto';
import { SubmitTestDto } from './dto/submit-test.dto';
import { Role } from '@prisma/client';

@Controller('tests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post('start')
  @Roles(Role.candidat)
  startTest(@CurrentUser('id') userId: string, @Body() dto: StartTestDto) {
    return this.testService.startTest(userId, dto.skills, dto.speciality);
  }

  @Get(':testId/start')
  @Roles(Role.candidat)
  startTestById(@CurrentUser('id') userId: string, @Param('testId', ParseUUIDPipe) testId: string) {
    return this.testService.startTestById(userId, testId);
  }

  @Post('submit')
  @Roles(Role.candidat)
  submitTest(@CurrentUser('id') userId: string, @Body() dto: SubmitTestDto) {
    return this.testService.submitTest(userId, dto.testId, dto.answers);
  }

  @Get(':testId/result')
  @Roles(Role.candidat)
  getTestResult(@CurrentUser('id') userId: string, @Param('testId', ParseUUIDPipe) testId: string) {
    return this.testService.getTestResult(userId, testId);
  }

  @Get('latest-score')
  @Roles(Role.candidat)
  getLatestScore(@CurrentUser('id') userId: string) {
    return this.testService.getLatestTestScore(userId);
  }
}