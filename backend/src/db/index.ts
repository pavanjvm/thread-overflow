import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { env } from '../config/env.ts';

import * as schema from './schema.ts';

const globalForDb = globalThis as typeof globalThis & {
  threadOverflowPool?: Pool;
};

export const pool =
  globalForDb.threadOverflowPool ??
  new Pool({
    connectionString: env.databaseUrl,
  });

if (!globalForDb.threadOverflowPool) {
  globalForDb.threadOverflowPool = pool;
}

export const db = drizzle(pool, { schema });

export async function initializeDatabase() {
  return Promise.resolve();
}
