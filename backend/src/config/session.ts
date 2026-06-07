import session from 'express-session';

import { env } from './env.ts';

export const sessionMiddleware = session({
  name: env.cookieName,
  secret: env.sessionSecret || 'replace-me-in-env',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8,
  },
});
