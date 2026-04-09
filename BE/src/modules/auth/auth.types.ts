import { Request } from 'express';
import { JwtPayload } from '../../shared/utils/jwt';

export interface AuthRequest extends Request {
  user: JwtPayload;
}