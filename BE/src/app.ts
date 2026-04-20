import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import path from 'path';
import { env } from './config/env';
import { logger } from './config/logger';
import { globalLimiter } from './shared/middleware/rateLimit';
import { errorHandler } from './shared/middleware/errorHandler';
import { notFound } from './shared/middleware/notFound';
import router from './router';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (env.NODE_ENV !== 'test') {
    app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/healthz' } }));
  }

  app.use(globalLimiter);

  app.use('/static', express.static(path.resolve(env.UPLOAD_DIR)));

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', env: env.NODE_ENV, ts: new Date().toISOString() });
  });

  app.use('/api', router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}