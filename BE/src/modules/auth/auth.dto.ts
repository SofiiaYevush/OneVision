import { z } from 'zod';

export const registerDto = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(50).trim(),
  lastName: z.string().min(1).max(50).trim(),
  role: z.enum(['client', 'performer']),
});

export const loginDto = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordDto = z.object({
  email: z.string().email(),
});

export const resetPasswordDto = z.object({
  password: z.string().min(8).max(100),
});

export type RegisterDto = z.infer<typeof registerDto>;
export type LoginDto = z.infer<typeof loginDto>;