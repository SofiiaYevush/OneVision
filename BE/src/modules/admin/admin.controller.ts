import { Request, Response } from 'express';
import * as svc from './admin.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { z } from 'zod';

const serviceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
});

const moderateSchema = z.object({
  action: z.enum(['approve', 'reject']),
});

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await svc.getPlatformStats();
  res.json({ status: 'success', data });
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = svc.adminUserQuerySchema.parse(req.query);
  const result = await svc.listUsers(query);
  res.json({ status: 'success', ...result });
});

export const blockUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await svc.blockUser(req.params.id);
  res.json({ status: 'success', data: user });
});

export const unblockUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await svc.unblockUser(req.params.id);
  res.json({ status: 'success', data: user });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await svc.deleteUser(req.params.id);
  res.status(204).send();
});

export const listServices = asyncHandler(async (req: Request, res: Response) => {
  const query = serviceQuerySchema.parse(req.query);
  const result = await svc.listServicesForModeration(query);
  res.json({ status: 'success', ...result });
});

export const moderateService = asyncHandler(async (req: Request, res: Response) => {
  const { action } = moderateSchema.parse(req.body);
  const service = await svc.moderateService(req.params.id, action);
  res.json({ status: 'success', data: service });
});

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  await svc.deleteService(req.params.id);
  res.status(204).send();
});

export const listBookings = asyncHandler(async (req: Request, res: Response) => {
  const query = svc.adminBookingQuerySchema.parse(req.query);
  const result = await svc.listAllBookings(query);
  res.json({ status: 'success', ...result });
});