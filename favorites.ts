import { api } from './client';
import { Listing } from '../types';

export const favoritesApi = {
  findMine: () => api.get<{ data: Listing[] }>('/favorites').then((r) => r.data.data),
  add: (listingId: string) => api.post(`/favorites/${listingId}`),
  remove: (listingId: string) => api.delete(`/favorites/${listingId}`),
};
