import type { NextFunction, Request, Response } from 'express';

import { env } from '../config/env.ts';

export function requireAuthConfig(_req: Request, res: Response, next: NextFunction) {
  if (!env.isConfigured) {
    res.status(500).json({
      error: 'azure_sso_not_configured',
      message: 'Set the Entra tenant ID, client ID, and session environment variables before using SSO.',
    });
    return;
  }

  next();
}
