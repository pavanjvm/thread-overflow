import { msalInstance, graphUserSearchScopes } from '@/lib/msal';

interface GraphUserRecord {
  id: string;
  displayName: string | null;
  mail: string | null;
  userPrincipalName: string | null;
}

interface GraphUsersResponse {
  value: GraphUserRecord[];
}

export interface DirectoryUserOption {
  id: string;
  name: string;
  email: string;
}

function escapeODataLiteral(value: string) {
  return value.replace(/'/g, "''");
}

async function acquireGraphAccessToken() {
  await msalInstance.initialize();
  const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];

  if (!account) {
    throw new Error('No Microsoft account is available.');
  }

  const token = await msalInstance.acquireTokenSilent({
    account,
    scopes: graphUserSearchScopes,
  });

  return token.accessToken;
}

export async function searchOrgUsers(query: string) {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return [];
  }

  const accessToken = await acquireGraphAccessToken();
  const url = new URL('https://graph.microsoft.com/v1.0/users');

  url.searchParams.set('$top', '8');
  url.searchParams.set('$select', 'id,displayName,mail,userPrincipalName');
  url.searchParams.set(
    '$filter',
    [
      `startswith(displayName,'${escapeODataLiteral(normalizedQuery)}')`,
      `startswith(mail,'${escapeODataLiteral(normalizedQuery)}')`,
      `startswith(userPrincipalName,'${escapeODataLiteral(normalizedQuery)}')`,
    ].join(' or '),
  );

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Unable to search organization users.');
  }

  const payload = (await response.json()) as GraphUsersResponse;
  const seenEmails = new Set<string>();

  return payload.value.reduce<DirectoryUserOption[]>((users, user) => {
    const email = (user.mail ?? user.userPrincipalName ?? '').trim();
    const name = (user.displayName ?? '').trim();

    if (!email || !name) {
      return users;
    }

    const normalizedEmail = email.toLowerCase();
    if (seenEmails.has(normalizedEmail)) {
      return users;
    }

    seenEmails.add(normalizedEmail);
    users.push({
      id: user.id,
      name,
      email,
    });

    return users;
  }, []);
}
