import { boolean, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const appRoleEnum = pgEnum('app_role', ['ADMIN', 'USER']);
export const hackathonStatusEnum = pgEnum('hackathon_status', ['PLANNING', 'LIVE', 'REVIEW', 'COMPLETED']);
export const participationTypeEnum = pgEnum('participation_type', ['INDIVIDUAL', 'TEAM']);
export const hackathonStageTypeEnum = pgEnum('hackathon_stage_type', ['REGISTRATION', 'SUBMISSION']);
export const hackathonSubmissionStatusEnum = pgEnum('hackathon_submission_status', ['IN_PROGRESS', 'SHORTLISTED', 'REJECTED']);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  role: appRoleEnum('role').notNull().default('USER'),
  azureRoles: text('azure_roles').array().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }).notNull().defaultNow(),
});

export const hackathons = pgTable('hackathons', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  overviewHtml: text('overview_html').notNull(),
  overviewText: text('overview_text').notNull(),
  logoObjectKey: text('logo_object_key').notNull(),
  logoUrl: text('logo_url').notNull(),
  coverImageObjectKey: text('cover_image_object_key').notNull(),
  coverImageUrl: text('cover_image_url').notNull(),
  registrationStart: text('registration_start').notNull(),
  registrationEnd: text('registration_end').notNull(),
  participationType: participationTypeEnum('participation_type').notNull(),
  minTeamSize: integer('min_team_size'),
  maxTeamSize: integer('max_team_size'),
  status: hackathonStatusEnum('status').notNull().default('PLANNING'),
  prizePool: text('prize_pool'),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const hackathonTracks = pgTable('hackathon_tracks', {
  id: text('id').primaryKey(),
  hackathonId: text('hackathon_id').notNull().references(() => hackathons.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull(),
}, (table) => ({
  hackathonTrackNameIdx: uniqueIndex('hackathon_track_name_idx').on(table.hackathonId, table.name),
}));

export const hackathonRegistrationFields = pgTable('hackathon_registration_fields', {
  id: text('id').primaryKey(),
  hackathonId: text('hackathon_id').notNull().references(() => hackathons.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  isDefault: integer('is_default').notNull().default(0),
  sortOrder: integer('sort_order').notNull(),
}, (table) => ({
  hackathonRegistrationFieldLabelIdx: uniqueIndex('hackathon_registration_field_label_idx').on(table.hackathonId, table.label),
}));

export const hackathonStages = pgTable('hackathon_stages', {
  id: text('id').primaryKey(),
  hackathonId: text('hackathon_id').notNull().references(() => hackathons.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  code: text('code').notNull(),
  type: hackathonStageTypeEnum('type').notNull(),
  startAt: text('start_at'),
  endAt: text('end_at'),
  sourceStageId: text('source_stage_id'),
  sortOrder: integer('sort_order').notNull(),
  evaluationEnabled: boolean('evaluation_enabled').notNull().default(true),
  evaluationMaxScore: integer('evaluation_max_score').notNull().default(0),
  evaluationCriteria: jsonb('evaluation_criteria').$type<Array<{ id: string; label: string; maxScore: number }>>().notNull().default([]),
}, (table) => ({
  hackathonStageCodeIdx: uniqueIndex('hackathon_stage_code_idx').on(table.hackathonId, table.code),
}));

export const hackathonRegistrations = pgTable('hackathon_registrations', {
  id: text('id').primaryKey(),
  hackathonId: text('hackathon_id').notNull().references(() => hackathons.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  participantName: text('participant_name').notNull(),
  participantEmail: text('participant_email').notNull(),
  teamName: text('team_name'),
  track: text('track'),
  formResponses: jsonb('form_responses').$type<Array<{ field: string; value: string }>>().notNull().default([]),
  teammates: jsonb('teammates').$type<Array<{ name: string; email: string }>>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  hackathonRegistrationUserIdx: uniqueIndex('hackathon_registration_user_idx').on(table.hackathonId, table.userId),
}));

export const hackathonStageSubmissions = pgTable('hackathon_stage_submissions', {
  id: text('id').primaryKey(),
  registrationId: text('registration_id').notNull().references(() => hackathonRegistrations.id, { onDelete: 'cascade' }),
  stageId: text('stage_id').notNull().references(() => hackathonStages.id, { onDelete: 'cascade' }),
  projectTitle: text('project_title'),
  summary: text('summary'),
  demoUrl: text('demo_url'),
  repositoryUrl: text('repository_url'),
  videoUrl: text('video_url'),
  deckUrl: text('deck_url'),
  additionalNotes: text('additional_notes'),
  submitted: boolean('submitted').notNull().default(false),
  status: hackathonSubmissionStatusEnum('status').notNull().default('IN_PROGRESS'),
  score: text('score'),
  panel: text('panel'),
  decisionNote: text('decision_note'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  hackathonStageSubmissionIdx: uniqueIndex('hackathon_stage_submission_idx').on(table.registrationId, table.stageId),
}));
