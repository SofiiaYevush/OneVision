import { RequestHandler } from 'express';

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ status: 'fail', code: 'NOT_FOUND', message: 'Route not found' });
};