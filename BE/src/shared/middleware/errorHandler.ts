import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import { logger } from '../../config/logger';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(422).json({
      status: 'fail',
      code: 'VALIDATION_ERROR',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) logger.error({ err }, err.message);
    res.status(err.statusCode).json({
      status: err.statusCode >= 500 ? 'error' : 'fail',
      code: err.code ?? 'ERROR',
      message: err.message,
    });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ status: 'error', code: 'INTERNAL', message: 'Internal server error' });
};