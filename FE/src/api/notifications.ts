import api from './client';
import type { Notification, PaginatedResponse } from '@/types/api';

export const notificationsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get<{ items: Notification[]; meta: PaginatedResponse<Notification>['meta'] }>('/notifications', { params })
      .then((r) => ({ data: r.data.items, meta: r.data.meta })),

  markRead: (id: string) => api.patch(`/notifications/${id}/read`),

  markAllRead: () => api.post('/notifications/read-all'),
};