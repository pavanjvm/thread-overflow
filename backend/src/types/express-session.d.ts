import 'express-session';

import type { SessionUser } from '../modules/auth/auth.types.ts';

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
  }
}
