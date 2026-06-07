import type { NextFunction, Request, Response } from 'express';

export function requireSessionUser(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) {
    res.status(401).json({
      error: 'unauthorized',
    });
    return;
  }

  next();
}
