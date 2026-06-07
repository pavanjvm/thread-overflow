import { API_BASE_URL } from '@/lib/constants';
import type { BrowserHackathon, BrowserHackathonStage } from '@/lib/browser-hackathons';

export interface CreateHackathonPayload {
  title: string;
  description: string;
  logoDataUrl: string;
  coverImageDataUrl: string;
  tracks: string[];
  registrationStart: string;
  registrationEnd: string;
  participationType: 'INDIVIDUAL' | 'TEAM';
  minTeamSize?: string;
  maxTeamSize?: string;
  registrationFields: string[];
  prizePool?: string;
}

interface HackathonsResponse {
  hackathons: BrowserHackathon[];
}

interface HackathonResponse {
  hackathon: BrowserHackathon;
}

interface HackathonRegistrationResponse {
  registration: {
    id: string;
  };
  hackathon: BrowserHackathon;
}

interface HackathonRegistrationsResponse {
  registrations: HackathonRegistrationItem[];
}

interface HackathonRegistrationDetailResponse {
  registration: HackathonRegistrationDetailItem;
}

export interface CreateHackathonRegistrationPayload {
  participantName: string;
  participantEmail: string;
  teamName?: string;
  track?: string;
  formResponses: Array<{ field: string; value: string }>;
  teammates?: Array<{ name: string; email: string }>;
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

export async function fetchHackathons() {
  const response = await fetch(`${API_BASE_URL}/hackathons`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Unable to load hackathons.');
  }

  const payload = (await response.json()) as HackathonsResponse;
  return payload.hackathons;
}

export async function createHackathon(payload: CreateHackathonPayload) {
  const response = await fetch(`${API_BASE_URL}/hackathons`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Unable to create hackathon.');
  }

  const data = (await response.json()) as HackathonResponse;
  return data.hackathon;
}

export async function fetchHackathonBySlug(slug: string) {
  const response = await fetch(`${API_BASE_URL}/hackathons/${slug}`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Unable to load hackathon.');
  }

  const data = (await response.json()) as HackathonResponse;
  return data.hackathon;
}

export async function deleteHackathon(slug: string) {
  const response = await fetch(`${API_BASE_URL}/hackathons/${slug}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to delete hackathon.');
  }
}

export async function updateHackathonStages(slug: string, stages: BrowserHackathonStage[]) {
  const response = await fetch(`${API_BASE_URL}/hackathons/${slug}/stages`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ stages }),
  });

  if (!response.ok) {
    throw new Error('Unable to update hackathon stages.');
  }

  const data = (await response.json()) as HackathonResponse;
  return data.hackathon;
}

export async function createHackathonRegistration(slug: string, payload: CreateHackathonRegistrationPayload) {
  const response = await fetch(`${API_BASE_URL}/hackathons/${slug}/registrations`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Unable to submit registration.');
  }

  const data = (await response.json()) as HackathonRegistrationResponse;
  return data;
}

export async function fetchHackathonRegistrations(slug: string) {
  const response = await fetch(`${API_BASE_URL}/hackathons/${slug}/registrations`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Unable to load hackathon registrations.');
  }

  const data = (await response.json()) as HackathonRegistrationsResponse;
  return data.registrations;
}

export async function deleteHackathonRegistration(slug: string, registrationId: string) {
  const response = await fetch(`${API_BASE_URL}/hackathons/${slug}/registrations/${registrationId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to delete hackathon registration.');
  }
}

export async function fetchHackathonRegistrationById(slug: string, registrationId: string) {
  const response = await fetch(`${API_BASE_URL}/hackathons/${slug}/registrations/${registrationId}`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Unable to load hackathon registration.');
  }

  const data = (await response.json()) as HackathonRegistrationDetailResponse;
  return data.registration;
}
