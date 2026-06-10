export const BROWSER_HACKATHONS_STORAGE_KEY = 'thread-overflow-session-hackathons';

export interface BrowserHackathonEvaluationCriterion {
  id: string;
  label: string;
  maxScore: number;
}

export interface BrowserHackathonStage {
  id: string;
  name: string;
  code: string;
  type: 'REGISTRATION' | 'SUBMISSION';
  startAt?: string;
  endAt?: string;
  sourceStageId?: string;
  evaluationEnabled?: boolean;
  evaluationMaxScore?: number;
  evaluationCriteria?: BrowserHackathonEvaluationCriterion[];
}

export interface BrowserHackathon {
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
  stages?: BrowserHackathonStage[];
  registrationCount?: number;
  createdAt: string;
}

export interface BrowserHackathonTrackAnalytics {
  track: string;
  registrations: number;
  impressions: number;
  conversionRate: number;
}

export interface BrowserHackathonAnalytics {
  totalRegistrations: number;
  totalImpressions: number;
  completionRate: number;
  activeTracks: number;
  trackStats: BrowserHackathonTrackAnalytics[];
}

export function createHackathonSlug(title: string, id: string) {
  const normalized = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${normalized || 'hackathon'}-${id.slice(-6)}`;
}

export function getTextFromHtml(html: string) {
  if (typeof window === 'undefined') {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  const element = window.document.createElement('div');
  element.innerHTML = html;
  return element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

export function readBrowserHackathons(): BrowserHackathon[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = window.sessionStorage.getItem(BROWSER_HACKATHONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) as BrowserHackathon[] : [];
  } catch {
    return [];
  }
}

export function readBrowserHackathonBySlug(slug: string) {
  return readBrowserHackathons().find((item) => item.slug === slug) ?? null;
}

export function writeBrowserHackathons(hackathons: BrowserHackathon[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(BROWSER_HACKATHONS_STORAGE_KEY, JSON.stringify(hackathons));
}

export function saveBrowserHackathon(hackathon: BrowserHackathon) {
  const existing = readBrowserHackathons().filter((item) => item.id !== hackathon.id);
  writeBrowserHackathons([hackathon, ...existing]);
}

export function removeBrowserHackathon(id: string) {
  writeBrowserHackathons(readBrowserHackathons().filter((item) => item.id !== id));
}

export function getBrowserHackathonAnalytics(hackathon: BrowserHackathon): BrowserHackathonAnalytics {
  const trackStats = hackathon.tracks.map((track) => ({
    track,
    registrations: 0,
    impressions: 0,
    conversionRate: 0,
  }));

  return {
    totalRegistrations: 0,
    totalImpressions: 0,
    completionRate: 0,
    activeTracks: hackathon.tracks.length,
    trackStats,
  };
}

export function createDefaultHackathonStages(): BrowserHackathonStage[] {
  return [
    {
      id: 'reg',
      name: 'Registrations',
      code: 'REG',
      type: 'REGISTRATION',
    },
  ];
}

export function getBrowserHackathonStages(hackathon: BrowserHackathon): BrowserHackathonStage[] {
  return hackathon.stages && hackathon.stages.length > 0
    ? hackathon.stages
    : createDefaultHackathonStages();
}
