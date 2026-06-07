export type AppRole = 'ADMIN' | 'USER';

export interface PersistedUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: AppRole;
  azureRoles: string[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}

export interface SyncUserInput {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: AppRole;
  azureRoles: string[];
}
