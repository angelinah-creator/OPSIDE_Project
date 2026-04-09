import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateCandidateProfileDto } from './dto/create-profile.dto';
import { UpdateCandidateProfileDto } from './dto/update-profile.dto';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';

@Injectable()
export class CandidateService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  // ─── Profile ───

  async createProfile(userId: string, dto: CreateCandidateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'candidat') {
      throw new ForbiddenException('Seuls les candidats peuvent créer un profil candidat');
    }

    const existing = await this.prisma.candidateProfile.findUnique({ where: { user_id: userId } });
    if (existing) {
      throw new ConflictException('Un profil candidat existe déjà pour cet utilisateur');
    }

    if (dto.skill_ids && dto.skill_ids.length > 0) {
      const skills = await this.prisma.skill.findMany({
        where: { id: { in: dto.skill_ids } },
      });
      if (skills.length !== dto.skill_ids.length) {
        throw new BadRequestException('Une ou plusieurs compétences sont invalides');
      }
    }

    const requiredFields = ['country', 'speciality', 'experience_years', 'daily_rate', 'currency', 'availability'];
    const profileCompleted = requiredFields.every((f) => dto[f] !== undefined && dto[f] !== null);

    const { skill_ids, ...profileData } = dto;

    const profile = await this.prisma.candidateProfile.create({
      data: {
        ...profileData,
        user_id: userId,
        profile_completed: profileCompleted,
        candidate_skills: skill_ids && skill_ids.length > 0
          ? { create: skill_ids.map((id) => ({ skill_id: id })) }
          : undefined,
      },
      include: {
        candidate_skills: { include: { skill: true } },
        user: { select: { id: true, email: true, first_name: true, last_name: true } },
      },
    });

    return { message: 'Profil créé avec succès', profile };
  }

  async getMyProfile(userId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { user_id: userId },
      include: {
        user: { select: { id: true, email: true, first_name: true, last_name: true } },
        candidate_skills: { include: { skill: true } },
        experiences: {
          include: {
            experience_skills: { include: { skill: true } },
            experience_medias: true,
          },
          orderBy: [{ is_current: 'desc' }, { start_year: 'desc' }, { start_month: 'desc' }],
        },
        educations: {
          include: {
            education_skills: { include: { skill: true } },
            education_medias: true,
          },
          orderBy: [{ is_current: 'desc' }, { start_year: 'desc' }, { start_month: 'desc' }],
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profil candidat non trouvé');
    }

    return profile;
  }

  async getProfileById(profileId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { id: profileId },
      include: {
        user: { select: { id: true, first_name: true, last_name: true } },
        candidate_skills: { include: { skill: true } },
        experiences: {
          include: {
            experience_skills: { include: { skill: true } },
            experience_medias: true,
          },
          orderBy: [{ is_current: 'desc' }, { start_year: 'desc' }, { start_month: 'desc' }],
        },
        educations: {
          include: {
            education_skills: { include: { skill: true } },
            education_medias: true,
          },
          orderBy: [{ is_current: 'desc' }, { start_year: 'desc' }, { start_month: 'desc' }],
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profil candidat non trouvé');
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateCandidateProfileDto) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { user_id: userId } });
    if (!profile) {
      throw new NotFoundException('Profil candidat non trouvé');
    }

    if (dto.skill_ids !== undefined) {
      if (dto.skill_ids.length > 0) {
        const skills = await this.prisma.skill.findMany({
          where: { id: { in: dto.skill_ids } },
        });
        if (skills.length !== dto.skill_ids.length) {
          throw new BadRequestException('Une ou plusieurs compétences sont invalides');
        }
      }
      await this.prisma.candidateSkill.deleteMany({ where: { candidate_id: profile.id } });
    }

    const { skill_ids, ...profileData } = dto;

    const updatedProfile = await this.prisma.candidateProfile.update({
      where: { user_id: userId },
      data: {
        ...profileData,
        candidate_skills: skill_ids !== undefined && skill_ids.length > 0
          ? { create: skill_ids.map((id) => ({ skill_id: id })) }
          : undefined,
      },
      include: {
        candidate_skills: { include: { skill: true } },
        user: { select: { id: true, email: true, first_name: true, last_name: true } },
      },
    });

    return { message: 'Profil mis à jour avec succès', profile: updatedProfile };
  }

  async uploadPhoto(userId: string, file: Express.Multer.File) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { user_id: userId } });
    if (!profile) {
      throw new NotFoundException('Profil candidat non trouvé');
    }

    const { url, public_id } = await this.uploadService.uploadImage(file, 'candidates/photos');

    const updated = await this.prisma.candidateProfile.update({
      where: { user_id: userId },
      data: { photo_url: url },
    });

    return { message: 'Photo uploadée avec succès', photo_url: updated.photo_url };
  }

  // ─── Experiences ────

  async createExperience(userId: string, dto: CreateExperienceDto) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { user_id: userId } });
    if (!profile) {
      throw new NotFoundException('Profil candidat non trouvé. Créez votre profil d\'abord.');
    }

    if (dto.skill_ids && dto.skill_ids.length > 0) {
      const skills = await this.prisma.skill.findMany({ where: { id: { in: dto.skill_ids } } });
      if (skills.length !== dto.skill_ids.length) {
        throw new BadRequestException('Une ou plusieurs compétences sont invalides');
      }
    }

    const { skill_ids, ...expData } = dto;

    const experience = await this.prisma.experience.create({
      data: {
        ...expData,
        candidate_id: profile.id,
        experience_skills: skill_ids && skill_ids.length > 0
          ? { create: skill_ids.map((id) => ({ skill_id: id })) }
          : undefined,
      },
      include: {
        experience_skills: { include: { skill: true } },
        experience_medias: true,
      },
    });

    return { message: 'Expérience ajoutée avec succès', experience };
  }

  async getExperiences(userId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Profil candidat non trouvé');

    return this.prisma.experience.findMany({
      where: { candidate_id: profile.id },
      include: {
        experience_skills: { include: { skill: true } },
        experience_medias: true,
      },
      orderBy: [{ is_current: 'desc' }, { start_year: 'desc' }, { start_month: 'desc' }],
    });
  }

  async updateExperience(userId: string, experienceId: string, dto: UpdateExperienceDto) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Profil candidat non trouvé');

    const experience = await this.prisma.experience.findFirst({
      where: { id: experienceId, candidate_id: profile.id },
    });
    if (!experience) throw new NotFoundException('Expérience non trouvée');

    if (dto.skill_ids !== undefined) {
      if (dto.skill_ids.length > 0) {
        const skills = await this.prisma.skill.findMany({ where: { id: { in: dto.skill_ids } } });
        if (skills.length !== dto.skill_ids.length) {
          throw new BadRequestException('Une ou plusieurs compétences sont invalides');
        }
      }
      await this.prisma.experienceSkill.deleteMany({ where: { experience_id: experienceId } });
    }

    const { skill_ids, ...expData } = dto;

    const updated = await this.prisma.experience.update({
      where: { id: experienceId },
      data: {
        ...expData,
        experience_skills: skill_ids !== undefined && skill_ids.length > 0
          ? { create: skill_ids.map((id) => ({ skill_id: id })) }
          : undefined,
      },
      include: {
        experience_skills: { include: { skill: true } },
        experience_medias: true,
      },
    });

    return { message: 'Expérience mise à jour', experience: updated };
  }

  async deleteExperience(userId: string, experienceId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Profil candidat non trouvé');

    const experience = await this.prisma.experience.findFirst({
      where: { id: experienceId, candidate_id: profile.id },
    });
    if (!experience) throw new NotFoundException('Expérience non trouvée');

    await this.prisma.experience.delete({ where: { id: experienceId } });
    return { message: 'Expérience supprimée avec succès' };
  }

  async uploadExperienceMedia(userId: string, experienceId: string, file: Express.Multer.File) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Profil candidat non trouvé');

    const experience = await this.prisma.experience.findFirst({
      where: { id: experienceId, candidate_id: profile.id },
    });
    if (!experience) throw new NotFoundException('Expérience non trouvée');

    const uploaded = await this.uploadService.uploadMedia(file, 'candidates/experience-media');

    const media = await this.prisma.experienceMedia.create({
      data: {
        experience_id: experienceId,
        url: uploaded.url,
        media_type: uploaded.media_type,
        public_id: uploaded.public_id,
      },
    });

    return { message: 'Média ajouté avec succès', media };
  }

  async deleteExperienceMedia(userId: string, experienceId: string, mediaId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Profil candidat non trouvé');

    const experience = await this.prisma.experience.findFirst({
      where: { id: experienceId, candidate_id: profile.id },
    });
    if (!experience) throw new NotFoundException('Expérience non trouvée');

    const media = await this.prisma.experienceMedia.findFirst({
      where: { id: mediaId, experience_id: experienceId },
    });
    if (!media) throw new NotFoundException('Média non trouvé');

    if (media.public_id) {
      await this.uploadService.deleteFile(media.public_id);
    }

    await this.prisma.experienceMedia.delete({ where: { id: mediaId } });
    return { message: 'Média supprimé avec succès' };
  }

  // ─── Educations ────

  async createEducation(userId: string, dto: CreateEducationDto) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { user_id: userId } });
    if (!profile) {
      throw new NotFoundException('Profil candidat non trouvé. Créez votre profil d\'abord.');
    }

    if (dto.skill_ids && dto.skill_ids.length > 0) {
      const skills = await this.prisma.skill.findMany({ where: { id: { in: dto.skill_ids } } });
      if (skills.length !== dto.skill_ids.length) {
        throw new BadRequestException('Une ou plusieurs compétences sont invalides');
      }
    }

    const { skill_ids, ...eduData } = dto;

    const education = await this.prisma.education.create({
      data: {
        ...eduData,
        candidate_id: profile.id,
        education_skills: skill_ids && skill_ids.length > 0
          ? { create: skill_ids.map((id) => ({ skill_id: id })) }
          : undefined,
      },
      include: {
        education_skills: { include: { skill: true } },
        education_medias: true,
      },
    });

    return { message: 'Formation ajoutée avec succès', education };
  }

  async getEducations(userId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Profil candidat non trouvé');

    return this.prisma.education.findMany({
      where: { candidate_id: profile.id },
      include: {
        education_skills: { include: { skill: true } },
        education_medias: true,
      },
      orderBy: [{ is_current: 'desc' }, { start_year: 'desc' }, { start_month: 'desc' }],
    });
  }

  async updateEducation(userId: string, educationId: string, dto: UpdateEducationDto) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Profil candidat non trouvé');

    const education = await this.prisma.education.findFirst({
      where: { id: educationId, candidate_id: profile.id },
    });
    if (!education) throw new NotFoundException('Formation non trouvée');

    if (dto.skill_ids !== undefined) {
      if (dto.skill_ids.length > 0) {
        const skills = await this.prisma.skill.findMany({ where: { id: { in: dto.skill_ids } } });
        if (skills.length !== dto.skill_ids.length) {
          throw new BadRequestException('Une ou plusieurs compétences sont invalides');
        }
      }
      await this.prisma.educationSkill.deleteMany({ where: { education_id: educationId } });
    }

    const { skill_ids, ...eduData } = dto;

    const updated = await this.prisma.education.update({
      where: { id: educationId },
      data: {
        ...eduData,
        education_skills: skill_ids !== undefined && skill_ids.length > 0
          ? { create: skill_ids.map((id) => ({ skill_id: id })) }
          : undefined,
      },
      include: {
        education_skills: { include: { skill: true } },
        education_medias: true,
      },
    });

    return { message: 'Formation mise à jour', education: updated };
  }

  async deleteEducation(userId: string, educationId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Profil candidat non trouvé');

    const education = await this.prisma.education.findFirst({
      where: { id: educationId, candidate_id: profile.id },
    });
    if (!education) throw new NotFoundException('Formation non trouvée');

    await this.prisma.education.delete({ where: { id: educationId } });
    return { message: 'Formation supprimée avec succès' };
  }

  async uploadEducationMedia(userId: string, educationId: string, file: Express.Multer.File) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Profil candidat non trouvé');

    const education = await this.prisma.education.findFirst({
      where: { id: educationId, candidate_id: profile.id },
    });
    if (!education) throw new NotFoundException('Formation non trouvée');

    const uploaded = await this.uploadService.uploadMedia(file, 'candidates/education-media');

    const media = await this.prisma.educationMedia.create({
      data: {
        education_id: educationId,
        url: uploaded.url,
        media_type: uploaded.media_type,
        public_id: uploaded.public_id,
      },
    });

    return { message: 'Média ajouté avec succès', media };
  }

  async deleteEducationMedia(userId: string, educationId: string, mediaId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Profil candidat non trouvé');

    const education = await this.prisma.education.findFirst({
      where: { id: educationId, candidate_id: profile.id },
    });
    if (!education) throw new NotFoundException('Formation non trouvée');

    const media = await this.prisma.educationMedia.findFirst({
      where: { id: mediaId, education_id: educationId },
    });
    if (!media) throw new NotFoundException('Média non trouvé');

    if (media.public_id) {
      await this.uploadService.deleteFile(media.public_id);
    }

    await this.prisma.educationMedia.delete({ where: { id: mediaId } });
    return { message: 'Média supprimé avec succès' };
  }
}
