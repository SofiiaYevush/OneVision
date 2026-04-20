export { AppError } from './AppError';

import { AppError } from './AppError';

export const BadRequest = (msg = 'Bad request', code?: string) => new AppError(400, msg, code);
export const Unauthorized = (msg = 'Unauthorized') => new AppError(401, msg, 'UNAUTHORIZED');
export const Forbidden = (msg = 'Forbidden') => new AppError(403, msg, 'FORBIDDEN');
export const NotFound = (msg = 'Not found') => new AppError(404, msg, 'NOT_FOUND');
export const Conflict = (msg = 'Conflict', code?: string) => new AppError(409, msg, code);
export const Unprocessable = (msg = 'Unprocessable entity') => new AppError(422, msg);
export const Internal = (msg = 'Internal server error') => new AppError(500, msg, 'INTERNAL');