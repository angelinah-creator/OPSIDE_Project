import api from './api';

export const adminApi = {
  getUsers: async (role?: string) => {
    return api.get('/users', { params: { role } });
  },

  updateUserStatus: async (userId: string, status: string) => {
    return api.patch(`/users/${userId}/status`, { status });
  },
};
