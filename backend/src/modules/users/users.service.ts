import { desc, eq } from 'drizzle-orm';

import { db } from '../../db/index.ts';
import { users } from '../../db/schema.ts';

import type { PersistedUser, SyncUserInput } from './users.types.ts';

function mapPersistedUser(record: typeof users.$inferSelect): PersistedUser {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    avatarUrl: record.avatarUrl,
    role: record.role,
    azureRoles: record.azureRoles,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    lastLoginAt: record.lastLoginAt,
  };
}

export async function syncUserFromLogin(input: SyncUserInput) {
  const now = new Date();
  const [record] = await db
    .insert(users)
    .values({
      id: input.id,
      email: input.email,
      name: input.name,
      avatarUrl: input.avatarUrl,
      role: input.role,
      azureRoles: input.azureRoles,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: input.email,
        name: input.name,
        avatarUrl: input.avatarUrl,
        role: input.role,
        azureRoles: input.azureRoles,
        updatedAt: now,
        lastLoginAt: now,
      },
    })
    .returning();

  return mapPersistedUser(record);
}

export async function findUserById(id: string) {
  const [record] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return record ? mapPersistedUser(record) : null;
}

export async function listUsers(limit = 50) {
  const records = await db.select().from(users).orderBy(desc(users.lastLoginAt)).limit(limit);
  return records.map(mapPersistedUser);
}
