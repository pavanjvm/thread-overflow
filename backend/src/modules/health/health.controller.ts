import type { Request, Response } from 'express';

import { getHealthStatus } from './health.service.ts';

export function getHealth(_req: Request, res: Response) {
  res.json(getHealthStatus());
}
