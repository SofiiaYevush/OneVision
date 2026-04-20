import api from './client';
import type { Conversation, Message, PaginatedResponse } from '@/types/api';

export const chatApi = {
  getConversations: () =>
    api.get<{ data: Conversation[] }>('/chat/conversations').then((r) => r.data.data),

  getMessages: (conversationId: string, params?: { page?: number; limit?: number }) =>
    api.get<{ items: Message[]; meta: PaginatedResponse<Message>['meta'] }>(`/chat/conversations/${conversationId}/messages`, { params })
      .then((r) => ({ data: r.data.items, meta: r.data.meta })),

  sendMessage: (conversationId: string, content: string) =>
    api.post<{ data: Message }>(`/chat/conversations/${conversationId}/messages`, { content }).then((r) => r.data.data),

  markRead: (conversationId: string) =>
    api.post(`/chat/conversations/${conversationId}/read`),
};