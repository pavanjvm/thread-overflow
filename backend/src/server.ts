import { createApp } from './app.ts';
import { env } from './config/env.ts';
import { initializeDatabase } from './db/index.ts';

async function startServer() {
  await initializeDatabase();

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`Thread Overflow auth API listening on http://localhost:${env.port}`);
  });
}

void startServer();
