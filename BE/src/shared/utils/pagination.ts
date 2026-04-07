import { Request } from 'express';
import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

export function parsePagination(req: Request): PaginationQuery {
  return paginationSchema.parse(req.query);
}

export function buildMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}

export function buildSortObj(sort?: string, order?: 'asc' | 'desc'): Record<string, 1 | -1> {
  if (!sort) return { createdAt: -1 };
  return { [sort]: order === 'asc' ? 1 : -1 };
}