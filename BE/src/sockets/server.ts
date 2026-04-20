import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { authHandshake } from './authHandshake';

let io: SocketServer;

export function initSocketServer(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: { origin: env.CLIENT_ORIGIN, credentials: true },
    path: '/socket.io',
  });

  io.use(authHandshake);

  io.on('connection', (socket) => {
    const userId = socket.data.user.sub as string;
    socket.join(`user:${userId}`);
    logger.debug({ userId }, 'Socket connected');

    socket.on('disconnect', () => {
      logger.debug({ userId }, 'Socket disconnected');
    });
  });

  return io;
}

export function getIO(): SocketServer {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}