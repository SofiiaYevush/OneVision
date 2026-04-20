import { z } from 'zod';

export const createServiceDto = z.object({
  title: z.string().min(3).max(150),
  description: z.string().min(10).max(3000),
  category: z.enum(['photography', 'music', 'hosting', 'decoration', 'videography', 'entertainment', 'other']),
  price: z.number().min(0),
  priceUnit: z.enum(['fixed', 'per_hour', 'per_day']).default('fixed'),
  duration: z.number().min(0).optional(),
  location: z.string().max(100).default(''),
  tags: z.array(z.string().max(30)).max(10).default([]),
});

export const updateServiceDto = createServiceDto.partial();

export const serviceQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  category: z.enum(['photography', 'music', 'hosting', 'decoration', 'videography', 'entertainment', 'other']).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
  q: z.string().optional(),
  performerId: z.string().length(24).optional(),
});

export type CreateServiceDto = z.infer<typeof createServiceDto>;
export type UpdateServiceDto = z.infer<typeof updateServiceDto>;
export type ServiceQueryDto = z.infer<typeof serviceQueryDto>;