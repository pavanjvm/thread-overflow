# Thread Overflow

Next.js app for a forum + ideation + hackathon portal UI, now paired with SPA-based Microsoft Entra sign-in, a TypeScript Node/Express backend, PostgreSQL, Drizzle ORM, and S3-compatible object storage.

## Run It

Copy `.env.example` to `.env.local` for the frontend and `.env` for the backend, then fill in your Entra values.

```bash
npm install
docker compose up -d
npm run db:push
npm run dev:api
npm run dev
```

- Frontend: `http://localhost:9002`
- Backend: `http://localhost:3000`
- PostgreSQL: `http://localhost:5432`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

Backend structure:

```text
backend/
  src/
    config/
    db/
    middleware/
    modules/
      auth/
      health/
      users/
    server.ts
```

## Azure Setup

Create an **App registration** in Microsoft Entra for your internal app and configure:

- Platform: `Single-page application`
- Redirect URI: `http://localhost:9002/login`

Then copy the tenant ID and client ID into both the public frontend env vars and the backend env vars.

## Object Storage

The app uses an S3-compatible storage configuration:

- Local development: MinIO via Docker Compose
- Production: AWS S3 by changing env vars only

Required storage env vars:

- `OBJECT_STORAGE_BUCKET`
- `OBJECT_STORAGE_REGION`
- `OBJECT_STORAGE_ENDPOINT`
- `OBJECT_STORAGE_PUBLIC_URL`
- `OBJECT_STORAGE_ACCESS_KEY_ID`
- `OBJECT_STORAGE_SECRET_ACCESS_KEY`
- `OBJECT_STORAGE_FORCE_PATH_STYLE`

For local MinIO, keep `OBJECT_STORAGE_FORCE_PATH_STYLE=true`.
For AWS S3, use the S3 endpoint behavior you need and typically set `OBJECT_STORAGE_FORCE_PATH_STYLE=false`.

Role mapping:

- `ENTRA_ADMIN_ROLES=ADMIN`
- `ENTRA_USER_ROLES=USER`

Those values should match the Microsoft Entra app roles emitted in the token. On each successful login, the frontend gets the Microsoft identity token, the backend validates it, creates the local session, and upserts the user into PostgreSQL with both the normalized app role and the raw Azure role list.

Optional legacy fallback role mapping:

- `ENTRA_ADMIN_EMAILS=alice@yourorg.com,bob@yourorg.com`
- `ENTRA_ADMIN_DOMAINS=admins.yourorg.com`

## Checks

```bash
npm run db:push
npm run lint
npm run typecheck
npm run build
```

## Notes

- Start Postgres with Docker Compose before running `npm run db:push` or authenticating.
- Start MinIO with Docker Compose before creating hackathons that upload images.
- The Express backend still uses the default in-memory session store, which is acceptable for local development only.
- The frontend reads the active session from `GET /auth/me` and redirects unauthenticated users to `/login`.
- The browser signs the user in with Microsoft Entra and then posts the returned identity token to the backend at `POST /auth/session`.
- Hackathon images are uploaded to S3-compatible object storage and only object keys/URLs are stored in Postgres.
