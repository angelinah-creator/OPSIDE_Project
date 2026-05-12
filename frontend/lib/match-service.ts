import api from './api';

export interface CreateMatchDto {
  candidate_id: string;
  job_offer_id?: string;
}

export const matchService = {
  source: async (dto: CreateMatchDto) => {
    const { data } = await api.post('/matches/source', dto);
    return data;
  },

  respond: async (id: string, action: 'confirm' | 'reject') => {
    const { data } = await api.patch(`/matches/${id}/respond`, { action });
    return data;
  },

  getCandidateMatches: async () => {
    const { data } = await api.get('/matches/candidate');
    return data;
  },

  getClientMatches: async () => {
    const { data } = await api.get('/matches/client');
    return data;
  },
};
