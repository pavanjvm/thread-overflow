import { API_BASE_URL } from '@/lib/constants';
import type { User } from '@/lib/types';

export interface SessionUser extends User {
  email?: string;
  role: 'ADMIN' | 'USER';
}

export interface SessionResponse {
  configured: boolean;
  user: SessionUser | null;
}

interface CurrentUserResponse {
  user: SessionUser;
}

export async function fetchSession(): Promise<SessionResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Unable to load auth session.');
  }

  return (await response.json()) as SessionResponse;
}

export async function establishSession(idToken: string): Promise<SessionResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/session`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error('Unable to create auth session.');
  }

  return (await response.json()) as SessionResponse;
}

export async function fetchCurrentUser(): Promise<SessionUser> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Unable to load current user.');
  }

  const payload = (await response.json()) as CurrentUserResponse;
  return payload.user;
}

export async function logoutFromSession() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to log out.');
  }

  return (await response.json()) as { ok: boolean };
}
