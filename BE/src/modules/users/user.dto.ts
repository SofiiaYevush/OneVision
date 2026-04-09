import { z } from 'zod';

export const updateProfileDto = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileDto>;