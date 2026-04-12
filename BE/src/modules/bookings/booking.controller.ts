import { Response } from 'express';
import { AuthRequest } from '../auth/auth.types';
import * as svc from './booking.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export const createBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const booking = await svc.createBooking(req.user.sub, req.body);
  res.status(201).json({ status: 'success', data: booking });
});

export const getBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const booking = await svc.getBooking(req.params.id, req.user.sub);
  res.json({ status: 'success', data: booking });
});

export const getMyClientBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await svc.getClientBookings(req.user.sub, req.query as never);
  res.json({ status: 'success', ...result });
});

export const getMyPerformerBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await svc.getPerformerBookings(req.user.sub, req.query as never);
  res.json({ status: 'success', ...result });
});

export const confirmBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const booking = await svc.confirmBooking(req.params.id, req.user.sub);
  res.json({ status: 'success', data: booking });
});

export const rejectBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const booking = await svc.rejectBooking(req.params.id, req.user.sub);
  res.json({ status: 'success', data: booking });
});

export const cancelBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const booking = await svc.cancelBooking(req.params.id, req.user.sub, req.body);
  res.json({ status: 'success', data: booking });
});

export const completeBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const booking = await svc.completeBooking(req.params.id, req.user.sub);
  res.json({ status: 'success', data: booking });
});