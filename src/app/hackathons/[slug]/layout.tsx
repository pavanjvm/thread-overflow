'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { hackathons } from '@/lib/mock-data';
import type { BrowserHackathon } from '@/lib/browser-hackathons';
import { getBrowserHackathonStages, readBrowserHackathons } from '@/lib/browser-hackathons';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3,
  CalendarCheck,
  CalendarRange,
  Edit,
  HelpCircle,
  Sparkles,
  Trophy,
  Users2,
} from 'lucide-react';

export default function HackathonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const baseHackathonPath = slug ? `/hackathons/${slug}` : null;
  const { currentUser } = useAuth();
  const hackathon = hackathons.find((item) => item.slug === slug);
  const [browserHackathon, setBrowserHackathon] = useState<BrowserHackathon | null>(null);
  const [browserHackathonChecked, setBrowserHackathonChecked] = useState(false);

  useEffect(() => {
    if (hackathon || !slug) {
      setBrowserHackathonChecked(true);
      return;
    }

    setBrowserHackathon(readBrowserHackathons().find((item) => item.slug === slug) ?? null);
    setBrowserHackathonChecked(true);
  }, [hackathon, slug]);

  if (baseHackathonPath && pathname && pathname !== baseHackathonPath) {
    return <>{children}</>;
  }

  if (!hackathon && !browserHackathonChecked) {
    return <div className="min-h-96 rounded-3xl bg-muted/40" />;
  }

  if (!hackathon && browserHackathon) {
    return <SessionHackathonDetails hackathon={browserHackathon} />;
  }

  if (!hackathon && browserHackathonChecked) {
    notFound();
  }

  const activeHackathon = hackathon;
  if (!activeHackathon) {
    notFound();
  }

  const isClient = currentUser?.role === 'ADMIN';

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border">
        <div className="relative min-h-[320px]">
          <Image
            src={activeHackathon.coverImageUrl}
            alt={`${activeHackathon.title} cover image`}
            fill
            className="object-cover"
            data-ai-hint="hackathon cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/55 to-slate-900/20" />
          <div className="relative z-10 flex min-h-[320px] flex-col justify-between gap-8 px-6 py-8 text-white md:px-10">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-cyan-400/15 text-cyan-100 hover:bg-cyan-400/15">{activeHackathon.status}</Badge>
              <Badge variant="outline" className="border-white/20 text-white">{activeHackathon.format}</Badge>
              <Badge variant="outline" className="border-white/20 text-white">{activeHackathon.theme}</Badge>
            </div>
            <div className="grid gap-8 lg:grid-cols-[1.35fr_0.85fr] lg:items-end">
              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{activeHackathon.title}</h1>
                  <p className="mt-3 max-w-3xl text-lg text-white/80">{activeHackathon.subtitle}</p>
                </div>
                <p className="max-w-3xl text-sm leading-6 text-white/70">{activeHackathon.overview}</p>
                {isClient ? (
                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="secondary">
                      <Link href={`/hackathons/${activeHackathon.slug}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit program
                      </Link>
                    </Button>
                    <Button asChild className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                      <Link href={`/hackathons/${activeHackathon.slug}#client-console`}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Open client console
                      </Link>
                    </Button>
                  </div>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/60">
                    <CalendarRange className="h-3.5 w-3.5" />
                    Program window
                  </div>
                  <p className="mt-2 text-lg font-semibold">{activeHackathon.eventDates.start} to {activeHackathon.prizeAnnouncement.end}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/60">
                    <Sparkles className="h-3.5 w-3.5" />
                    Active stage
                  </div>
                  <p className="mt-2 text-lg font-semibold">{activeHackathon.stages.find((stage) => stage.status === 'ACTIVE')?.name ?? 'Showcase prep'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/60">
                    <Users2 className="h-3.5 w-3.5" />
                    Sponsor
                  </div>
                  <p className="mt-2 text-lg font-semibold">{activeHackathon.clientWorkspace.sponsor}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {children}
    </div>
  );
}

function SessionHackathonDetails({ hackathon }: { hackathon: BrowserHackathon }) {
  const { currentUser } = useAuth();
  const teamSize = hackathon.participationType === 'TEAM'
    ? `${hackathon.minTeamSize} - ${hackathon.maxTeamSize} Members`
    : 'Individual';
  const stages = getBrowserHackathonStages(hackathon);
  const timelineItems = stages.map((stage, index) => {
    const previousStage = index > 0 ? stages[index - 1] : null;
    const startAt = stage.startAt || (stage.type === 'REGISTRATION' ? hackathon.registrationStart : hackathon.registrationEnd);
    const endAt = stage.endAt || (stage.type === 'REGISTRATION' ? hackathon.registrationEnd : hackathon.registrationEnd);

    if (stage.type === 'REGISTRATION') {
      return {
        start: startAt,
        end: endAt,
        title: stage.name,
        description: hackathon.participationType === 'TEAM'
          ? `Teams can register with ${hackathon.minTeamSize}-${hackathon.maxTeamSize} members during this stage.`
          : 'Participants can register individually during this stage.',
        action: stage.code,
        live: isStageLive(startAt, endAt),
      };
    }

    const criteriaCount = stage.evaluationCriteria?.length ?? 0;
    return {
      start: startAt,
      end: endAt,
      title: stage.name,
      description: criteriaCount > 0
        ? `${criteriaCount} evaluation criteria configured${previousStage ? ` after ${previousStage.name}` : ''}.`
        : `Submission round configured${previousStage ? ` after ${previousStage.name}` : ''}.`,
      action: stage.code,
      live: isStageLive(startAt, endAt),
    };
  });
  const faqs = [
    {
      question: 'Who can participate?',
      answer: hackathon.participationType === 'TEAM'
        ? `Teams with ${teamSize.toLowerCase()} can participate.`
        : 'Individual participants can register and submit their work.',
    },
    ...(hackathon.tracks.length > 0 ? [{
      question: 'How do participants choose a track?',
      answer: `Participants select one of the configured tracks: ${hackathon.tracks.join(', ')}.`,
    }] : []),
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border bg-slate-950">
        <div className="relative min-h-[320px] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.45),transparent_28%),radial-gradient(circle_at_82%_35%,rgba(236,72,153,0.38),transparent_24%),linear-gradient(135deg,#0f172a,#111827_45%,#082f49)]">
          {hackathon.coverImageDataUrl && (
            <img
              src={hackathon.coverImageDataUrl}
              alt={`${hackathon.title} cover`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />
          <div className="relative z-10 flex min-h-[320px] items-center justify-center px-6 text-center text-white">
            <div>
              <p className="text-sm uppercase tracking-[0.45em] text-cyan-200">Hackathon</p>
              <h1 className="mt-5 max-w-5xl text-5xl font-black tracking-tight md:text-7xl">{hackathon.title}</h1>
              <p className="mt-4 text-xl uppercase tracking-[0.18em] text-white/75">
                Build. Compete. Submit.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <Card className="overflow-hidden rounded-t-3xl rounded-b-none border-t-4 border-t-primary shadow-none">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="max-w-xl text-4xl font-bold tracking-tight">{hackathon.title}</h2>
                </div>
                {hackathon.logoDataUrl ? (
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border bg-white p-2 shadow-sm">
                    <img
                      src={hackathon.logoDataUrl}
                      alt={`${hackathon.title} logo`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <InfoTile icon={Users2} label="Team Size" value={teamSize} />
                <InfoTile icon={CalendarCheck} label="Registration Opens" value={hackathon.registrationStart} />
                <InfoTile icon={CalendarRange} label="Registration Deadline" value={hackathon.registrationEnd} />
              </div>

              {hackathon.prizePool ? (
                <div className="mt-8 rounded-2xl bg-secondary/60 p-5">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Prize preview</p>
                      <p className="text-2xl font-bold text-foreground">
                        Prizes worth {hackathon.prizePool}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <section className="border-x border-b bg-white pb-10">
            <div className="relative px-5 py-8">
              <div className="absolute left-0 top-8 h-7 w-1 rounded-r-full bg-accent" />
              <h2 className="text-2xl font-bold tracking-tight text-neutral-800">Stages and Timelines</h2>
            </div>
            <div className="rounds">
              {timelineItems.map((item, index) => (
                <TimelineItem
                  key={item.title}
                  {...item}
                  isFirst={index === 0}
                  isLast={index === timelineItems.length - 1}
                />
              ))}
            </div>
          </section>

          <Card className="mt-6 rounded-3xl shadow-none">
            <CardHeader>
              <CardTitle>About Hackathon</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none text-muted-foreground [&_img]:my-4 [&_img]:max-h-96 [&_img]:rounded-xl [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
                dangerouslySetInnerHTML={{ __html: hackathon.overviewHtml }}
              />
            </CardContent>
          </Card>

          {hackathon.prizePool ? (
            <Card className="mt-6 rounded-3xl shadow-none">
              <CardHeader>
                <CardTitle>Prize</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl border bg-secondary/60 p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-amber-500 shadow-sm">
                      <Trophy className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total rewards</p>
                      <p className="text-3xl font-bold text-foreground">{hackathon.prizePool}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card className="mt-6 rounded-3xl shadow-none">
            <CardHeader>
              <CardTitle>FAQs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-2xl border p-4">
                  <div className="flex gap-3">
                    <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <div>
                      <p className="font-semibold">{faq.question}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="rounded-3xl shadow-none">
            <CardContent className="space-y-5 p-5">
              <div className="rounded-2xl border p-4">
                <p className="font-semibold">Participant</p>
                <p className="text-sm text-muted-foreground">Preview mode</p>
              </div>
              {currentUser?.role === 'ADMIN' ? (
                <Button asChild className="h-12 w-full rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/85">
                  <Link href={`/hackathons/${hackathon.slug}/manage`}>
                    Manage Hackathon
                  </Link>
                </Button>
              ) : null}
              <Button asChild className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href={`/hackathons/${hackathon.slug}/register`}>
                  Register Now
                </Link>
              </Button>
              <div className="flex items-center justify-center gap-2 text-sm font-medium">
                <Users2 className="h-4 w-4 text-accent" />
                {hackathon.registrationCount ?? 0} Registered
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-2xl bg-secondary/60 shadow-none">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-foreground">Referral preview</p>
              <p className="mt-1 text-sm text-muted-foreground">Participants can share this hackathon once registration is connected.</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border bg-muted/30 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/70 text-foreground shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-1 text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

function TimelineItem({
  start,
  end,
  title,
  description,
  action,
  live = false,
  isFirst,
  isLast,
}: {
  start: string;
  end: string;
  title: string;
  description: string;
  action?: string;
  live?: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  const { day, month } = getTimelineDateParts(start);
  const startLabel = formatTimelineLabel(start);
  const endLabel = formatTimelineLabel(end);

  return (
    <div className="blue-800-border-before list relative min-h-[154px] pl-[82px] pr-5">
      {!isFirst && (
        <div className="absolute left-[31px] top-0 h-4 border-l-2 border-dotted border-accent" />
      )}
      {!isLast && (
        <div className="absolute left-[31px] top-[50px] bottom-0 border-l-2 border-dotted border-accent" />
      )}
      <div className="count blue-100 absolute left-[15px] top-4 z-10 flex h-[34px] w-[34px] flex-col items-center justify-center gap-px overflow-hidden rounded-lg bg-secondary/80 p-0.5 text-center text-[13px] font-semibold">
        <span className="count_top blue-800 block text-[13px] font-semibold leading-[14px] text-foreground">{day}</span>
        <span className="count_bottom block text-[10px] font-medium uppercase leading-[11px] text-neutral-600">{month}</span>
      </div>

      <div className="round-wrapper-container border-b pb-8 pt-4">
        <div className="date flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] font-medium text-neutral-800">
          <span>{startLabel}</span>
          <span className="text-neutral-500">--&gt; {endLabel}</span>
        </div>

        <div className="round-wrapper mt-4 rounded-md bg-white">
          <div className="title flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold leading-6 text-neutral-900">{title}</h3>
              {live ? (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  Live
                </div>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {action && (
                <Button variant="ghost" size="sm" className="h-8 rounded-md px-4 text-accent hover:bg-accent/10">
                  {action}
                </Button>
              )}
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-neutral-700">{description}</p>
        </div>
      </div>
    </div>
  );
}

function isStageLive(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const now = new Date();

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return false;
  }

  return now >= start && now <= end;
}

function formatTimelineLabel(value: string) {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  return value;
}

function getTimelineDateParts(value: string) {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      day: parsed.toLocaleDateString('en-US', { day: '2-digit' }),
      month: parsed.toLocaleDateString('en-US', { month: 'short' }),
    };
  }

  const match = value.match(/(\d{1,2})\s+([A-Za-z]{3})/);

  return {
    day: match?.[1] ?? '21',
    month: match?.[2] ?? 'Jul',
  };
}
