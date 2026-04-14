import api from './api';

export interface Skill {
  id: string;
  name: string;
  category: string;
  is_custom?: boolean;
  owner_id?: string;
}

export const skillApi = {
  getSkills: async (category?: string): Promise<Skill[]> => {
    const url = category ? `/skills?category=${category}` : '/skills';
    const res = await api.get(url);
    return res.data;
  },

  createSkill: async (name: string, category: string): Promise<Skill> => {
    const res = await api.post('/skills', { name, category });
    return res.data;
  },

  updateSkill: async (id: string, name: string, category: string): Promise<Skill> => {
    const res = await api.patch(`/skills/${id}`, { name, category });
    return res.data;
  },

  deleteSkill: async (id: string): Promise<void> => {
    await api.delete(`/skills/${id}`);
  },
};
