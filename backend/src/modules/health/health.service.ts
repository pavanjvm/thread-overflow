import { env } from '../../config/env.ts';

export function getHealthStatus() {
  return {
    ok: true,
    configured: env.isConfigured,
    databaseUrlConfigured: Boolean(env.databaseUrl),
  };
}
