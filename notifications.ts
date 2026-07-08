import { api } from './client';

export const notificationsApi = {
  findMine: () => api.get('/notifications').then((r) => r.data.data),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};
