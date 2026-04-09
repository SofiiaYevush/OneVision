import { Response } from 'express';
import { AuthRequest } from '../auth/auth.types';
import * as userService from './user.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { Unauthorized } from '../../shared/errors';

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw Unauthorized();
  const user = await userService.getUserById(req.user.sub);
  res.json({ status: 'success', data: user });
});

export const updateMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw Unauthorized();
  const user = await userService.updateProfile(req.user.sub, req.body);
  res.json({ status: 'success', data: user });
});

export const uploadAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw Unauthorized();
  if (!req.file) throw new Error('No file uploaded');
  const user = await userService.updateAvatar(req.user.sub, req.file.path);
  res.json({ status: 'success', data: user });
});

export const deleteMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw Unauthorized();
  await userService.deleteAccount(req.user.sub, req.user.sub);
  res.clearCookie('refreshToken');
  res.status(204).send();
});