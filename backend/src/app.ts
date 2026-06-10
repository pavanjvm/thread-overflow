import cors from 'cors';
import express from 'express';

import { env } from './config/env.ts';
import { sessionMiddleware } from './config/session.ts';
import { docsRoutes } from './docs/scalar.ts';
import { errorHandler } from './middleware/error-handler.ts';
import { notFoundHandler } from './middleware/not-found.ts';
import { authRoutes } from './modules/auth/auth.routes.ts';
import { healthRoutes } from './modules/health/health.routes.ts';
import { hackathonsRoutes } from './modules/hackathons/hackathons.routes.ts';
import { usersRoutes } from './modules/users/users.routes.ts';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(sessionMiddleware);

  app.use(docsRoutes);
  app.use('/health', healthRoutes);
  app.use('/auth', authRoutes);
  app.use('/hackathons', hackathonsRoutes);
  app.use('/users', usersRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
