import { z } from 'zod';

export const createHackathonSchema = z.object({
  title: z.string().trim().min(1).max(190),
  description: z.string().trim().min(1),
  logoDataUrl: z.string().trim().min(1),
  coverImageDataUrl: z.string().trim().min(1),
  tracks: z.array(z.string().trim().min(1)).min(1),
  registrationStart: z.string().trim().min(1),
  registrationEnd: z.string().trim().min(1),
  participationType: z.enum(['INDIVIDUAL', 'TEAM']),
  minTeamSize: z.string().trim().optional(),
  maxTeamSize: z.string().trim().optional(),
  registrationFields: z.array(z.string().trim().min(1)),
  prizePool: z.string().trim().optional(),
}).superRefine((value, context) => {
  if (value.participationType === 'TEAM') {
    const minTeamSize = Number(value.minTeamSize || '0');
    const maxTeamSize = Number(value.maxTeamSize || '0');

    if (!Number.isInteger(minTeamSize) || minTeamSize < 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Minimum team size must be a positive integer for team hackathons.',
        path: ['minTeamSize'],
      });
    }

    if (!Number.isInteger(maxTeamSize) || maxTeamSize < minTeamSize) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Maximum team size must be greater than or equal to minimum team size.',
        path: ['maxTeamSize'],
      });
    }
  }
});

export type CreateHackathonInput = z.infer<typeof createHackathonSchema>;

export const hackathonStageCriterionSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  maxScore: z.number().int().positive(),
});

export const hackathonStageSchema = z.object({
  id: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
  type: z.enum(['REGISTRATION', 'SUBMISSION']),
  startAt: z.string().trim().min(1).optional(),
  endAt: z.string().trim().min(1).optional(),
  sourceStageId: z.string().trim().min(1).optional(),
  evaluationEnabled: z.boolean().optional(),
  evaluationMaxScore: z.number().int().nonnegative().optional(),
  evaluationCriteria: z.array(hackathonStageCriterionSchema).optional(),
});

export const updateHackathonStagesSchema = z.object({
  stages: z.array(hackathonStageSchema),
});

export type UpdateHackathonStagesInput = z.infer<typeof updateHackathonStagesSchema>;

export const hackathonRegistrationResponseSchema = z.object({
  field: z.string().trim().min(1),
  value: z.string().trim().min(1),
});

export const hackathonRegistrationTeammateSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
});

export const createHackathonRegistrationSchema = z.object({
  participantName: z.string().trim().min(1),
  participantEmail: z.string().trim().email(),
  teamName: z.string().trim().optional(),
  track: z.string().trim().optional(),
  formResponses: z.array(hackathonRegistrationResponseSchema),
  teammates: z.array(hackathonRegistrationTeammateSchema).optional().default([]),
});

export type CreateHackathonRegistrationInput = z.infer<typeof createHackathonRegistrationSchema>;

export interface HackathonListItem {
  id: string;
  slug: string;
  title: string;
  prizePool?: string;
  logoDataUrl: string;
  coverImageDataUrl: string;
  overviewHtml: string;
  overviewText: string;
  tracks: string[];
  registrationStart: string;
  registrationEnd: string;
  participationType: 'INDIVIDUAL' | 'TEAM';
  minTeamSize: string;
  maxTeamSize: string;
  registrationFields: string[];
  stages: HackathonStageItem[];
  registrationCount: number;
  createdAt: string;
}

export interface HackathonStageCriterionItem {
  id: string;
  label: string;
  maxScore: number;
}

export interface HackathonStageItem {
  id: string;
  name: string;
  code: string;
  type: 'REGISTRATION' | 'SUBMISSION';
  startAt?: string;
  endAt?: string;
  sourceStageId?: string;
  evaluationEnabled?: boolean;
  evaluationMaxScore?: number;
  evaluationCriteria?: HackathonStageCriterionItem[];
}

export interface HackathonRegistrationItem {
  id: string;
  participantName: string;
  participantEmail: string;
  teamName?: string;
  track?: string;
  formResponses: Array<{ field: string; value: string }>;
  teammates: Array<{ name: string; email: string }>;
  createdAt: string;
}

export interface HackathonRegistrationMemberItem {
  name: string;
  email: string;
  avatarUrl: string | null;
  role: 'LEAD' | 'MEMBER';
}

export interface HackathonRegistrationSubmissionItem {
  stageId: string;
  stageName: string;
  stageCode: string;
  submitted: boolean;
}

export interface HackathonRegistrationDetailItem extends HackathonRegistrationItem {
  lead: HackathonRegistrationMemberItem;
  members: HackathonRegistrationMemberItem[];
  submissions: HackathonRegistrationSubmissionItem[];
}
