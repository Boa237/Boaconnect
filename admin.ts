import { api } from './client';
import { Listing } from '../types';

export const adminApi = {
  findPending: () => api.get<{ data: Listing[] }>('/admin/listings?status=pending').then((r) => r.data.data),
  approve: (id: string) => api.patch(`/admin/listings/${id}/approve`),
  reject: (id: string, reason: string) => api.patch(`/admin/listings/${id}/reject`, { reason }),
  remove: (id: string) => api.delete(`/admin/listings/${id}`),
};
