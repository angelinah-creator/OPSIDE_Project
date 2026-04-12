'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { CandidateProfile, ClientProfile, Experience, Education } from '@/types';

export function useCandidateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = async (): Promise<CandidateProfile> => {
    const res = await api.get('/candidate/profile/me');
    return res.data;
  };

  const createProfile = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await api.post('/candidate/profile', data);
      return res.data;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur';
      setError(msg); throw err;
    } finally { setLoading(false); }
  };

  const updateProfile = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await api.patch('/candidate/profile', data);
      return res.data;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur';
      setError(msg); throw err;
    } finally { setLoading(false); }
  };

  const uploadPhoto = async (file: File) => {
    const form = new FormData();
    form.append('photo', file);
    const res = await api.post('/candidate/profile/photo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  };

  // Experiences
  const getExperiences = async (): Promise<Experience[]> => {
    const res = await api.get('/candidate/experiences');
    return res.data;
  };

  const createExperience = async (data: Record<string, unknown>) => {
    const res = await api.post('/candidate/experiences', data);
    return res.data;
  };

  const updateExperience = async (id: string, data: Record<string, unknown>) => {
    const res = await api.patch(`/candidate/experiences/${id}`, data);
    return res.data;
  };

  const deleteExperience = async (id: string) => {
    const res = await api.delete(`/candidate/experiences/${id}`);
    return res.data;
  };

  const uploadExperienceMedia = async (experienceId: string, file: File) => {
    const form = new FormData();
    form.append('media', file);
    const res = await api.post(`/candidate/experiences/${experienceId}/media`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  };

  const deleteExperienceMedia = async (experienceId: string, mediaId: string) => {
    const res = await api.delete(`/candidate/experiences/${experienceId}/media/${mediaId}`);
    return res.data;
  };

  // Educations
  const getEducations = async (): Promise<Education[]> => {
    const res = await api.get('/candidate/educations');
    return res.data;
  };

  const createEducation = async (data: Record<string, unknown>) => {
    const res = await api.post('/candidate/educations', data);
    return res.data;
  };

  const updateEducation = async (id: string, data: Record<string, unknown>) => {
    const res = await api.patch(`/candidate/educations/${id}`, data);
    return res.data;
  };

  const deleteEducation = async (id: string) => {
    const res = await api.delete(`/candidate/educations/${id}`);
    return res.data;
  };

  const uploadEducationMedia = async (educationId: string, file: File) => {
    const form = new FormData();
    form.append('media', file);
    const res = await api.post(`/candidate/educations/${educationId}/media`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  };

  return {
    loading, error,
    getProfile, createProfile, updateProfile, uploadPhoto,
    getExperiences, createExperience, updateExperience, deleteExperience,
    uploadExperienceMedia, deleteExperienceMedia,
    getEducations, createEducation, updateEducation, deleteEducation,
    uploadEducationMedia,
  };
}

export function useClientProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = async (): Promise<ClientProfile> => {
    const res = await api.get('/client/profile/me');
    return res.data;
  };

  const createProfile = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await api.post('/client/profile', data);
      return res.data;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur';
      setError(msg); throw err;
    } finally { setLoading(false); }
  };

  const updateProfile = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await api.patch('/client/profile', data);
      return res.data;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur';
      setError(msg); throw err;
    } finally { setLoading(false); }
  };

  const uploadLogo = async (file: File) => {
    const form = new FormData();
    form.append('logo', file);
    const res = await api.post('/client/profile/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  };

  return { loading, error, getProfile, createProfile, updateProfile, uploadLogo };
}

export function useSkills() {
  const getSkills = async (category?: string) => {
    const url = category ? `/skills?category=${category}` : '/skills';
    const res = await api.get(url);
    return res.data;
  };
  return { getSkills };
}
