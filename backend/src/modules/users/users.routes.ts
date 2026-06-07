import { Router } from 'express';

import { asyncHandler } from '../../middleware/async-handler.ts';
import { requireSessionUser } from '../../middleware/require-session-user.ts';

import { getCurrentUser } from './users.controller.ts';

export const usersRoutes = Router();

usersRoutes.get('/me', requireSessionUser, asyncHandler(getCurrentUser));
