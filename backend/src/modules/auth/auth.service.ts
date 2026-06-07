import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import type { Request } from 'express';

import { env } from '../../config/env.ts';
import type { AppRole } from '../users/users.types.ts';

import type { SessionResponse, SessionUser } from './auth.types.ts';

const jwks = createRemoteJWKSet(new URL(env.jwksUri));

function getClaimString(claim: unknown) {
  return typeof claim === 'string' ? claim : '';
}

function getClaimStrings(claim: unknown) {
  return Array.isArray(claim) ? claim.map((value) => String(value)) : [];
}

function resolveRole(email: string, azureRoles: string[]): AppRole {
  const normalizedAzureRoles = new Set(azureRoles.map((role) => role.trim().toUpperCase()));
  const normalizedEmail = email.trim().toLowerCase();
  const domain = normalizedEmail.split('@')[1] || '';

  if (Array.from(normalizedAzureRoles).some((role) => env.adminRoleNames.has(role))) {
    return 'ADMIN';
  }

  if (env.userRoleNames.size > 0 && Array.from(normalizedAzureRoles).some((role) => env.userRoleNames.has(role))) {
    return 'USER';
  }

  if (env.adminEmails.has(normalizedEmail) || env.adminDomains.has(domain)) {
    return 'ADMIN';
  }

  return 'USER';
}

export async function verifyIdToken(idToken: string) {
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: env.issuer,
    audience: env.clientId,
  });

  return payload;
}

export function mapClaimsToSessionUser(payload: JWTPayload): SessionUser & { azureRoles: string[] } {
  const email =
    getClaimString(payload.preferred_username) ||
    getClaimString(payload.email) ||
    getClaimString(payload.upn);
  const name = getClaimString(payload.name) || email.split('@')[0] || 'User';
  const azureRoles = getClaimStrings(payload.roles);
  const id = getClaimString(payload.oid) || getClaimString(payload.sub);

  if (!id || !email) {
    throw new Error('The Microsoft token did not include the required user claims.');
  }

  return {
    id,
    name,
    email,
    avatarUrl: null,
    role: resolveRole(email, azureRoles),
    azureRoles,
  };
}

export function getSessionResponse(req: Request): SessionResponse {
  return {
    configured: env.isConfigured,
    user: req.session.user ?? null,
  };
}

export function persistSession(req: Request) {
  return new Promise<void>((resolve, reject) => {
    req.session.save((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

export function destroySession(req: Request) {
  return new Promise<void>((resolve, reject) => {
    req.session.destroy((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
