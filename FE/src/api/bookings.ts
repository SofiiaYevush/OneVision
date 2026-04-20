import api from './client';
import type { Booking, PaginatedResponse } from '@/types/api';

export interface CreateBookingDto {
  serviceId: string;
  eventDate: string;
  eventName: string;
  eventType: string;
  eventAddress: string;
  startTime?: string;
  duration?: number;
  guestCount?: number;
  notes?: string;
}

export const bookingsApi = {
  create: (dto: CreateBookingDto) =>
    api.post<{ data: Booking }>('/bookings', dto).then((r) => r.data.data),

  getById: (id: string) =>
    api.get<{ data: Booking }>(`/bookings/${id}`).then((r) => r.data.data),

  listClient: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<{ items: Booking[]; meta: PaginatedResponse<Booking>['meta'] }>('/bookings/client', { params })
      .then((r) => ({ data: r.data.items, meta: r.data.meta })),

  listPerformer: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<{ items: Booking[]; meta: PaginatedResponse<Booking>['meta'] }>('/bookings/performer', { params })
      .then((r) => ({ data: r.data.items, meta: r.data.meta })),

  confirm: (id: string) =>
    api.post<{ data: Booking }>(`/bookings/${id}/confirm`).then((r) => r.data.data),

  reject: (id: string, reason?: string) =>
    api.post<{ data: Booking }>(`/bookings/${id}/reject`, { reason }).then((r) => r.data.data),

  cancel: (id: string, reason?: string) =>
    api.post<{ data: Booking }>(`/bookings/${id}/cancel`, { reason }).then((r) => r.data.data),

  complete: (id: string) =>
    api.post<{ data: Booking }>(`/bookings/${id}/complete`).then((r) => r.data.data),
};