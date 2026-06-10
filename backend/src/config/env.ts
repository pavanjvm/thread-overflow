import './load-env.ts';

function parseCsvSet(value: string | undefined) {
  return new Set(
    (value ?? '')
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
}

function normalizeRoleNames(values: Set<string>) {
  return new Set(Array.from(values, (value) => value.toUpperCase()));
}

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:9002';
const tenantId = process.env.ENTRA_TENANT_ID || process.env.NEXT_PUBLIC_ENTRA_TENANT_ID || '';
const clientId = process.env.ENTRA_CLIENT_ID || process.env.NEXT_PUBLIC_ENTRA_CLIENT_ID || '';
const authorityHost = (process.env.ENTRA_AUTHORITY_HOST || process.env.NEXT_PUBLIC_ENTRA_AUTHORITY_HOST || 'https://login.microsoftonline.com').replace(/\/$/, '');
const sessionSecret = process.env.SESSION_SECRET || '';
const cookieName = process.env.SESSION_COOKIE_NAME || 'thread_overflow_session';
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/thread_overflow';
const objectStorageBucket = process.env.OBJECT_STORAGE_BUCKET || 'thread-overflow-assets';
const objectStorageRegion = process.env.OBJECT_STORAGE_REGION || 'us-east-1';
const objectStorageEndpoint = process.env.OBJECT_STORAGE_ENDPOINT || 'http://localhost:9000';
const objectStoragePublicUrl = (process.env.OBJECT_STORAGE_PUBLIC_URL || objectStorageEndpoint).replace(/\/$/, '');
const objectStorageAccessKeyId = process.env.OBJECT_STORAGE_ACCESS_KEY_ID || 'minioadmin';
const objectStorageSecretAccessKey = process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY || 'minioadmin';

export const env = {
  port: Number(process.env.PORT || 3000),
  frontendUrl,
  tenantId,
  clientId,
  authorityHost,
  authority: `${authorityHost}/${tenantId}`,
  issuer: `${authorityHost}/${tenantId}/v2.0`,
  jwksUri: `${authorityHost}/${tenantId}/discovery/v2.0/keys`,
  sessionSecret,
  cookieName,
  databaseUrl,
  objectStorageBucket,
  objectStorageRegion,
  objectStorageEndpoint,
  objectStoragePublicUrl,
  objectStorageAccessKeyId,
  objectStorageSecretAccessKey,
  objectStorageForcePathStyle: process.env.OBJECT_STORAGE_FORCE_PATH_STYLE !== 'false',
  adminRoleNames: normalizeRoleNames(parseCsvSet(process.env.ENTRA_ADMIN_ROLES || 'ADMIN')),
  userRoleNames: normalizeRoleNames(parseCsvSet(process.env.ENTRA_USER_ROLES || 'USER')),
  adminEmails: parseCsvSet(process.env.ENTRA_ADMIN_EMAILS),
  adminDomains: parseCsvSet(process.env.ENTRA_ADMIN_DOMAINS),
  isConfigured: Boolean(clientId && tenantId && sessionSecret),
} as const;
