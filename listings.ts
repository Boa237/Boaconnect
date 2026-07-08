import { api } from './client';
import { Listing, PaginatedListings } from '../types';

export interface ListingFilters {
  categoryId?: string;
  city?: string;
  neighborhood?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  page?: number;
}

export const listingsApi = {
  findAll: (filters: ListingFilters = {}) =>
    api.get<{ data: PaginatedListings }>('/listings', { params: filters }).then((r) => r.data.data),

  findOne: (id: string) => api.get<{ data: Listing }>(`/listings/${id}`).then((r) => r.data.data),

  // Journalise la consultation pour le moteur de recommandations (utilisateur connecté uniquement).
  trackView: (id: string) => api.post(`/listings/${id}/track-view`),

  findMine: () => api.get<{ data: Listing[] }>('/listings/mine').then((r) => r.data.data),

  create: (payload: Partial<Listing> & { categoryId: string }) =>
    api.post<{ data: Listing }>('/listings', payload).then((r) => r.data.data),

  attachPhotos: (id: string, urls: string[]) =>
    api.post<{ data: Listing }>(`/listings/${id}/photos`, { urls }).then((r) => r.data.data),

  update: (id: string, payload: Partial<Listing>) =>
    api.patch<{ data: Listing }>(`/listings/${id}`, payload).then((r) => r.data.data),

  remove: (id: string) => api.delete(`/listings/${id}`),

  uploadPhotos: async (localUris: string[]) => {
    const form = new FormData();
    localUris.forEach((uri, i) => {
      form.append('photos', { uri, name: `photo_${i}.jpg`, type: 'image/jpeg' } as any);
    });
    const { data } = await api.post<{ data: { urls: string[] } }>('/uploads/photos', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.urls;
  },
};
