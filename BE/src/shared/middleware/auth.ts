import { RequestHandler } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { Unauthorized, Forbidden } from '../errors';
import { UserRole } from '../../modules/users/user.model';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(Unauthorized());

  const token = header.slice(7);
  const payload = verifyAccessToken(token);
  if (!payload) return next(Unauthorized('Invalid or expired token'));

  req.user = payload;
  next();
};

export const requireRole =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(Unauthorized());
    if (!roles.includes(req.user.role)) return next(Forbidden());
    next();
  };