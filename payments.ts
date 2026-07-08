import { api } from './client';

export const paymentsApi = {
  initiate: (payload: {
    provider: 'orange_money' | 'mtn_momo';
    type: 'listing_boost' | 'subscription';
    amount: number;
    phoneNumber: string;
    listingId?: string;
  }) => api.post('/payments/initiate', payload).then((r) => r.data.data),
  findMine: () => api.get('/payments/mine').then((r) => r.data.data),
};
