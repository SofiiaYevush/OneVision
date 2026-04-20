import { Socket } from 'socket.io';
import { verifyAccessToken } from '../shared/utils/jwt';

export function authHandshake(socket: Socket, next: (err?: Error) => void) {
  const token =
    (socket.handshake.auth?.token as string | undefined) ??
    (socket.handshake.headers.authorization?.replace('Bearer ', '') ?? '');

  if (!token) {
    next(new Error('Unauthorized'));
    return;
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    next(new Error('Unauthorized'));
    return;
  }

  socket.data.user = payload;
  next();
}