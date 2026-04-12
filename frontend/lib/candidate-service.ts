import api from './api';
import { Skill } from './skill-service';

export type Availability = 'immediate' | 'one_week' | 'two_weeks' | 'one_month' | 'more';
export type Currency = 'EUR' | 'USD' | 'MGA';
export type CandidateStatus = 'open_to_work' | 'not_available' | 'in_mission';

export interface Media {
  id: string;
  url: string;
  type: string;
  name?: string;
}

export interface Experience {
  id: string;
  title: string;
  employment_type: string;
  company: string;
  start_month: number;
  start_year: number;
  end_month?: number;
  end_year?: number;
  is_current: boolean;
  location?: string;
  description?: string;
  skills: Skill[];
  medias?: Media[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field?: string;
  start_month: number;
  start_year: number;
  end_month?: number;
  end_year?: number;
  is_current: boolean;
  level: string;
  description?: string;
  skills: Skill[];
  medias?: Media[];
}

export interface CandidateProfile {
  id: string;
  user_id: string;
  country: string;
  city?: string;
  speciality: string;
  experience_years: number;
  daily_rate: number;
  currency: Currency;
  availability: Availability;
  bio?: string;
  phone?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  photo_url?: string;
  status: CandidateStatus;
  skills: Skill[];
  experiences: Experience[];
  educations: Education[];
}

export const candidateApi = {
  getProfile: async (): Promise<CandidateProfile> => {
    const res = await api.get('/candidate/profile/me');
    return res.data;
  },

  createProfile: async (data: Record<string, unknown>) => {
    const res = await api.post('/candidate/profile', data);
    return res.data;
  },

  updateProfile: async (data: Record<string, unknown>) => {
    const res = await api.patch('/candidate/profile', data);
    return res.data;
  },

  uploadPhoto: async (file: File) => {
    const form = new FormData();
    form.append('photo', file);
    const res = await api.post('/candidate/profile/photo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getExperiences: async (): Promise<Experience[]> => {
    const res = await api.get('/candidate/experiences');
    return res.data;
  },

  createExperience: async (data: Record<string, unknown>) => {
    const res = await api.post('/candidate/experiences', data);
    return res.data;
  },

  updateExperience: async (id: string, data: Record<string, unknown>) => {
    const res = await api.patch(`/candidate/experiences/${id}`, data);
    return res.data;
  },

  deleteExperience: async (id: string) => {
    const res = await api.delete(`/candidate/experiences/${id}`);
    return res.data;
  },

  uploadExperienceMedia: async (experienceId: string, file: File) => {
    const form = new FormData();
    form.append('media', file);
    const res = await api.post(`/candidate/experiences/${experienceId}/media`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteExperienceMedia: async (experienceId: string, mediaId: string) => {
    const res = await api.delete(`/candidate/experiences/${experienceId}/media/${mediaId}`);
    return res.data;
  },

  getEducations: async (): Promise<Education[]> => {
    const res = await api.get('/candidate/educations');
    return res.data;
  },

  createEducation: async (data: Record<string, unknown>) => {
    const res = await api.post('/candidate/educations', data);
    return res.data;
  },

  updateEducation: async (id: string, data: Record<string, unknown>) => {
    const res = await api.patch(`/candidate/educations/${id}`, data);
    return res.data;
  },

  deleteEducation: async (id: string) => {
    const res = await api.delete(`/candidate/educations/${id}`);
    return res.data;
  },

  uploadEducationMedia: async (educationId: string, file: File) => {
    const form = new FormData();
    form.append('media', file);
    const res = await api.post(`/candidate/educations/${educationId}/media`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
