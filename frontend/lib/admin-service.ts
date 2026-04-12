import api from './api';

export const adminApi = {
  getUsers: async (role?: string) => {
    return api.get('/admin/users', { params: { role } });
  },

  updateUserStatus: async (userId: string, status: string) => {
    return api.patch(`/admin/users/${userId}/status`, { status });
  },
};
