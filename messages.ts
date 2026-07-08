import { api } from './client';

export const messagesApi = {
  findConversations: () => api.get('/messages/conversations').then((r) => r.data.data),
  findMessages: (conversationId: string) =>
    api.get(`/messages/conversations/${conversationId}`).then((r) => r.data.data),
  sendMessage: (conversationId: string, body: string) =>
    api.post(`/messages/conversations/${conversationId}`, { body }).then((r) => r.data.data),
  start: (recipientId: string, message: string, listingId?: string) =>
    api.post('/messages/start', { recipientId, message, listingId }).then((r) => r.data.data),
};
