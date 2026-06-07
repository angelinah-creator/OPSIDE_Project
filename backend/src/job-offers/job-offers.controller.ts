import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JobOffersService } from './job-offers.service';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('job-offers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobOffersController {
  constructor(private readonly jobOffersService: JobOffersService) {}

  // Create
  @Post()
  @Roles(Role.client)
  create(@CurrentUser('id') userId: string, @Body() createJobOfferDto: CreateJobOfferDto) {
    return this.jobOffersService.create(userId, createJobOfferDto);
  }

  // Find all for candidates
  @Get('candidate')
  @Roles(Role.candidat, Role.admin)
  findAllForCandidates() {
    return this.jobOffersService.findAllForCandidates();
  }

  // Find all for client
  @Get('client')
  @Roles(Role.client)
  findAllForClient(@CurrentUser('id') userId: string) {
    return this.jobOffersService.findAllForClient(userId);
  }

  // Find one
  @Get(':id')
  @Roles(Role.client, Role.candidat, Role.admin)
  findOne(@Param('id') id: string) {
    return this.jobOffersService.findOne(id);
  }

  // Update
  @Patch(':id')
  @Roles(Role.client)
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateJobOfferDto: UpdateJobOfferDto,
  ) {
    return this.jobOffersService.update(id, userId, updateJobOfferDto);
  }

  // Remove
  @Delete(':id')
  @Roles(Role.client)
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.jobOffersService.remove(id, userId);
  }
}
