import {
  Controller,
  Get,
  Post,
  Patch,
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
import { ClientService } from './client.service';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('client')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post('profile')
  @Roles(Role.client)
  @HttpCode(HttpStatus.CREATED)
  createProfile(@CurrentUser('id') userId: string, @Body() dto: CreateClientProfileDto) {
    return this.clientService.createProfile(userId, dto);
  }

  @Get('profile/me')
  @Roles(Role.client)
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.clientService.getMyProfile(userId);
  }

  @Get('profile/:id')
  @Roles(Role.client, Role.admin)
  getProfileById(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientService.getProfileById(id);
  }

  @Patch('profile')
  @Roles(Role.client)
  updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateClientProfileDto) {
    return this.clientService.updateProfile(userId, dto);
  }

  @Post('profile/logo')
  @Roles(Role.client)
  @UseInterceptors(FileInterceptor('logo', { storage: memoryStorage() }))
  uploadLogo(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.clientService.uploadLogo(userId, file);
  }
}
