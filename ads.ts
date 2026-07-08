import { api } from './client';

export const adsApi = {
  findActive: (placement: 'home_banner' | 'category_top' | 'search_top') =>
    api.get('/ads', { params: { placement } }).then((r) => r.data.data),
  registerClick: (id: string) => api.post(`/ads/${id}/click`),
};
