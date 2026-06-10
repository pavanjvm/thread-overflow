import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const backendDirectory = path.resolve(currentDirectory, '..', '..');
const repositoryRoot = path.resolve(backendDirectory, '..');

for (const envPath of [
  path.join(backendDirectory, '.env.local'),
  path.join(backendDirectory, '.env'),
  path.join(repositoryRoot, '.env.local'),
  path.join(repositoryRoot, '.env'),
]) {
  dotenv.config({ path: envPath });
}
