import rateLimit from 'express-rate-limit';
import { env } from '../../config/env';

export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', code: 'RATE_LIMIT', message: 'Too many requests' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', code: 'RATE_LIMIT', message: 'Too many auth attempts' },
});