import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CandidaturesService } from './candidatures.service';
import { CreateCandidatureDto } from './dto/create-candidature.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role, CandidatureStatus } from '@prisma/client';

@Controller('candidatures')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CandidaturesController {
  constructor(private readonly candidaturesService: CandidaturesService) {}

  @Post()
  @Roles(Role.candidat)
  create(
    @CurrentUser('id') userId: string,
    @Body() createCandidatureDto: CreateCandidatureDto,
  ) {
    return this.candidaturesService.create(userId, createCandidatureDto);
  }

  @Get('candidate')
  @Roles(Role.candidat)
  findAllForCandidate(@CurrentUser('id') userId: string) {
    return this.candidaturesService.findAllForCandidate(userId);
  }

  @Get('client')
  @Roles(Role.client)
  findAllForClient(@CurrentUser('id') userId: string) {
    return this.candidaturesService.findAllForClient(userId);
  }

  @Patch(':id/status')
  @Roles(Role.client)
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('status') status: CandidatureStatus,
  ) {
    return this.candidaturesService.updateStatus(id, userId, status);
  }
}
