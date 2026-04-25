import api from './api';

export const videoApi = {
  getAll: async () => {
    const response = await api.get('/videos');
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/videos/${id}`);
    return response.data;
  },

  create: async (data: FormData) => {
    const response = await api.post('/videos', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, data: { title?: string; description?: string }) => {
    const response = await api.patch(`/videos/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/videos/${id}`);
    return response.data;
  },
};
