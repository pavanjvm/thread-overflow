'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  FileUp,
  Mail,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { BrowserHackathon } from '@/lib/browser-hackathons';
import {
  fetchHackathonBySlug,
  fetchHackathonRegistrationById,
  type HackathonRegistrationDetailItem,
  type HackathonRegistrationMemberItem,
} from '@/lib/hackathons';

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-US', options ?? { dateStyle: 'medium' }).format(new Date(value));
}

function getSubmissionBadge(submission: HackathonRegistrationDetailItem['submissions'][number]) {
  if (!submission.submitted) {
    return {
      label: submission.projectTitle || submission.summary ? 'Draft Saved' : 'Pending',
      className: 'bg-slate-200 text-slate-700 hover:bg-slate-200',
    };
  }

  if (submission.status === 'SHORTLISTED') {
    return {
      label: 'Shortlisted',
      className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
    };
  }

  if (submission.status === 'REJECTED') {
    return {
      label: 'Rejected',
      className: 'bg-red-100 text-red-700 hover:bg-red-100',
    };
  }

  return {
    label: 'Under Review',
    className: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  };
}

function MemberCard({
  member,
  highlighted = false,
}: {
  member: HackathonRegistrationMemberItem;
  highlighted?: boolean;
}) {
  return (
    <div
      className={[
        'rounded-[28px] border p-5 shadow-sm backdrop-blur-md transition',
        highlighted
          ? 'border-white/80 bg-white/68 text-slate-950 shadow-[0_20px_60px_rgba(148,163,184,0.16)]'
          : 'border-white/70 bg-white/58 hover:-translate-y-0.5 hover:bg-white/68 hover:shadow-md',
      ].join(' ')}
    >
      <div className="flex items-start gap-4">
        <Avatar className={highlighted ? 'h-16 w-16 ring-2 ring-sky-100' : 'h-14 w-14 ring-1 ring-white/70'}>
          <AvatarImage src={member.avatarUrl ?? undefined} alt={member.name} />
          <AvatarFallback className={highlighted ? 'bg-sky-100 text-sky-800' : 'bg-white/80 text-slate-700'}>
            {initials(member.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={highlighted ? 'text-xl font-semibold text-slate-950' : 'text-lg font-semibold text-slate-950'}>
              {member.name}
            </p>
            <Badge
              variant={highlighted ? 'secondary' : 'outline'}
              className={highlighted ? 'border-white/80 bg-white/80 text-slate-700' : 'bg-white/70'}
            >
              {member.role === 'LEAD' ? 'Leader' : 'Member'}
            </Badge>
          </div>
          <p className={highlighted ? 'mt-2 text-sm text-slate-500' : 'mt-2 text-sm text-slate-500'}>
            {member.email}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'dark';
}) {
  return (
    <div
      className={[
        'rounded-[24px] border px-5 py-4 backdrop-blur-xl',
        tone === 'dark'
          ? 'border-white/55 bg-white/28 text-slate-950 shadow-[0_18px_40px_rgba(148,163,184,0.16)]'
          : 'border-white/70 bg-white/58 shadow-sm',
      ].join(' ')}
    >
      <p className={tone === 'dark' ? 'text-xs uppercase tracking-[0.24em] text-slate-500' : 'text-xs uppercase tracking-[0.24em] text-slate-400'}>
        {label}
      </p>
      <p className={tone === 'dark' ? 'mt-2 text-xl font-semibold text-slate-950' : 'mt-2 text-xl font-semibold text-slate-950'}>
        {value}
      </p>
    </div>
  );
}

export default function ManageRegistrationDetailPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const registrationId = Array.isArray(params.registrationId) ? params.registrationId[0] : params.registrationId;

  const [registration, setRegistration] = useState<HackathonRegistrationDetailItem | null>(null);
  const [hackathon, setHackathon] = useState<BrowserHackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !registrationId) {
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      try {
        const [hackathonDetail, registrationDetail] = await Promise.all([
          fetchHackathonBySlug(slug),
          fetchHackathonRegistrationById(slug, registrationId),
        ]);

        if (cancelled) {
          return;
        }

        setHackathon(hackathonDetail);
        setRegistration(registrationDetail);
        setError(null);
      } catch {
        if (!cancelled) {
          setError('Unable to load this team right now.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [registrationId, slug]);

  const teamMembers = useMemo(
    () => registration?.members.filter((member) => member.role === 'MEMBER') ?? [],
    [registration],
  );

  if (loading) {
    return <div className="min-h-[720px] rounded-[32px] border border-white/70 bg-white/55 shadow-sm backdrop-blur-md" />;
  }

  if (error || !registration || !slug) {
    return (
      <Card className="rounded-[32px] border-white/70 bg-white/60 shadow-sm backdrop-blur-md">
        <CardContent className="space-y-4 p-10 text-center">
          <h1 className="text-2xl font-semibold text-slate-950">Team not found</h1>
          <p className="text-sm text-slate-500">{error ?? 'The registration details are not available.'}</p>
          <div className="flex justify-center">
            <Button asChild>
              <Link href={`/hackathons/${slug}/manage`}>Back to manage</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const teamTitle = registration.teamName || registration.participantName;
  const submissionCount = registration.submissions.filter((submission) => submission.submitted).length;
  const totalMembers = registration.members.length;
  const primaryTrack = registration.track || 'No track selected';

  return (
    <div className="relative isolate overflow-hidden rounded-[40px] p-3 md:p-4">
      {hackathon?.coverImageDataUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: `url(${hackathon.coverImageDataUrl})` }}
        />
      ) : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.7),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(186,230,253,0.35),_transparent_32%),linear-gradient(180deg,rgba(248,250,252,0.8),rgba(239,246,255,0.72))]" />
      <div className="absolute inset-0 backdrop-blur-[6px]" />

      <div className="relative z-10 space-y-6">
      <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/55 shadow-sm backdrop-blur-md">
        <div className="relative isolate overflow-hidden">
          {hackathon?.coverImageDataUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${hackathon.coverImageDataUrl})` }}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-br from-white/78 via-sky-50/74 to-blue-100/76" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.55),_transparent_36%),radial-gradient(circle_at_bottom_left,_rgba(125,211,252,0.28),_transparent_34%)]" />

          <div className="relative z-10 p-8 md:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3 text-slate-600">
              <Link
                href={`/hackathons/${slug}/manage`}
                className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm text-slate-700 shadow-sm backdrop-blur transition hover:bg-white/90"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to manage
              </Link>
              <div className="flex items-center gap-2 text-sm">
                <span>Manage</span>
                <ChevronRight className="h-4 w-4" />
                <span>Teams</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-slate-950">{teamTitle}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-4">
                  <Badge className="border-white/80 bg-white/80 px-3 py-1 text-slate-700 shadow-sm hover:bg-white/80">
                    Team Profile
                  </Badge>
                </div>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">{teamTitle}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                  Review the roster, registration responses, and round readiness for this team in one place.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <StatCard label="Hackathon" value={hackathon?.title || 'Hackathon'} tone="dark" />
                  <StatCard label="Track" value={primaryTrack} tone="dark" />
                  <StatCard label="Members" value={`${totalMembers}`} tone="dark" />
                  <StatCard
                    label="Submitted Rounds"
                    value={`${submissionCount}/${registration.submissions.length}`}
                    tone="dark"
                  />
                </div>
              </div>

              <div className="grid min-w-[280px] gap-3 sm:grid-cols-2 lg:w-[320px] lg:grid-cols-1">
                <div className="rounded-[28px] border border-white/75 bg-white/78 p-5 text-slate-900 shadow-sm backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Lead</p>
                  <div className="mt-3 flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-sky-100">
                      <AvatarImage src={registration.lead.avatarUrl ?? undefined} alt={registration.lead.name} />
                      <AvatarFallback className="bg-sky-100 text-sky-800">
                        {initials(registration.lead.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{registration.lead.name}</p>
                      <p className="truncate text-sm text-slate-500">{registration.lead.email}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[28px] border border-white/75 bg-white/78 p-5 text-slate-900 shadow-sm backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Registered</p>
                  <p className="mt-3 text-lg font-semibold">{formatDate(registration.createdAt)}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(registration.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_380px]">
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-3">
            <StatCard label="Participation" value={hackathon?.participationType || 'TEAM'} />
            <StatCard label="Responses" value={`${registration.formResponses.length}`} />
            <StatCard label="Rounds" value={`${registration.submissions.length}`} />
          </section>

          <Card className="rounded-[32px] border-white/70 bg-white/52 shadow-sm backdrop-blur-md">
            <CardContent className="p-6 md:p-7">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Roster</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Team Members</h2>
                </div>
                <Badge variant="outline" className="rounded-full bg-white/70 px-3 py-1 text-slate-600">
                  {totalMembers} total
                </Badge>
              </div>

              <div className="mt-6">
                <MemberCard member={registration.lead} highlighted />
              </div>

              {teamMembers.length > 0 ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {teamMembers.map((member) => (
                    <MemberCard key={member.email} member={member} />
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-[28px] border border-dashed border-white/80 bg-white/42 px-6 py-8 text-sm text-slate-500 backdrop-blur-md">
                  This registration does not include additional teammates yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-white/70 bg-white/52 shadow-sm backdrop-blur-md">
            <CardContent className="p-6 md:p-7">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Progress</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Submission Rounds</h2>
                </div>
                <Badge variant="outline" className="rounded-full bg-white/70 px-3 py-1 text-slate-600">
                  {submissionCount} submitted
                </Badge>
              </div>

              {registration.submissions.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {registration.submissions.map((submission, index) => (
                    (() => {
                      const badge = getSubmissionBadge(submission);

                      return (
                    <div
                      key={submission.stageId}
                      className="grid gap-4 rounded-[28px] border border-white/75 bg-white/50 p-5 backdrop-blur-md md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-sky-700 shadow-sm backdrop-blur-md">
                        <FileUp className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-slate-950">{submission.stageName}</p>
                          <Badge variant="outline">{submission.stageCode}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {submission.submitted
                            ? submission.status === 'SHORTLISTED'
                              ? 'This team was shortlisted for the next step in this round.'
                              : submission.status === 'REJECTED'
                                ? (submission.decisionNote || 'This submission was reviewed and not shortlisted.')
                                : 'A submission is available and is currently waiting for review.'
                            : submission.projectTitle || submission.summary
                              ? 'A draft exists for this round, but it has not been formally submitted yet.'
                              : 'No submission has been uploaded for this round yet.'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className={badge.className}>
                          {badge.label}
                        </Badge>
                        <span className="text-xs uppercase tracking-[0.24em] text-slate-400">
                          Round {index + 1}
                        </span>
                      </div>
                    </div>
                      );
                    })()
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[28px] border border-dashed border-white/80 bg-white/42 px-6 py-8 text-sm text-slate-500 backdrop-blur-md">
                  No submission rounds are configured for this hackathon yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-white/70 bg-white/52 shadow-sm backdrop-blur-md">
            <CardContent className="p-6 md:p-7">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Details</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Registration Responses
                </h2>
              </div>

              {registration.formResponses.length > 0 ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {registration.formResponses.map((response) => (
                    <div key={response.field} className="rounded-[24px] border border-white/75 bg-white/55 p-5 backdrop-blur-md">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{response.field}</p>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {response.value || '-'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[28px] border border-dashed border-white/80 bg-white/42 px-6 py-8 text-sm text-slate-500 backdrop-blur-md">
                  No additional registration responses were submitted.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card className="rounded-[32px] border-white/70 bg-white/56 shadow-sm backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/78 text-sky-700 shadow-sm backdrop-blur-md">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Primary Contact</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">{registration.participantEmail}</p>
                </div>
              </div>

              <Separator className="my-5" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/75 text-emerald-700 shadow-sm backdrop-blur-md">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">Team Lead</p>
                    <p className="text-sm text-slate-500">{registration.lead.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/75 text-violet-700 shadow-sm backdrop-blur-md">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">Team Size</p>
                    <p className="text-sm text-slate-500">{totalMembers} members listed</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/75 text-amber-700 shadow-sm backdrop-blur-md">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">Track</p>
                    <p className="text-sm text-slate-500">{primaryTrack}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/75 text-slate-700 shadow-sm backdrop-blur-md">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">Created</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(registration.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-white/70 bg-white/56 shadow-sm backdrop-blur-md">
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Quick Snapshot</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Registration Summary</h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-[24px] border border-white/70 bg-white/48 p-4 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Team Name</p>
                  <p className="mt-2 text-base font-semibold text-slate-950">{teamTitle}</p>
                </div>
                <div className="rounded-[24px] border border-white/70 bg-white/48 p-4 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Hackathon</p>
                  <p className="mt-2 text-base font-semibold text-slate-950">{hackathon?.title || '-'}</p>
                </div>
                <div className="rounded-[24px] border border-white/70 bg-white/48 p-4 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Window</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {hackathon
                      ? `${formatDate(hackathon.registrationStart)} to ${formatDate(hackathon.registrationEnd)}`
                      : '-'}
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/70 bg-white/48 p-4 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Program Type</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {hackathon?.participationType === 'INDIVIDUAL' ? 'Individual' : 'Team'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}
