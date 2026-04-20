import { Request, Response } from 'express';
import { AuthRequest } from '../auth/auth.types';
import * as svc from './service.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export const listServices = asyncHandler(async (req: Request, res: Response) => {
  const result = await svc.listServices(req.query as never);
  res.json({ status: 'success', ...result });
});

export const getService = asyncHandler(async (req: Request, res: Response) => {
  const service = await svc.getService(req.params.id);
  res.json({ status: 'success', data: service });
});

export const createService = asyncHandler(async (req: AuthRequest, res: Response) => {
  const service = await svc.createService(req.user.sub, req.body);
  res.status(201).json({ status: 'success', data: service });
});

export const listMyServices = asyncHandler(async (req: AuthRequest, res: Response) => {
  const services = await svc.listMyServices(req.user.sub);
  res.json({ status: 'success', data: services });
});

export const updateService = asyncHandler(async (req: AuthRequest, res: Response) => {
  const service = await svc.updateService(req.params.id, req.user.sub, req.body);
  res.json({ status: 'success', data: service });
});

export const deleteService = asyncHandler(async (req: AuthRequest, res: Response) => {
  await svc.deleteService(req.params.id, req.user.sub);
  res.status(204).send();
});

export const toggleService = asyncHandler(async (req: AuthRequest, res: Response) => {
  const service = await svc.toggleServiceStatus(req.params.id, req.user.sub);
  res.json({ status: 'success', data: service });
});