import { z } from 'zod';

export const createBookingDto = z.object({
  serviceId: z.string().length(24),
  eventDate: z.coerce.date().min(new Date(), { message: 'Event date must be in the future' }),
  eventName: z.string().min(2).max(200),
  eventType: z.string().min(2).max(100),
  eventAddress: z.string().min(5).max(300),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  duration: z.number().min(1).max(24).optional(),
  guestCount: z.number().int().min(1).optional(),
  notes: z.string().max(2000).optional(),
});

export const cancelBookingDto = z.object({
  reason: z.string().max(500).optional(),
});

export const bookingQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(['pending', 'confirmed', 'rejected', 'cancelled', 'completed']).optional(),
});

export type CreateBookingDto = z.infer<typeof createBookingDto>;
export type CancelBookingDto = z.infer<typeof cancelBookingDto>;
export type BookingQueryDto = z.infer<typeof bookingQueryDto>;