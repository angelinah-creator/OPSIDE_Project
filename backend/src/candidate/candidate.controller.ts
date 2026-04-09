import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CandidateService } from './candidate.service';
import { CreateCandidateProfileDto } from './dto/create-profile.dto';
import { UpdateCandidateProfileDto } from './dto/update-profile.dto';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('candidate')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  // ─── Profile ──────────────────────────────────────────────────────

  @Post('profile')
  @Roles(Role.candidat)
  @HttpCode(HttpStatus.CREATED)
  createProfile(@CurrentUser('id') userId: string, @Body() dto: CreateCandidateProfileDto) {
    return this.candidateService.createProfile(userId, dto);
  }

  @Get('profile/me')
  @Roles(Role.candidat)
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.candidateService.getMyProfile(userId);
  }

  @Get('profile/:id')
  @Roles(Role.candidat, Role.client, Role.admin)
  getProfileById(@Param('id', ParseUUIDPipe) id: string) {
    return this.candidateService.getProfileById(id);
  }

  @Patch('profile')
  @Roles(Role.candidat)
  updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateCandidateProfileDto) {
    return this.candidateService.updateProfile(userId, dto);
  }

  @Post('profile/photo')
  @Roles(Role.candidat)
  @UseInterceptors(FileInterceptor('photo', { storage: memoryStorage() }))
  uploadPhoto(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.candidateService.uploadPhoto(userId, file);
  }

  // ─── Experiences ──────────────────────────────────────────────────

  @Post('experiences')
  @Roles(Role.candidat)
  @HttpCode(HttpStatus.CREATED)
  createExperience(@CurrentUser('id') userId: string, @Body() dto: CreateExperienceDto) {
    return this.candidateService.createExperience(userId, dto);
  }

  @Get('experiences')
  @Roles(Role.candidat)
  getExperiences(@CurrentUser('id') userId: string) {
    return this.candidateService.getExperiences(userId);
  }

  @Patch('experiences/:id')
  @Roles(Role.candidat)
  updateExperience(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) experienceId: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    return this.candidateService.updateExperience(userId, experienceId, dto);
  }

  @Delete('experiences/:id')
  @Roles(Role.candidat)
  @HttpCode(HttpStatus.OK)
  deleteExperience(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) experienceId: string,
  ) {
    return this.candidateService.deleteExperience(userId, experienceId);
  }

  @Post('experiences/:id/media')
  @Roles(Role.candidat)
  @UseInterceptors(FileInterceptor('media', { storage: memoryStorage() }))
  uploadExperienceMedia(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) experienceId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.candidateService.uploadExperienceMedia(userId, experienceId, file);
  }

  @Delete('experiences/:experienceId/media/:mediaId')
  @Roles(Role.candidat)
  deleteExperienceMedia(
    @CurrentUser('id') userId: string,
    @Param('experienceId', ParseUUIDPipe) experienceId: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
  ) {
    return this.candidateService.deleteExperienceMedia(userId, experienceId, mediaId);
  }

  // ─── Educations ───────────────────────────────────────────────────

  @Post('educations')
  @Roles(Role.candidat)
  @HttpCode(HttpStatus.CREATED)
  createEducation(@CurrentUser('id') userId: string, @Body() dto: CreateEducationDto) {
    return this.candidateService.createEducation(userId, dto);
  }

  @Get('educations')
  @Roles(Role.candidat)
  getEducations(@CurrentUser('id') userId: string) {
    return this.candidateService.getEducations(userId);
  }

  @Patch('educations/:id')
  @Roles(Role.candidat)
  updateEducation(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) educationId: string,
    @Body() dto: UpdateEducationDto,
  ) {
    return this.candidateService.updateEducation(userId, educationId, dto);
  }

  @Delete('educations/:id')
  @Roles(Role.candidat)
  @HttpCode(HttpStatus.OK)
  deleteEducation(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) educationId: string,
  ) {
    return this.candidateService.deleteEducation(userId, educationId);
  }

  @Post('educations/:id/media')
  @Roles(Role.candidat)
  @UseInterceptors(FileInterceptor('media', { storage: memoryStorage() }))
  uploadEducationMedia(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) educationId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.candidateService.uploadEducationMedia(userId, educationId, file);
  }

  @Delete('educations/:educationId/media/:mediaId')
  @Roles(Role.candidat)
  deleteEducationMedia(
    @CurrentUser('id') userId: string,
    @Param('educationId', ParseUUIDPipe) educationId: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
  ) {
    return this.candidateService.deleteEducationMedia(userId, educationId, mediaId);
  }
}
