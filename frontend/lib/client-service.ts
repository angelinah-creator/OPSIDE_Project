import api from './api';
import { optimizeImageForUpload, uploadLimits } from './upload-utils';

export type CompanySize = 'size_1_10' | 'size_11_50' | 'size_51_200' | 'size_200_plus';

export interface ClientProfile {
  id: string;
  user_id: string;
  company_name: string;
  company_size?: CompanySize;
  industry?: string;
  country: string;
  city?: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  website?: string;
  interview_availability?: string;
  logo_url?: string;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export const clientApi = {
  getMyProfile: async (): Promise<ClientProfile> => {
    const res = await api.get('/client/profile/me');
    return res.data;
  },

  createProfile: async (data: Record<string, unknown>) => {
    const res = await api.post('/client/profile', data);
    return res.data;
  },

  updateProfile: async (data: Record<string, unknown>) => {
    const res = await api.patch('/client/profile', data);
    return res.data;
  },

  uploadLogo: async (file: File) => {
    const optimizedFile = await optimizeImageForUpload(file);
    if (optimizedFile.size > uploadLimits.defaultMaxBytes) {
      throw new Error('IMAGE_TOO_LARGE');
    }

    const form = new FormData();
    form.append('logo', optimizedFile);
    const res = await api.post('/client/profile/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  updateUserNames: async (data: { first_name?: string; last_name?: string }) => {
    const res = await api.patch('/users/me', data);
    return res.data;
  },
};
