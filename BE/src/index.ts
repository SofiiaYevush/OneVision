import 'dotenv/config';
import http from 'http';
import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { logger } from './config/logger';
import { initSocketServer } from './sockets/server';
import { registerBookingListeners } from './modules/bookings/booking.listeners';
import { registerChatGateway } from './modules/chat/chat.gateway';

async function bootstrap() {
  await connectDB();

  registerBookingListeners();

  const app = createApp();
  const httpServer = http.createServer(app);
  const io = initSocketServer(httpServer);
  registerChatGateway(io);

  httpServer.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    httpServer.close(async () => {
      const { disconnectDB } = await import('./config/db');
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Bootstrap failed');
  process.exit(1);
});