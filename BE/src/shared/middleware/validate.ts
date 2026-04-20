import { RequestHandler } from 'express';
import { ZodTypeAny } from 'zod';

type Target = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodTypeAny, target: Target = 'body'): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      next(result.error);
      return;
    }
    req[target] = result.data;
    next();
  };