export const BROWSER_HACKATHONS_STORAGE_KEY = 'thread-overflow-session-hackathons';

export interface BrowserHackathon {
  id: string;
  slug: string;
  title: string;
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
  uniqueDomains: number;
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

export function getBrowserHackathonAnalytics(hackathon: BrowserHackathon): BrowserHackathonAnalytics {
  const tracks = hackathon.tracks.length > 0 ? hackathon.tracks : ['General'];
  const baseSeed = createSeed(`${hackathon.id}:${hackathon.title}:${tracks.join('|')}`);
  let remainingRegistrations = 18 + (baseSeed % 74);
  let remainingImpressions = remainingRegistrations * (5 + (baseSeed % 4)) + 60 + (baseSeed % 90);

  const trackStats = tracks.map((track, index) => {
    const trackSeed = createSeed(`${track}:${hackathon.id}:${index}`);
    const tracksLeft = tracks.length - index;
    const minRegistrations = index === tracks.length - 1 ? remainingRegistrations : Math.max(4, Math.floor(remainingRegistrations / (tracksLeft + 1)));
    const maxRegistrations = index === tracks.length - 1 ? remainingRegistrations : Math.max(minRegistrations, remainingRegistrations - (tracksLeft - 1) * 4);
    const registrations = clampNumber(minRegistrations + (trackSeed % Math.max(1, maxRegistrations - minRegistrations + 1)), minRegistrations, maxRegistrations);

    remainingRegistrations -= registrations;

    const minImpressions = registrations * 4;
    const maxImpressions = index === tracks.length - 1
      ? Math.max(minImpressions, remainingImpressions)
      : Math.max(minImpressions, remainingImpressions - (tracksLeft - 1) * 25);
    const impressions = clampNumber(minImpressions + (trackSeed % Math.max(1, maxImpressions - minImpressions + 1)), minImpressions, maxImpressions);

    remainingImpressions -= impressions;

    return {
      track,
      registrations,
      impressions,
      conversionRate: impressions > 0 ? Number(((registrations / impressions) * 100).toFixed(1)) : 0,
    };
  });

  const totalRegistrations = trackStats.reduce((sum, item) => sum + item.registrations, 0);
  const totalImpressions = trackStats.reduce((sum, item) => sum + item.impressions, 0);

  return {
    totalRegistrations,
    totalImpressions,
    completionRate: totalImpressions > 0 ? Number(((totalRegistrations / totalImpressions) * 100).toFixed(1)) : 0,
    uniqueDomains: Math.min(12, Math.max(3, hackathon.registrationFields.length + tracks.length)),
    activeTracks: tracks.length,
    trackStats: trackStats.sort((left, right) => right.registrations - left.registrations),
  };
}

function createSeed(value: string) {
  return value.split('').reduce((seed, char, index) => seed + char.charCodeAt(0) * (index + 1), 0);
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
