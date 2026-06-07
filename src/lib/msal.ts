'use client';

import { PublicClientApplication, type RedirectRequest } from '@azure/msal-browser';

const clientId = process.env.NEXT_PUBLIC_ENTRA_CLIENT_ID || '';
const tenantId = process.env.NEXT_PUBLIC_ENTRA_TENANT_ID || '';
const authorityHost = (process.env.NEXT_PUBLIC_ENTRA_AUTHORITY_HOST || 'https://login.microsoftonline.com').replace(/\/$/, '');

export const isMsalConfigured = Boolean(clientId && tenantId);

const redirectPath = process.env.NEXT_PUBLIC_ENTRA_REDIRECT_PATH || '/';
export const graphUserSearchScopes = ['User.ReadBasic.All'];

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId,
    authority: `${authorityHost}/${tenantId}`,
    redirectUri: typeof window === 'undefined' ? undefined : `${window.location.origin}${redirectPath}`,
    postLogoutRedirectUri: typeof window === 'undefined' ? undefined : `${window.location.origin}/`,
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
});

export const loginRequest: RedirectRequest = {
  scopes: ['openid', 'profile', 'email', ...graphUserSearchScopes],
  prompt: 'select_account',
};
