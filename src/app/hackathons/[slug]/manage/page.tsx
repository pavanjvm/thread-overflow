'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  getBrowserHackathonAnalytics,
  readBrowserHackathonBySlug,
  type BrowserHackathon,
  type BrowserHackathonTrackAnalytics,
} from '@/lib/browser-hackathons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  BarChart3,
  Eye,
  LayoutDashboard,
  MousePointerClick,
  PenSquare,
  Settings2,
  Share2,
  UsersRound,
} from 'lucide-react';

const dashboardMenu = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Manage Registrations', icon: UsersRound },
  { label: 'Edit Program', icon: PenSquare },
];

export default function ManageHackathonPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { currentUser } = useAuth();
  const [hackathon, setHackathon] = useState<BrowserHackathon | null>(null);

  useEffect(() => {
    if (!slug) {
      return;
    }

    setHackathon(readBrowserHackathonBySlug(slug));
  }, [slug]);

  if (currentUser?.role !== 'ADMIN') {
    return (
      <Card className="mx-auto max-w-3xl rounded-3xl">
        <CardContent className="space-y-4 p-8 text-center">
          <h1 className="text-2xl font-semibold">Admin access required</h1>
          <p className="text-sm text-muted-foreground">
            This dashboard is available only in the admin preview flow.
          </p>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/hackathons">Back to hackathons</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hackathon) {
    return (
      <Card className="mx-auto max-w-3xl rounded-3xl">
        <CardContent className="space-y-4 p-8 text-center">
          <h1 className="text-2xl font-semibold">Hackathon not found</h1>
          <p className="text-sm text-muted-foreground">
            The browser preview data for this hackathon is not available in the current session.
          </p>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/hackathons">Back to hackathons</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const analytics = getBrowserHackathonAnalytics(hackathon);
  const topTrack = analytics.trackStats[0];

  return (
    <div className="overflow-hidden rounded-[28px] border bg-card shadow-sm">
      <div className="grid min-h-[840px] lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="bg-[#214a7a] p-4 text-white">
          <div className="space-y-2">
            {dashboardMenu.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-medium transition ${
                    item.active ? 'bg-white text-[#1b3559]' : 'text-white/95 hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="space-y-5 bg-[#f8fafc] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 rounded-[24px] bg-white p-6 shadow-sm">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                Hello {currentUser?.name || 'Admin'}!
              </h1>
              <p className="mt-2 max-w-2xl text-base text-muted-foreground">
                Manage and monitor {hackathon.title} with browser-preview analytics from this dashboard.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{hackathon.participationType === 'TEAM' ? 'Team format' : 'Individual format'}</Badge>
              <Button asChild variant="outline">
                <Link href={`/hackathons/${hackathon.slug}`}>Open public page</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.15fr_1.1fr_1.1fr_1.1fr_1.9fr]">
            <MetricCard
              icon={UsersRound}
              title="Complete Registrations"
              value={analytics.totalRegistrations.toString()}
              helper={`Across ${analytics.activeTracks} tracks`}
              featured
            />
            <MetricCard
              icon={Eye}
              title="Total Impressions"
              value={analytics.totalImpressions.toString()}
              helper={`${analytics.completionRate}% conversion`}
            />
            <MetricCard
              icon={BarChart3}
              title="Track Wise Registrations"
              value={analytics.activeTracks.toString()}
              helper={topTrack ? `${topTrack.track} leads` : 'No tracks yet'}
            />
            <MetricCard
              icon={MousePointerClick}
              title="Domains Captured"
              value={analytics.uniqueDomains.toString()}
              helper={`${hackathon.registrationFields.length} form fields`}
            />
            <ShareCard title={hackathon.title} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.9fr_0.9fr]">
            <Card className="rounded-[24px] border-white/70 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>Registration Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <OverviewPill label="Registrations" value={analytics.totalRegistrations.toString()} />
                  <OverviewPill label="Impressions" value={analytics.totalImpressions.toString()} />
                  <OverviewPill label="Conversion" value={`${analytics.completionRate}%`} />
                </div>
                <div className="space-y-4">
                  {analytics.trackStats.map((track) => (
                    <TrackOverviewRow
                      key={track.track}
                      track={track.track}
                      registrations={track.registrations}
                      total={analytics.totalRegistrations}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-white/70 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>Track Wise Registrations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.trackStats.map((track) => (
                  <TrackStatCard key={track.track} track={track} maxRegistrations={analytics.totalRegistrations} />
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-white/70 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <UpdateItem
                  title="Registration window is live"
                  body={`Registration is open from ${hackathon.registrationStart} to ${hackathon.registrationEnd}.`}
                />
                <UpdateItem
                  title="Top demand track"
                  body={topTrack ? `${topTrack.track} is currently leading with ${topTrack.registrations} registrations.` : 'Track performance will appear here.'}
                />
                <UpdateItem
                  title="Form configuration ready"
                  body={`${hackathon.registrationFields.length} participant fields are configured for this hackathon.`}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr]">
            <Card className="rounded-[24px] border-white/70 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>Track Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.trackStats.map((track, index) => (
                  <div key={track.track} className="rounded-2xl border bg-muted/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{track.track}</p>
                        <p className="text-sm text-muted-foreground">{track.impressions} impressions</p>
                      </div>
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>{track.conversionRate}% CVR</Badge>
                    </div>
                    <Progress className="mt-4 h-2.5 bg-secondary/70" value={(track.registrations / analytics.totalRegistrations) * 100} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-white/70 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>Hackathon Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <QuickEditRow label="Registration Deadline" value={hackathon.registrationEnd} />
                <QuickEditRow label="Visibility" value="Browser preview" />
                <QuickEditRow label="Tracks" value={`${hackathon.tracks.length} configured`} />
                <QuickEditRow label="Participation" value={hackathon.participationType === 'TEAM' ? `${hackathon.minTeamSize}-${hackathon.maxTeamSize} members` : 'Individual'} />
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-white/70 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>Registration Form</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hackathon.registrationFields.map((field) => (
                  <div key={field} className="flex items-center justify-between rounded-2xl border px-4 py-3">
                    <span className="font-medium text-foreground">{field}</span>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  helper,
  featured = false,
}: {
  icon: typeof UsersRound;
  title: string;
  value: string;
  helper: string;
  featured?: boolean;
}) {
  return (
    <Card className={`rounded-[24px] border-white/70 shadow-sm ${featured ? 'bg-[#214a7a] text-white' : 'bg-white text-foreground'}`}>
      <CardContent className="space-y-4 p-5">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${featured ? 'bg-white text-[#214a7a]' : 'bg-secondary/80 text-foreground'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className={`text-sm ${featured ? 'text-white/80' : 'text-muted-foreground'}`}>{title}</p>
          <p className="mt-2 text-4xl font-semibold leading-none">{value}</p>
          <p className={`mt-2 text-sm ${featured ? 'text-white/70' : 'text-muted-foreground'}`}>{helper}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ShareCard({ title }: { title: string }) {
  return (
    <Card className="rounded-[24px] border-[#dbeafe] bg-[#dcecff] shadow-sm">
      <CardContent className="flex h-full items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111827] text-white">
            <Share2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-[#1f2937]">Share Opportunity</p>
            <p className="max-w-[220px] text-sm text-[#475569]">
              Promote {title} across social media, messages, or email.
            </p>
          </div>
        </div>
        <Button className="rounded-full bg-[#0f6ad9] hover:bg-[#0b57b4]">Share Now</Button>
      </CardContent>
    </Card>
  );
}

function OverviewPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/30 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function TrackOverviewRow({
  track,
  registrations,
  total,
}: {
  track: string;
  registrations: number;
  total: number;
}) {
  const percentage = total > 0 ? (registrations / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-foreground">{track}</p>
        <p className="text-sm text-muted-foreground">{registrations} registrations</p>
      </div>
      <Progress className="h-2.5 bg-secondary/70" value={percentage} />
    </div>
  );
}

function TrackStatCard({
  track,
  maxRegistrations,
}: {
  track: BrowserHackathonTrackAnalytics;
  maxRegistrations: number;
}) {
  const share = maxRegistrations > 0 ? (track.registrations / maxRegistrations) * 100 : 0;

  return (
    <div className="rounded-2xl border bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-foreground">{track.track}</p>
          <p className="mt-1 text-sm text-muted-foreground">{track.impressions} impressions</p>
        </div>
        <Badge variant="secondary">{track.registrations}</Badge>
      </div>
      <Progress className="mt-4 h-2.5 bg-secondary/70" value={share} />
      <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
        <span>Share of registrations</span>
        <span>{share.toFixed(1)}%</span>
      </div>
    </div>
  );
}

function UpdateItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border bg-muted/20 p-4">
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

function QuickEditRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <div className="flex items-center justify-between gap-4 py-1">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground">{label}</span>
        </div>
        <span className="text-sm text-muted-foreground">{value}</span>
      </div>
      <Separator />
    </>
  );
}
