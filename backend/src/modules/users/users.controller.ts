import type { Request, Response } from 'express';

import { findUserById } from './users.service.ts';

export async function getCurrentUser(req: Request, res: Response) {
  const sessionUser = req.session.user;

  if (!sessionUser) {
    res.status(401).json({
      error: 'unauthorized',
    });
    return;
  }

  const user = await findUserById(sessionUser.id);

  if (!user) {
    res.status(404).json({
      error: 'user_not_found',
    });
    return;
  }

  res.json({ user });
}
