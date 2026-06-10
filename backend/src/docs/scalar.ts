import { Router } from 'express';
import { apiReference } from '@scalar/express-api-reference';

import { openApiDocument } from './openapi.ts';

export const docsRoutes = Router();

docsRoutes.get('/openapi.json', (_req, res) => {
  res.json(openApiDocument);
});

docsRoutes.use(
  '/docs',
  apiReference({
    content: openApiDocument,
    theme: 'default',
  }),
);
