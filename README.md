# Thread Overflow

Next.js 15 app for a forum + ideation + hackathon portal UI.

## Run It

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:9002`.

## Checks

```bash
npm run typecheck
npm run build
```

## Environment

Create a local env file from `.env.example`.

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

If that backend is not running, pages that call the API will fall back to empty or unauthenticated states. Mock-data-driven pages still render locally.

## Notes

- Auth and several ideation flows expect an API server at `NEXT_PUBLIC_API_BASE_URL`.
- The shared mock data and route types have been normalized so the app now builds cleanly.
