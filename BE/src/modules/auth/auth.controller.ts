import { Request, Response } from 'express';
import * as authService from './auth.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { Unauthorized } from '../../shared/errors';
import { AuthRequest } from './auth.types';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

function setRefreshCookie(res: Response, token: string) {
  res.cookie('refreshToken', token, COOKIE_OPTS);
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  setRefreshCookie(res, refreshToken);
  res.status(201).json({ status: 'success', data: { user, accessToken } });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken);
  res.json({ status: 'success', data: { user, accessToken } });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken as string | undefined;
  if (!token) throw Unauthorized('No refresh token');
  const { accessToken, refreshToken } = await authService.refresh(token);
  setRefreshCookie(res, refreshToken);
  res.json({ status: 'success', data: { accessToken } });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user) await authService.logout(req.user.sub);
  res.clearCookie('refreshToken', { path: '/' });
  res.status(204).send();
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.params.token);
  res.json({ status: 'success', message: 'Email verified successfully' });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  res.json({ status: 'success', message: 'If this email exists, a reset link has been sent' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.params.token, req.body.password);
  res.json({ status: 'success', message: 'Password updated successfully' });
});