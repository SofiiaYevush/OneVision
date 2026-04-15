import api from './client';
import type { Review, PaginatedResponse } from '@/types/api';

export const reviewsApi = {
  create: (bookingId: string, rating: number, comment: string) =>
    api.post<{ data: Review }>('/reviews', { bookingId, rating, comment }).then((r) => r.data.data),

  listByPerformer: (profileId: string, params?: { page?: number; limit?: number }) =>
    api.get<{ items: Review[]; meta: PaginatedResponse<Review>['meta'] }>(`/reviews/performer/${profileId}`, { params })
      .then((r) => ({ data: r.data.items, meta: r.data.meta })),
};