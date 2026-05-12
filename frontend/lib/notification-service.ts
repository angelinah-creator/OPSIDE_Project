import api from './api';

export const notificationService = {
  getAll: async () => {
    const { data } = await api.get('/notifications');
    return data;
  },

  getUnreadCount: async () => {
    const { data } = await api.get('/notifications/unread-count');
    return data;
  },

  markAsRead: async (id: string) => {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await api.patch('/notifications/read-all');
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  },
};
