import { api } from './client';
import { Category } from '../types';

export const categoriesApi = {
  findAll: () => api.get<{ data: Category[] }>('/categories').then((r) => r.data.data),
};
