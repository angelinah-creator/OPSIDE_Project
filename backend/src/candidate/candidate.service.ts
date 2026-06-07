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
import { Country, Currency } from '@prisma/client';

@Injectable()
export class CandidateService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}


  // Create profile
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

    const requiredFields = ['country', 'speciality', 'experience_years', 'daily_rate', 'availability'];
    const profileCompleted = requiredFields.every((f) => dto[f] !== undefined && dto[f] !== null);

    const { skill_ids, currency, ...profileData } = dto;
    
    const mappedCurrency = this.mapCountryToCurrency(profileData.country);

    const profile = await this.prisma.candidateProfile.create({
      data: {
        ...profileData,
        currency: mappedCurrency,
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

  // Récupère my profile
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

  // Récupère profile by id
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

  // Find all profiles
  async findAllProfiles() {
    const profiles = await this.prisma.candidateProfile.findMany({
      where: { 
        profile_completed: true,
      },
      include: {
        candidate_skills: { include: { skill: true } },
        experiences: {
          select: {
            title: true,
            company: true,
            start_year: true,
            end_year: true,
            description: true,
          }
        },
        educations: {
          select: {
            school: true,
            degree: true,
            level: true,
          }
        }
      },
      orderBy: { updated_at: 'desc' }
    });

    return profiles.map(p => ({
      id: p.id,
      user_id: p.user_id,
      speciality: p.speciality,
      custom_speciality: p.custom_speciality,
      experience_years: p.experience_years,
      daily_rate: p.daily_rate,
      currency: p.currency,
      availability: p.availability,
      bio: p.bio,
      title: p.title,
      skills: p.candidate_skills.map(cs => cs.skill),
      experiences: p.experiences,
      educations: p.educations,
    }));
  }

  // Récupère applied job ids
  async getAppliedJobIds(candidateId: string) {
    const candidatures = await this.prisma.candidature.findMany({
      where: { candidate_id: candidateId },
      select: { job_offer_id: true }
    });
    return candidatures.map(c => c.job_offer_id);
  }

  // Update profile
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

  // Upload photo
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

  // Delete photo
  async deletePhoto(userId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Profil candidat non trouvé');

    await this.prisma.candidateProfile.update({
      where: { user_id: userId },
      data: { photo_url: null },
    });

    return { message: 'Photo supprimée avec succès' };
  }


  // Create experience
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

  // Récupère experiences
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

  // Update experience
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

  // Delete experience
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

  // Upload experience media
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

  // Delete experience media
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


  // Create education
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

  // Récupère educations
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

  // Update education
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

  // Delete education
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

  // Upload education media
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

  // Delete education media
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

  // Récupère history
  async getHistory(userId: string) {
    const [candidatures, tests] = await Promise.all([
      this.prisma.candidature.findMany({
        where: { candidate_id: userId },
        include: {
          job_offer: {
            include: {
              client: {
                include: {
                  client: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.customTest.findMany({
        where: { candidate_id: userId },
        include: {
          match: {
            include: {
              client: {
                include: {
                  client: true,
                },
              },
              job_offer: true,
            },
          },
        },
      }),
    ]);

    const existingHistories = await this.prisma.history.findMany({
      where: { user_id: userId },
    });

    const existingMap = new Map<string, any>(
      existingHistories.map((h) => [`${h.type}-${h.reference_id}`, h]),
    );

    const historyItemsToCreate: any[] = [];
    const historyItemsToUpdate: any[] = [];

    for (const cand of candidatures) {
      const companyName = cand.job_offer?.client?.client?.company_name || 'Entreprise';
      const status = cand.status;
      
      let result = 'En attente';
      let color = 'bg-blue-500';
      
      if (status === 'matched') {
        result = 'Matché';
        color = 'bg-emerald-500';
      } else if (status === 'rejected') {
        result = 'Rejeté';
        color = 'bg-red-500';
      } else if (status === 'withdrawn') {
        result = 'Retiré';
        color = 'bg-slate-500';
      }

      const title = `Candidature envoyée - ${companyName}`;
      const date = cand.applied_at;
      const key = `apply-${cand.id}`;

      const existing = existingMap.get(key);
      if (!existing) {
        historyItemsToCreate.push({
          user_id: userId,
          type: 'apply',
          title,
          date: new Date(date),
          result,
          icon: 'Briefcase',
          color,
          reference_id: cand.id,
        });
      } else {
        if (existing.result !== result || existing.color !== color || existing.title !== title) {
          historyItemsToUpdate.push({
            id: existing.id,
            data: { result, color, title },
          });
        }
      }
    }

    for (const test of tests) {
      const companyName = test.match?.client?.client?.company_name || test.match?.job_offer?.title || 'Entreprise';
      const status = test.status;
      const score = test.score;
      
      let result = 'À passer';
      let color = 'bg-blue-500';

      if (status === 'scored') {
        const scoreVal = score !== null && score !== undefined ? score : 0;
        result = `${scoreVal}%`;
        color = scoreVal >= (test.threshold || 75) ? 'bg-emerald-500' : 'bg-red-500';
      } else if (status === 'in_progress') {
        result = 'En cours';
        color = 'bg-blue-500';
      } else if (status === 'submitted') {
        result = 'Soumis';
        color = 'bg-amber-500';
      } else if (status === 'expired') {
        result = 'Expiré';
        color = 'bg-slate-500';
      }

      const title = `Test technique - ${companyName}`;
      const date = test.submitted_at || test.created_at;
      const key = `test-${test.id}`;

      const existing = existingMap.get(key);
      if (!existing) {
        historyItemsToCreate.push({
          user_id: userId,
          type: 'test',
          title,
          date: new Date(date),
          result,
          icon: 'Code2',
          color,
          reference_id: test.id,
        });
      } else {
        if (existing.result !== result || existing.color !== color || existing.title !== title) {
          historyItemsToUpdate.push({
            id: existing.id,
            data: { result, color, title },
          });
        }
      }
    }

    if (historyItemsToCreate.length > 0) {
      await this.prisma.history.createMany({
        data: historyItemsToCreate,
      });
    }

    for (const item of historyItemsToUpdate) {
      await this.prisma.history.update({
        where: { id: item.id },
        data: item.data,
      });
    }

    return this.prisma.history.findMany({
      where: {
        user_id: userId,
        is_deleted: false,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  // Delete history item
  async deleteHistoryItem(userId: string, itemId: string) {
    const historyItem = await this.prisma.history.findUnique({
      where: { id: itemId },
    });

    if (!historyItem) {
      throw new NotFoundException("Activité introuvable dans l'historique");
    }

    if (historyItem.user_id !== userId) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à supprimer cette activité");
    }

    await this.prisma.history.update({
      where: { id: itemId },
      data: { is_deleted: true },
    });

    return { message: "Activité supprimée de l'historique avec succès" };
  }

  // Map country to currency
  private mapCountryToCurrency(country: Country): Currency {
    const mapping: Record<Country, Currency> = {
      madagascar: Currency.MGA,
      senegal: Currency.XOF,
      maurice: Currency.MUR,
      kenya: Currency.KES,
      nigeria: Currency.NGN,
      egypte: Currency.EGP,
      maroc: Currency.MAD,
      tunisie: Currency.TND,
    };
    return mapping[country] || Currency.USD;
  }
}
