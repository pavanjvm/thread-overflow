import { Router } from 'express';

import { asyncHandler } from '../../middleware/async-handler.ts';
import { requireAdmin } from '../../middleware/require-admin.ts';
import { requireSessionUser } from '../../middleware/require-session-user.ts';

import {
  deleteHackathon,
  deleteHackathonRegistrationById,
  getHackathon,
  getHackathonRegistration,
  getHackathonRegistrations,
  getHackathons,
  getMyHackathonRegistration,
  postHackathon,
  postHackathonRegistration,
  putHackathonStageSubmissionReview,
  putMyHackathonStageSubmission,
  putHackathonStages,
} from './hackathons.controller.ts';

export const hackathonsRoutes = Router();

hackathonsRoutes.get('/', requireSessionUser, asyncHandler(getHackathons));
hackathonsRoutes.get('/:slug', requireSessionUser, asyncHandler(getHackathon));
hackathonsRoutes.post('/', requireAdmin, asyncHandler(postHackathon));
hackathonsRoutes.delete('/:slug', requireAdmin, asyncHandler(deleteHackathon));
hackathonsRoutes.put('/:slug/stages', requireAdmin, asyncHandler(putHackathonStages));
hackathonsRoutes.get('/:slug/my-registration', requireSessionUser, asyncHandler(getMyHackathonRegistration));
hackathonsRoutes.put('/:slug/my-registration/submissions/:stageId', requireSessionUser, asyncHandler(putMyHackathonStageSubmission));
hackathonsRoutes.get('/:slug/registrations', requireAdmin, asyncHandler(getHackathonRegistrations));
hackathonsRoutes.get('/:slug/registrations/:registrationId', requireAdmin, asyncHandler(getHackathonRegistration));
hackathonsRoutes.put('/:slug/registrations/:registrationId/submissions/:stageId/status', requireAdmin, asyncHandler(putHackathonStageSubmissionReview));
hackathonsRoutes.post('/:slug/registrations', requireSessionUser, asyncHandler(postHackathonRegistration));
hackathonsRoutes.delete('/:slug/registrations/:registrationId', requireAdmin, asyncHandler(deleteHackathonRegistrationById));
