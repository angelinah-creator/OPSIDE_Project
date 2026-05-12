import api from './api';

export interface CreateCandidatureDto {
  job_offer_id: string;
  message?: string;
}

export const candidatureService = {
  apply: async (dto: CreateCandidatureDto) => {
    const { data } = await api.post('/candidatures', dto);
    return data;
  },

  getCandidateApplications: async () => {
    const { data } = await api.get('/candidatures/candidate');
    return data;
  },

  getClientApplications: async () => {
    const { data } = await api.get('/candidatures/client');
    return data;
  },

  updateStatus: async (id: string, status: string) => {
    const { data } = await api.patch(`/candidatures/${id}/status`, { status });
    return data;
  },
};
