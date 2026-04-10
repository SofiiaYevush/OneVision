import { Request, Response } from 'express';
import { AuthRequest } from '../auth/auth.types';
import * as svc from './performer.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export const createMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await svc.createProfile(req.user.sub, req.body);
  res.status(201).json({ status: 'success', data: profile });
});

export const getMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await svc.getProfileByUserId(req.user.sub);
  res.json({ status: 'success', data: profile });
});

export const getProfileById = asyncHandler(async (req: Request, res: Response) => {
  const profile = await svc.getProfileById(req.params.id);
  res.json({ status: 'success', data: profile });
});

export const updateMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await svc.updateProfile(req.user.sub, req.body);
  res.json({ status: 'success', data: profile });
});

export const browse = asyncHandler(async (req: Request, res: Response) => {
  const result = await svc.browse(req.query as never);
  res.json({ status: 'success', ...result });
});

export const addPortfolioItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) throw new Error('No file uploaded');
  const profile = await svc.addPortfolioItem(req.user.sub, req.file.path, req.body.caption);
  res.status(201).json({ status: 'success', data: profile });
});

export const removePortfolioItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await svc.removePortfolioItem(req.user.sub, req.params.itemId);
  res.json({ status: 'success', data: profile });
});