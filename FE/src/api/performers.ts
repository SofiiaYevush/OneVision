import api from './client';
import type { PerformerProfile, Service, PaginatedResponse } from '@/types/api';

export interface BrowseQuery {
  category?: string;
  city?: string;
  maxRate?: number;
  minRating?: number;
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export const performersApi = {
  browse: (params: BrowseQuery) =>
    api.get<{ items: PerformerProfile[]; meta: PaginatedResponse<PerformerProfile>['meta'] }>('/performers', { params })
      .then((r) => ({ data: r.data.items, meta: r.data.meta })),

  getById: (id: string) =>
    api.get<{ data: PerformerProfile }>(`/performers/${id}`).then((r) => r.data.data),

  getServices: (userId: string) =>
    api.get<{ items: Service[] }>('/services', { params: { performerId: userId } }).then((r) => r.data.items),

  getAvailability: (userId: string, year: number, month: number) =>
    api.get<{ data: { date: string; type: string }[] }>(`/availability/${userId}/month`, { params: { year, month } }).then((r) => r.data.data ?? []),

  getMyProfile: () =>
    api.get<{ data: PerformerProfile }>('/performers/me/profile').then((r) => r.data.data),

  createProfile: (data: Partial<PerformerProfile>) =>
    api.post<{ data: PerformerProfile }>('/performers', data).then((r) => r.data.data),

  updateMyProfile: (data: Partial<PerformerProfile>) =>
    api.patch<{ data: PerformerProfile }>('/performers/me/profile', data).then((r) => r.data.data),
};
