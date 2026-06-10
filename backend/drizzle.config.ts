import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

const configDirectory = path.dirname(fileURLToPath(import.meta.url));
const workingDirectory = process.cwd();
const repositoryRoot = path.resolve(configDirectory, '..');

for (const envPath of [
  path.join(configDirectory, '.env.local'),
  path.join(configDirectory, '.env'),
  path.join(repositoryRoot, '.env.local'),
  path.join(repositoryRoot, '.env'),
]) {
  dotenv.config({ path: envPath });
}

function relativeToWorkingDirectory(target: string) {
  const relativePath = path.relative(workingDirectory, path.join(configDirectory, target));
  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
}

export default defineConfig({
  out: relativeToWorkingDirectory('drizzle'),
  schema: relativeToWorkingDirectory('src/db/schema.ts'),
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/thread_overflow',
  },
});
