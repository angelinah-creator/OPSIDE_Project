import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';

@Injectable()
export class ClientService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  // Create profile
  async createProfile(userId: string, dto: CreateClientProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'client') {
      throw new ForbiddenException('Seuls les clients peuvent créer un profil client');
    }

    const existing = await this.prisma.clientProfile.findUnique({ where: { user_id: userId } });
    if (existing) {
      throw new ConflictException('Un profil client existe déjà pour cet utilisateur');
    }

    const profile = await this.prisma.clientProfile.create({
      data: {
        ...dto,
        user_id: userId,
      },
      include: {
        user: { select: { id: true, email: true, first_name: true, last_name: true } },
      },
    });

    return { message: 'Profil client créé avec succès', profile };
  }

  // Récupère my profile
  async getMyProfile(userId: string) {
    const profile = await this.prisma.clientProfile.findUnique({
      where: { user_id: userId },
      include: {
        user: { select: { id: true, email: true, first_name: true, last_name: true } },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profil client non trouvé');
    }

    return profile;
  }

  // Récupère profile by id
  async getProfileById(profileId: string) {
    const profile = await this.prisma.clientProfile.findUnique({
      where: { id: profileId },
      include: {
        user: { select: { id: true, first_name: true, last_name: true } },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profil client non trouvé');
    }

    return profile;
  }

  // Update profile
  async updateProfile(userId: string, dto: UpdateClientProfileDto) {
    const profile = await this.prisma.clientProfile.findUnique({ where: { user_id: userId } });
    if (!profile) {
      throw new NotFoundException('Profil client non trouvé');
    }

    const updated = await this.prisma.clientProfile.update({
      where: { user_id: userId },
      data: dto,
      include: {
        user: { select: { id: true, email: true, first_name: true, last_name: true } },
      },
    });

    return { message: 'Profil client mis à jour', profile: updated };
  }

  // Upload logo
  async uploadLogo(userId: string, file: Express.Multer.File) {
    const profile = await this.prisma.clientProfile.findUnique({ where: { user_id: userId } });
    if (!profile) {
      throw new NotFoundException('Profil client non trouvé');
    }

    if (profile.logo_public_id) {
      await this.uploadService.deleteFile(profile.logo_public_id);
    }

    const { url, public_id } = await this.uploadService.uploadImage(file, 'clients/logos');

    const updated = await this.prisma.clientProfile.update({
      where: { user_id: userId },
      data: { logo_url: url, logo_public_id: public_id },
    });

    return { message: 'Logo uploadé avec succès', logo_url: updated.logo_url };
  }
}
