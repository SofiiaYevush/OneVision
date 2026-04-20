import { Request, Response } from 'express';
import { AuthRequest } from '../auth/auth.types';
import * as svc from './availability.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { z } from 'zod';

const monthQuerySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

const datesBodySchema = z.object({
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1).max(60),
});

export const getMonthAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { year, month } = monthQuerySchema.parse(req.query);
  const items = await svc.getMonthAvailability(req.params.performerId, year, month);
  res.json({ status: 'success', data: items });
});

export const blockDates = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { dates } = datesBodySchema.parse(req.body);
  await svc.blockManual(req.user.sub, dates);
  res.json({ status: 'success', message: 'Dates blocked' });
});

export const unblockDates = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { dates } = datesBodySchema.parse(req.body);
  await svc.unblockManual(req.user.sub, dates);
  res.json({ status: 'success', message: 'Dates unblocked' });
});