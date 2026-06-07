import type { Request, Response } from 'express';

import {
  createHackathonRegistrationSchema,
  createHackathonSchema,
  reviewHackathonStageSubmissionSchema,
  updateHackathonStagesSchema,
  upsertHackathonStageSubmissionSchema,
} from './hackathons.types.ts';
import {
  createHackathon,
  deleteHackathonBySlug,
  deleteHackathonRegistration,
  createHackathonRegistration,
  getHackathonBySlug,
  getHackathonRegistrationById,
  getHackathonRegistrationByUserId,
  listHackathonRegistrations,
  listHackathons,
  reviewHackathonStageSubmission,
  replaceHackathonStages,
  upsertHackathonStageSubmission,
} from './hackathons.service.ts';

export async function getHackathons(_req: Request, res: Response) {
  const hackathons = await listHackathons();
  res.json({ hackathons });
}

export async function getHackathon(req: Request, res: Response) {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const hackathon = await getHackathonBySlug(slug);

  if (!hackathon) {
    res.status(404).json({
      error: 'hackathon_not_found',
    });
    return;
  }

  res.json({ hackathon });
}

export async function postHackathon(req: Request, res: Response) {
  const parsed = createHackathonSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: 'invalid_hackathon_payload',
      issues: parsed.error.flatten(),
    });
    return;
  }

  if (!req.session.user) {
    res.status(401).json({
      error: 'unauthorized',
    });
    return;
  }

  const hackathon = await createHackathon(parsed.data, req.session.user.id);
  res.status(201).json({ hackathon });
}

export async function deleteHackathon(req: Request, res: Response) {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const deleted = await deleteHackathonBySlug(slug);

  if (!deleted) {
    res.status(404).json({
      error: 'hackathon_not_found',
    });
    return;
  }

  res.status(204).send();
}

export async function putHackathonStages(req: Request, res: Response) {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const parsed = updateHackathonStagesSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: 'invalid_hackathon_stages_payload',
      issues: parsed.error.flatten(),
    });
    return;
  }

  const hackathon = await replaceHackathonStages(slug, parsed.data);

  if (!hackathon) {
    res.status(404).json({
      error: 'hackathon_not_found',
    });
    return;
  }

  res.json({ hackathon });
}

export async function getHackathonRegistrations(req: Request, res: Response) {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const registrations = await listHackathonRegistrations(slug);

  if (!registrations) {
    res.status(404).json({
      error: 'hackathon_not_found',
    });
    return;
  }

  res.json({ registrations });
}

export async function getHackathonRegistration(req: Request, res: Response) {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const registrationId = Array.isArray(req.params.registrationId) ? req.params.registrationId[0] : req.params.registrationId;
  const registration = await getHackathonRegistrationById(slug, registrationId);

  if (registration === null) {
    res.status(404).json({
      error: 'hackathon_not_found',
    });
    return;
  }

  if (registration === false) {
    res.status(404).json({
      error: 'registration_not_found',
    });
    return;
  }

  res.json({ registration });
}

export async function getMyHackathonRegistration(req: Request, res: Response) {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

  if (!req.session.user) {
    res.status(401).json({
      error: 'unauthorized',
    });
    return;
  }

  const registration = await getHackathonRegistrationByUserId(slug, req.session.user.id);

  if (registration === null) {
    res.status(404).json({
      error: 'hackathon_not_found',
    });
    return;
  }

  if (registration === false) {
    res.status(404).json({
      error: 'registration_not_found',
    });
    return;
  }

  res.json({ registration });
}

export async function postHackathonRegistration(req: Request, res: Response) {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const parsed = createHackathonRegistrationSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: 'invalid_hackathon_registration_payload',
      issues: parsed.error.flatten(),
    });
    return;
  }

  if (!req.session.user) {
    res.status(401).json({
      error: 'unauthorized',
    });
    return;
  }

  const result = await createHackathonRegistration(slug, req.session.user.id, parsed.data);

  if (!result || !result.hackathon) {
    res.status(404).json({
      error: 'hackathon_not_found',
    });
    return;
  }

  res.status(201).json(result);
}

export async function putMyHackathonStageSubmission(req: Request, res: Response) {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const stageId = Array.isArray(req.params.stageId) ? req.params.stageId[0] : req.params.stageId;
  const parsed = upsertHackathonStageSubmissionSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: 'invalid_hackathon_stage_submission_payload',
      issues: parsed.error.flatten(),
    });
    return;
  }

  if (!req.session.user) {
    res.status(401).json({
      error: 'unauthorized',
    });
    return;
  }

  const result = await upsertHackathonStageSubmission(slug, req.session.user.id, stageId, parsed.data);

  if (result === null) {
    res.status(404).json({
      error: 'hackathon_not_found',
    });
    return;
  }

  if (result === false) {
    res.status(404).json({
      error: 'registration_not_found',
    });
    return;
  }

  if (result === 'stage_not_found') {
    res.status(404).json({
      error: 'stage_not_found',
    });
    return;
  }

  res.json({ registration: result.registration });
}

export async function putHackathonStageSubmissionReview(req: Request, res: Response) {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const registrationId = Array.isArray(req.params.registrationId) ? req.params.registrationId[0] : req.params.registrationId;
  const stageId = Array.isArray(req.params.stageId) ? req.params.stageId[0] : req.params.stageId;
  const parsed = reviewHackathonStageSubmissionSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: 'invalid_hackathon_stage_submission_review_payload',
      issues: parsed.error.flatten(),
    });
    return;
  }

  const result = await reviewHackathonStageSubmission(slug, registrationId, stageId, parsed.data);

  if (result === null) {
    res.status(404).json({
      error: 'hackathon_not_found',
    });
    return;
  }

  if (result === false) {
    res.status(404).json({
      error: 'registration_not_found',
    });
    return;
  }

  if (result === 'stage_not_found') {
    res.status(404).json({
      error: 'stage_not_found',
    });
    return;
  }

  if (result === 'submission_not_found') {
    res.status(404).json({
      error: 'submission_not_found',
    });
    return;
  }

  res.json({ registration: result.registration });
}

export async function deleteHackathonRegistrationById(req: Request, res: Response) {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const registrationId = Array.isArray(req.params.registrationId) ? req.params.registrationId[0] : req.params.registrationId;
  const deleted = await deleteHackathonRegistration(slug, registrationId);

  if (deleted === null) {
    res.status(404).json({
      error: 'hackathon_not_found',
    });
    return;
  }

  if (!deleted) {
    res.status(404).json({
      error: 'registration_not_found',
    });
    return;
  }

  res.status(204).send();
}
