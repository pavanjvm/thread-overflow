
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import type {NextConfig} from 'next';

const frontendDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(frontendDirectory, '..');

for (const envPath of [
  path.join(frontendDirectory, '.env.local'),
  path.join(frontendDirectory, '.env'),
  path.join(repositoryRoot, '.env.local'),
  path.join(repositoryRoot, '.env'),
]) {
  dotenv.config({ path: envPath });
}

const nextConfig: NextConfig = {
  turbopack: {
    root: frontendDirectory,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
