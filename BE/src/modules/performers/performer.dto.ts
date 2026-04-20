import { z } from 'zod';

export const createProfileDto = z.object({
  category: z.enum(['photography', 'music', 'hosting', 'decoration', 'videography', 'entertainment', 'other']),
  bio: z.string().max(2000).default(''),
  hourlyRate: z.number().min(0).default(0),
  city: z.string().max(100).default(''),
  tags: z.array(z.string().max(30)).max(20).default([]),
  languages: z.array(z.string().max(50)).max(10).default([]),
  experienceYears: z.number().min(0).max(50).default(0),
  responseTime: z.string().max(100).optional(),
});

export const updateProfileDto = createProfileDto.partial();

export const browseQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  category: z.enum(['photography', 'music', 'hosting', 'decoration', 'videography', 'entertainment', 'other']).optional(),
  city: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxRate: z.coerce.number().min(0).optional(),
  minRate: z.coerce.number().min(0).optional(),
  sort: z.enum(['rating', 'price_asc', 'price_desc', 'newest', 'reviews']).default('rating'),
  q: z.string().optional(),
});

export type CreateProfileDto = z.infer<typeof createProfileDto>;
export type UpdateProfileDto = z.infer<typeof updateProfileDto>;
export type BrowseQueryDto = z.infer<typeof browseQueryDto>;