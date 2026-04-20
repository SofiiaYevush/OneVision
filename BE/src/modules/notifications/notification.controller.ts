import { Response } from 'express';
import { AuthRequest } from '../auth/auth.types';
import * as svc from './notification.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { z } from 'zod';

const pagingSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const listNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit } = pagingSchema.parse(req.query);
  const result = await svc.listNotifications(req.user.sub, page, limit);
  res.json({ status: 'success', ...result });
});

export const markRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await svc.markRead(req.params.id, req.user.sub);
  res.json({ status: 'success' });
});

export const markAllRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await svc.markAllRead(req.user.sub);
  res.json({ status: 'success' });
});