import crypto from 'node:crypto';

import { and, asc, count, desc, eq, inArray } from 'drizzle-orm';

import { db } from '../../db/index.ts';
import {
  hackathonRegistrationFields,
  hackathonRegistrations,
  hackathonStageSubmissions,
  hackathonStages,
  hackathons,
  hackathonTracks,
  users,
} from '../../db/schema.ts';
import { deleteStoredObject, uploadImageDataUrl } from '../../lib/object-storage.ts';

import type {
  CreateHackathonInput,
  CreateHackathonRegistrationInput,
  HackathonListItem,
  HackathonRegistrationDetailItem,
  HackathonRegistrationItem,
  HackathonRegistrationSubmissionItem,
  HackathonStageCriterionItem,
  HackathonStageItem,
  ReviewHackathonStageSubmissionInput,
  UpsertHackathonStageSubmissionInput,
  UpdateHackathonStagesInput,
} from './hackathons.types.ts';

function createHackathonSlug(title: string, id: string) {
  const normalized = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${normalized || 'hackathon'}-${id.slice(-6)}`;
}

function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function mapSubmission(
  stage: typeof hackathonStages.$inferSelect,
  record?: typeof hackathonStageSubmissions.$inferSelect,
): HackathonRegistrationSubmissionItem {
  return {
    stageId: stage.id,
    stageName: stage.name,
    stageCode: stage.code,
    status: record?.status ?? 'IN_PROGRESS',
    submitted: record?.submitted ?? false,
    projectTitle: record?.projectTitle ?? undefined,
    summary: record?.summary ?? undefined,
    demoUrl: record?.demoUrl ?? undefined,
    repositoryUrl: record?.repositoryUrl ?? undefined,
    videoUrl: record?.videoUrl ?? undefined,
    deckUrl: record?.deckUrl ?? undefined,
    additionalNotes: record?.additionalNotes ?? undefined,
    score: record?.score ?? undefined,
    panel: record?.panel ?? undefined,
    decisionNote: record?.decisionNote ?? undefined,
    submittedAt: record?.submittedAt?.toISOString(),
    reviewedAt: record?.reviewedAt?.toISOString(),
  };
}

async function getHackathonStageRecords(hackathonId: string) {
  return db
    .select()
    .from(hackathonStages)
    .where(eq(hackathonStages.hackathonId, hackathonId))
    .orderBy(asc(hackathonStages.sortOrder));
}

async function getSubmissionLookup(registrationIds: string[]) {
  if (registrationIds.length === 0) {
    return new Map<string, Map<string, typeof hackathonStageSubmissions.$inferSelect>>();
  }

  const records = await db
    .select()
    .from(hackathonStageSubmissions)
    .where(inArray(hackathonStageSubmissions.registrationId, registrationIds));

  const submissionsByRegistrationId = new Map<string, Map<string, typeof hackathonStageSubmissions.$inferSelect>>();

  for (const record of records) {
    const stageMap = submissionsByRegistrationId.get(record.registrationId) ?? new Map<string, typeof hackathonStageSubmissions.$inferSelect>();
    stageMap.set(record.stageId, record);
    submissionsByRegistrationId.set(record.registrationId, stageMap);
  }

  return submissionsByRegistrationId;
}

async function mapRegistrationRecord(
  record: typeof hackathonRegistrations.$inferSelect,
  stageRecords: Array<typeof hackathonStages.$inferSelect>,
  submissionLookup: Map<string, typeof hackathonStageSubmissions.$inferSelect>,
): Promise<HackathonRegistrationItem> {
  return {
    id: record.id,
    participantName: record.participantName,
    participantEmail: record.participantEmail,
    teamName: record.teamName ?? undefined,
    track: record.track ?? undefined,
    formResponses: record.formResponses,
    teammates: record.teammates,
    submissions: stageRecords
      .filter((stage) => stage.type === 'SUBMISSION')
      .map((stage) => mapSubmission(stage, submissionLookup.get(stage.id))),
    createdAt: record.createdAt.toISOString(),
  };
}

async function mapHackathons(records: Array<typeof hackathons.$inferSelect>): Promise<HackathonListItem[]> {
  if (records.length === 0) {
    return [];
  }

  const hackathonIds = records.map((record) => record.id);
  const [trackRecords, fieldRecords, stageRecords, registrationCounts] = await Promise.all([
    db.select().from(hackathonTracks).where(inArray(hackathonTracks.hackathonId, hackathonIds)).orderBy(asc(hackathonTracks.sortOrder)),
    db.select().from(hackathonRegistrationFields).where(inArray(hackathonRegistrationFields.hackathonId, hackathonIds)).orderBy(asc(hackathonRegistrationFields.sortOrder)),
    db.select().from(hackathonStages).where(inArray(hackathonStages.hackathonId, hackathonIds)).orderBy(asc(hackathonStages.sortOrder)),
    db.select({ hackathonId: hackathonRegistrations.hackathonId, total: count() }).from(hackathonRegistrations).where(inArray(hackathonRegistrations.hackathonId, hackathonIds)).groupBy(hackathonRegistrations.hackathonId),
  ]);
  const registrationCountByHackathonId = new Map(registrationCounts.map((entry) => [entry.hackathonId, entry.total]));

  const mapStage = (record: typeof hackathonStages.$inferSelect): HackathonStageItem => ({
    id: record.id,
    name: record.name,
    code: record.code,
    type: record.type,
    startAt: record.startAt ?? undefined,
    endAt: record.endAt ?? undefined,
    sourceStageId: record.sourceStageId ?? undefined,
    evaluationEnabled: record.type === 'SUBMISSION' ? record.evaluationEnabled : undefined,
    evaluationMaxScore: record.type === 'SUBMISSION' ? record.evaluationMaxScore : undefined,
    evaluationCriteria: record.type === 'SUBMISSION' ? (record.evaluationCriteria as HackathonStageCriterionItem[]) : undefined,
  });

  return records.map((record) => ({
    id: record.id,
    slug: record.slug,
    title: record.title,
    prizePool: record.prizePool ?? undefined,
    logoDataUrl: record.logoUrl,
    coverImageDataUrl: record.coverImageUrl,
    overviewHtml: record.overviewHtml,
    overviewText: record.overviewText,
    tracks: trackRecords.filter((track) => track.hackathonId === record.id).map((track) => track.name),
    registrationStart: record.registrationStart,
    registrationEnd: record.registrationEnd,
    participationType: record.participationType,
    minTeamSize: record.participationType === 'TEAM' && record.minTeamSize ? String(record.minTeamSize) : '',
    maxTeamSize: record.participationType === 'TEAM' && record.maxTeamSize ? String(record.maxTeamSize) : '',
    registrationFields: fieldRecords.filter((field) => field.hackathonId === record.id).map((field) => field.label),
    stages: stageRecords.filter((stage) => stage.hackathonId === record.id).map(mapStage),
    registrationCount: registrationCountByHackathonId.get(record.id) ?? 0,
    createdAt: record.createdAt.toISOString(),
  }));
}

export async function createHackathon(input: CreateHackathonInput, createdBy: string) {
  const id = `hackathon-${crypto.randomUUID()}`;
  const now = new Date();
  const slug = createHackathonSlug(input.title, id);
  const minTeamSize = input.participationType === 'TEAM' ? Number(input.minTeamSize) : null;
  const maxTeamSize = input.participationType === 'TEAM' ? Number(input.maxTeamSize) : null;
  const [logoUpload, coverUpload] = await Promise.all([
    uploadImageDataUrl(input.logoDataUrl, `hackathons/${id}/logo`),
    uploadImageDataUrl(input.coverImageDataUrl, `hackathons/${id}/cover`),
  ]);

  await db.transaction(async (tx) => {
    await tx.insert(hackathons).values({
      id,
      slug,
      title: input.title,
      overviewHtml: input.description,
      overviewText: input.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
      logoObjectKey: logoUpload.key,
      logoUrl: logoUpload.url,
      coverImageObjectKey: coverUpload.key,
      coverImageUrl: coverUpload.url,
      registrationStart: input.registrationStart,
      registrationEnd: input.registrationEnd,
      participationType: input.participationType,
      minTeamSize,
      maxTeamSize,
      status: 'PLANNING',
      prizePool: input.prizePool || null,
      createdBy,
      createdAt: now,
      updatedAt: now,
    });

    await tx.insert(hackathonTracks).values(
      input.tracks.map((track, index) => ({
        id: `hackathon-track-${crypto.randomUUID()}`,
        hackathonId: id,
        name: track,
        sortOrder: index,
      })),
    );

    if (input.registrationFields.length > 0) {
      await tx.insert(hackathonRegistrationFields).values(
        input.registrationFields.map((field, index) => ({
          id: `hackathon-field-${crypto.randomUUID()}`,
          hackathonId: id,
          label: field,
          isDefault: 0,
          sortOrder: index,
        })),
      );
    }

    await tx.insert(hackathonStages).values({
      id: `hackathon-stage-reg-${id}`,
      hackathonId: id,
      name: 'Registrations',
      code: 'REG',
      type: 'REGISTRATION',
      startAt: input.registrationStart,
      endAt: input.registrationEnd,
      sourceStageId: null,
      sortOrder: 0,
      evaluationEnabled: false,
      evaluationMaxScore: 0,
      evaluationCriteria: [],
    });
  });

  const [record] = await db.select().from(hackathons).where(eq(hackathons.id, id)).limit(1);
  const [mapped] = await mapHackathons(record ? [record] : []);

  if (!mapped) {
    throw new Error('Hackathon was created but could not be loaded.');
  }

  return mapped;
}

export async function listHackathons() {
  const records = await db.select().from(hackathons).orderBy(desc(hackathons.createdAt));
  return mapHackathons(records);
}

export async function getHackathonBySlug(slug: string) {
  const [record] = await db.select().from(hackathons).where(eq(hackathons.slug, slug)).limit(1);
  const [mapped] = await mapHackathons(record ? [record] : []);
  return mapped ?? null;
}

export async function deleteHackathonBySlug(slug: string) {
  const [hackathonRecord] = await db.select().from(hackathons).where(eq(hackathons.slug, slug)).limit(1);

  if (!hackathonRecord) {
    return false;
  }

  const objectKeys = [
    hackathonRecord.logoObjectKey,
    hackathonRecord.coverImageObjectKey,
  ].filter(Boolean);

  await db.delete(hackathons).where(eq(hackathons.id, hackathonRecord.id));

  await Promise.allSettled(objectKeys.map((key) => deleteStoredObject(key)));

  return true;
}

export async function replaceHackathonStages(slug: string, input: UpdateHackathonStagesInput) {
  const [hackathonRecord] = await db.select().from(hackathons).where(eq(hackathons.slug, slug)).limit(1);

  if (!hackathonRecord) {
    return null;
  }

  const submissionStages = input.stages.filter((stage) => stage.type === 'SUBMISSION');

  await db.transaction(async (tx) => {
    await tx.delete(hackathonStages).where(eq(hackathonStages.hackathonId, hackathonRecord.id));

    const registrationStageId = `hackathon-stage-reg-${hackathonRecord.id}`;
    await tx.insert(hackathonStages).values({
      id: registrationStageId,
      hackathonId: hackathonRecord.id,
      name: 'Registrations',
      code: 'REG',
      type: 'REGISTRATION',
      startAt: hackathonRecord.registrationStart,
      endAt: hackathonRecord.registrationEnd,
      sourceStageId: null,
      sortOrder: 0,
      evaluationEnabled: false,
      evaluationMaxScore: 0,
      evaluationCriteria: [],
    });

    if (submissionStages.length > 0) {
      const normalizedStages = submissionStages.map((stage, index) => ({
        id: stage.id || `hackathon-stage-${crypto.randomUUID()}`,
        hackathonId: hackathonRecord.id,
        name: stage.name,
        code: stage.code || `R${index + 1}`,
        type: 'SUBMISSION' as const,
        startAt: stage.startAt ?? null,
        endAt: stage.endAt ?? null,
        sortOrder: index + 1,
        evaluationEnabled: stage.evaluationEnabled ?? true,
        evaluationMaxScore: stage.evaluationMaxScore ?? 0,
        evaluationCriteria: stage.evaluationCriteria ?? [],
      }));

      await tx.insert(hackathonStages).values(
        normalizedStages.map((stage, index) => ({
          ...stage,
          sourceStageId: index === 0 ? registrationStageId : normalizedStages[index - 1]?.id,
        })),
      );
    }
  });

  return getHackathonBySlug(slug);
}

export async function createHackathonRegistration(slug: string, userId: string, input: CreateHackathonRegistrationInput) {
  const [hackathonRecord] = await db.select().from(hackathons).where(eq(hackathons.slug, slug)).limit(1);

  if (!hackathonRecord) {
    return null;
  }

  const now = new Date();
  const [record] = await db
    .insert(hackathonRegistrations)
    .values({
      id: `hackathon-registration-${crypto.randomUUID()}`,
      hackathonId: hackathonRecord.id,
      userId,
      participantName: input.participantName,
      participantEmail: input.participantEmail,
      teamName: input.teamName || null,
      track: input.track || null,
      formResponses: input.formResponses,
      teammates: input.teammates ?? [],
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [hackathonRegistrations.hackathonId, hackathonRegistrations.userId],
      set: {
        participantName: input.participantName,
        participantEmail: input.participantEmail,
        teamName: input.teamName || null,
        track: input.track || null,
        formResponses: input.formResponses,
        teammates: input.teammates ?? [],
        updatedAt: now,
      },
    })
    .returning();

  const stageRecords = await getHackathonStageRecords(hackathonRecord.id);

  return {
    registration: await mapRegistrationRecord(record, stageRecords, new Map()),
    hackathon: await getHackathonBySlug(slug),
  };
}

export async function listHackathonRegistrations(slug: string) {
  const [hackathonRecord] = await db.select().from(hackathons).where(eq(hackathons.slug, slug)).limit(1);

  if (!hackathonRecord) {
    return null;
  }

  const records = await db
    .select()
    .from(hackathonRegistrations)
    .where(eq(hackathonRegistrations.hackathonId, hackathonRecord.id))
    .orderBy(desc(hackathonRegistrations.createdAt));

  const [stageRecords, submissionLookup] = await Promise.all([
    getHackathonStageRecords(hackathonRecord.id),
    getSubmissionLookup(records.map((record) => record.id)),
  ]);

  return Promise.all(
    records.map((record) => mapRegistrationRecord(record, stageRecords, submissionLookup.get(record.id) ?? new Map())),
  );
}

export async function getHackathonRegistrationByUserId(slug: string, userId: string) {
  const [hackathonRecord] = await db.select().from(hackathons).where(eq(hackathons.slug, slug)).limit(1);

  if (!hackathonRecord) {
    return null;
  }

  const [registrationRecord] = await db
    .select()
    .from(hackathonRegistrations)
    .where(and(
      eq(hackathonRegistrations.hackathonId, hackathonRecord.id),
      eq(hackathonRegistrations.userId, userId),
    ))
    .limit(1);

  if (!registrationRecord) {
    return false;
  }

  return getHackathonRegistrationById(slug, registrationRecord.id);
}

export async function getHackathonRegistrationById(slug: string, registrationId: string) {
  const [hackathonRecord] = await db.select().from(hackathons).where(eq(hackathons.slug, slug)).limit(1);

  if (!hackathonRecord) {
    return null;
  }

  const [registrationRecord] = await db
    .select()
    .from(hackathonRegistrations)
    .where(eq(hackathonRegistrations.id, registrationId))
    .limit(1);

  if (!registrationRecord || registrationRecord.hackathonId !== hackathonRecord.id) {
    return false;
  }

  const memberEmails = [
    registrationRecord.participantEmail,
    ...registrationRecord.teammates.map((member) => member.email),
  ]
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const matchedUsers = memberEmails.length > 0
    ? await db.select().from(users).where(inArray(users.email, memberEmails))
    : [];
  const avatarByEmail = new Map(matchedUsers.map((user) => [user.email.toLowerCase(), user.avatarUrl ?? null]));
  const [stageRecords, submissionLookup] = await Promise.all([
    getHackathonStageRecords(hackathonRecord.id),
    getSubmissionLookup([registrationRecord.id]),
  ]);
  const baseRegistration = await mapRegistrationRecord(
    registrationRecord,
    stageRecords,
    submissionLookup.get(registrationRecord.id) ?? new Map(),
  );
  const lead = {
    name: baseRegistration.participantName,
    email: baseRegistration.participantEmail,
    avatarUrl: avatarByEmail.get(baseRegistration.participantEmail.toLowerCase()) ?? null,
    role: 'LEAD' as const,
  };
  const members = [
    lead,
    ...baseRegistration.teammates.map((member) => ({
      name: member.name,
      email: member.email,
      avatarUrl: avatarByEmail.get(member.email.toLowerCase()) ?? null,
      role: 'MEMBER' as const,
    })),
  ];

  const detail: HackathonRegistrationDetailItem = {
    ...baseRegistration,
    lead,
    members,
  };

  return detail;
}

export async function upsertHackathonStageSubmission(
  slug: string,
  userId: string,
  stageId: string,
  input: UpsertHackathonStageSubmissionInput,
) {
  const [hackathonRecord] = await db.select().from(hackathons).where(eq(hackathons.slug, slug)).limit(1);

  if (!hackathonRecord) {
    return null;
  }

  const [registrationRecord, stageRecord] = await Promise.all([
    db
      .select()
      .from(hackathonRegistrations)
      .where(and(
        eq(hackathonRegistrations.hackathonId, hackathonRecord.id),
        eq(hackathonRegistrations.userId, userId),
      ))
      .limit(1)
      .then((records) => records[0]),
    db
      .select()
      .from(hackathonStages)
      .where(and(
        eq(hackathonStages.hackathonId, hackathonRecord.id),
        eq(hackathonStages.id, stageId),
      ))
      .limit(1)
      .then((records) => records[0]),
  ]);

  if (!registrationRecord) {
    return false;
  }

  if (!stageRecord || stageRecord.type !== 'SUBMISSION') {
    return 'stage_not_found' as const;
  }

  const now = new Date();
  const [submissionRecord] = await db
    .insert(hackathonStageSubmissions)
    .values({
      id: `hackathon-stage-submission-${crypto.randomUUID()}`,
      registrationId: registrationRecord.id,
      stageId: stageRecord.id,
      projectTitle: normalizeOptionalText(input.projectTitle),
      summary: normalizeOptionalText(input.summary),
      demoUrl: normalizeOptionalText(input.demoUrl),
      repositoryUrl: normalizeOptionalText(input.repositoryUrl),
      videoUrl: normalizeOptionalText(input.videoUrl),
      deckUrl: normalizeOptionalText(input.deckUrl),
      additionalNotes: normalizeOptionalText(input.additionalNotes),
      submitted: input.submitted,
      status: 'IN_PROGRESS',
      submittedAt: input.submitted ? now : null,
      reviewedAt: null,
      updatedAt: now,
      createdAt: now,
    })
    .onConflictDoUpdate({
      target: [hackathonStageSubmissions.registrationId, hackathonStageSubmissions.stageId],
      set: {
        projectTitle: normalizeOptionalText(input.projectTitle),
        summary: normalizeOptionalText(input.summary),
        demoUrl: normalizeOptionalText(input.demoUrl),
        repositoryUrl: normalizeOptionalText(input.repositoryUrl),
        videoUrl: normalizeOptionalText(input.videoUrl),
        deckUrl: normalizeOptionalText(input.deckUrl),
        additionalNotes: normalizeOptionalText(input.additionalNotes),
        submitted: input.submitted,
        status: 'IN_PROGRESS',
        submittedAt: input.submitted ? now : null,
        reviewedAt: null,
        decisionNote: null,
        updatedAt: now,
      },
    })
    .returning();

  return {
    registration: await getHackathonRegistrationById(slug, registrationRecord.id),
    submission: mapSubmission(stageRecord, submissionRecord),
  };
}

export async function reviewHackathonStageSubmission(
  slug: string,
  registrationId: string,
  stageId: string,
  input: ReviewHackathonStageSubmissionInput,
) {
  const [hackathonRecord] = await db.select().from(hackathons).where(eq(hackathons.slug, slug)).limit(1);

  if (!hackathonRecord) {
    return null;
  }

  const [registrationRecord, stageRecord] = await Promise.all([
    db
      .select()
      .from(hackathonRegistrations)
      .where(and(
        eq(hackathonRegistrations.id, registrationId),
        eq(hackathonRegistrations.hackathonId, hackathonRecord.id),
      ))
      .limit(1)
      .then((records) => records[0]),
    db
      .select()
      .from(hackathonStages)
      .where(and(
        eq(hackathonStages.id, stageId),
        eq(hackathonStages.hackathonId, hackathonRecord.id),
      ))
      .limit(1)
      .then((records) => records[0]),
  ]);

  if (!registrationRecord) {
    return false;
  }

  if (!stageRecord || stageRecord.type !== 'SUBMISSION') {
    return 'stage_not_found' as const;
  }

  const [existingSubmission] = await db
    .select()
    .from(hackathonStageSubmissions)
    .where(and(
      eq(hackathonStageSubmissions.registrationId, registrationRecord.id),
      eq(hackathonStageSubmissions.stageId, stageRecord.id),
    ))
    .limit(1);

  if (!existingSubmission) {
    return 'submission_not_found' as const;
  }

  const now = new Date();
  await db
    .update(hackathonStageSubmissions)
    .set({
      status: input.status,
      score: normalizeOptionalText(input.score),
      panel: normalizeOptionalText(input.panel),
      decisionNote: normalizeOptionalText(input.decisionNote),
      reviewedAt: now,
      updatedAt: now,
    })
    .where(eq(hackathonStageSubmissions.id, existingSubmission.id));

  return {
    registration: await getHackathonRegistrationById(slug, registrationRecord.id),
  };
}

export async function deleteHackathonRegistration(slug: string, registrationId: string) {
  const [hackathonRecord] = await db.select().from(hackathons).where(eq(hackathons.slug, slug)).limit(1);

  if (!hackathonRecord) {
    return null;
  }

  const [existingRegistration] = await db
    .select()
    .from(hackathonRegistrations)
    .where(eq(hackathonRegistrations.id, registrationId))
    .limit(1);

  if (!existingRegistration || existingRegistration.hackathonId !== hackathonRecord.id) {
    return false;
  }

  const [deletedRecord] = await db
    .delete(hackathonRegistrations)
    .where(eq(hackathonRegistrations.id, registrationId))
    .returning();

  return Boolean(deletedRecord);
}
