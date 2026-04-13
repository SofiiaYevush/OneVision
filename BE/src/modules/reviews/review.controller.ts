import { Request, Response } from 'express';
import { AuthRequest } from '../auth/auth.types';
import * as svc from './review.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { z } from 'zod';

const createReviewSchema = z.object({
  bookingId: z.string().length(24),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(2000),
});

const pagingSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bookingId, rating, comment } = createReviewSchema.parse(req.body);
  const review = await svc.createReview(req.user.sub, bookingId, rating, comment);
  res.status(201).json({ status: 'success', data: review });
});

export const listPerformerReviews = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = pagingSchema.parse(req.query);
  const result = await svc.listPerformerReviews(req.params.profileId, page, limit);
  res.json({ status: 'success', ...result });
});