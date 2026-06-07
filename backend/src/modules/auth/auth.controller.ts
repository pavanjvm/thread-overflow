import type { Request, Response } from 'express';

import { env } from '../../config/env.ts';
import { syncUserFromLogin } from '../users/users.service.ts';

import type { EstablishSessionBody, SessionUser } from './auth.types.ts';
import {
  destroySession,
  getSessionResponse,
  mapClaimsToSessionUser,
  persistSession,
  verifyIdToken,
} from './auth.service.ts';

export function getSession(req: Request, res: Response) {
  res.json(getSessionResponse(req));
}

export async function establishUserSession(req: Request, res: Response) {
  const body = req.body as EstablishSessionBody | undefined;

  if (!env.isConfigured) {
    res.status(500).json({
      error: 'azure_sso_not_configured',
      message: 'Set the Entra tenant ID, client ID, and session secret before using sign-in.',
    });
    return;
  }

  if (!body?.idToken) {
    res.status(400).json({
      error: 'missing_id_token',
    });
    return;
  }

  try {
    const payload = await verifyIdToken(body.idToken);
    const sessionUser = mapClaimsToSessionUser(payload);
    const persistedUser = await syncUserFromLogin(sessionUser);

    req.session.user = {
      id: persistedUser.id,
      name: persistedUser.name,
      email: persistedUser.email,
      avatarUrl: persistedUser.avatarUrl,
      role: persistedUser.role,
    } satisfies SessionUser;
    await persistSession(req);

    res.json(getSessionResponse(req));
  } catch (error) {
    console.error('Failed to establish Entra session.', error);
    res.status(401).json({
      error: 'invalid_id_token',
    });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    await destroySession(req);
    res.clearCookie(env.cookieName);
    res.json({
      ok: true,
    });
  } catch (error) {
    console.error('Failed to destroy session.', error);
    res.status(500).json({
      error: 'logout_failed',
    });
  }
}
