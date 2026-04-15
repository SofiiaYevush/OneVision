import api from './client';
import type { User, PaginatedResponse } from '@/types/api';

export const adminApi = {
  getStats: () =>
    api.get<{ data: Record<string, unknown> }>('/admin/stats').then((r) => r.data.data),

  listUsers: (params?: { page?: number; limit?: number; role?: string; search?: string }) =>
    api.get<{ items: User[]; meta: PaginatedResponse<User>['meta'] }>('/admin/users', { params })
      .then((r) => ({ data: r.data.items, meta: r.data.meta })),

  blockUser: (id: string) => api.post(`/admin/users/${id}/block`),

  unblockUser: (id: string) => api.post(`/admin/users/${id}/unblock`),
};