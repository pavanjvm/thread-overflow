import crypto from 'node:crypto';

import { asc, count, desc, eq, inArray } from 'drizzle-orm';

import { db } from '../../db/index.ts';
import { hackathonRegistrationFields, hackathonRegistrations, hackathonStages, hackathons, hackathonTracks, users } from '../../db/schema.ts';
import { deleteStoredObject, uploadImageDataUrl } from '../../lib/object-storage.ts';

import type {
  CreateHackathonInput,
  HackathonListItem,
  HackathonStageCriterionItem,
  HackathonStageItem,
  HackathonRegistrationItem,
  HackathonRegistrationDetailItem,
  CreateHackathonRegistrationInput,
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

function mapRegistration(record: typeof hackathonRegistrations.$inferSelect): HackathonRegistrationItem {
  return {
    id: record.id,
    participantName: record.participantName,
    participantEmail: record.participantEmail,
    teamName: record.teamName ?? undefined,
    track: record.track ?? undefined,
    formResponses: record.formResponses,
    teammates: record.teammates,
    createdAt: record.createdAt.toISOString(),
  };
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

  return {
    registration: mapRegistration(record),
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

  return records.map(mapRegistration);
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

  const stageRecords = await db
    .select()
    .from(hackathonStages)
    .where(eq(hackathonStages.hackathonId, hackathonRecord.id))
    .orderBy(asc(hackathonStages.sortOrder));

  const baseRegistration = mapRegistration(registrationRecord);
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
  const submissions = stageRecords
    .filter((stage) => stage.type === 'SUBMISSION')
    .map((stage) => ({
      stageId: stage.id,
      stageName: stage.name,
      stageCode: stage.code,
      submitted: false,
    }));

  const detail: HackathonRegistrationDetailItem = {
    ...baseRegistration,
    lead,
    members,
    submissions,
  };

  return detail;
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
