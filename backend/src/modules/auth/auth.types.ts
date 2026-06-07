import type { AppRole } from '../users/users.types.ts';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: AppRole;
}

export interface SessionResponse {
  configured: boolean;
  user: SessionUser | null;
}

export interface EstablishSessionBody {
  idToken: string;
}
