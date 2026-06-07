import { Router } from 'express';

import { asyncHandler } from '../../middleware/async-handler.ts';
import { establishUserSession, getSession, logout } from './auth.controller.ts';

export const authRoutes = Router();

authRoutes.get('/me', getSession);
authRoutes.post('/session', asyncHandler(establishUserSession));
authRoutes.post('/logout', asyncHandler(logout));
