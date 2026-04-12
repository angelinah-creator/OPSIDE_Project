import api from './api';

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export const skillApi = {
  getSkills: async (category?: string): Promise<Skill[]> => {
    const url = category ? `/skills?category=${category}` : '/skills';
    const res = await api.get(url);
    return res.data;
  },
};
