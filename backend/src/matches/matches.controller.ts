import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('matches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post('source')
  @Roles(Role.client)
  sourceCandidate(
    @CurrentUser('id') userId: string,
    @Body() createMatchDto: CreateMatchDto,
  ) {
    return this.matchesService.sourceCandidate(userId, createMatchDto);
  }

  @Patch(':id/respond')
  respondToMatch(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Body('action') action: 'confirm' | 'reject',
  ) {
    return this.matchesService.respondToMatch(id, userId, role, action);
  }

  @Get('candidate')
  @Roles(Role.candidat)
  findAllForCandidate(@CurrentUser('id') userId: string) {
    return this.matchesService.findAllForCandidate(userId);
  }

  @Get('client')
  @Roles(Role.client)
  findAllForClient(@CurrentUser('id') userId: string) {
    return this.matchesService.findAllForClient(userId);
  }
}
