'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  getTextFromHtml,
  getBrowserHackathonAnalytics,
  readBrowserHackathonBySlug,
  saveBrowserHackathon,
  type BrowserHackathon,
  type BrowserHackathonTrackAnalytics,
} from '@/lib/browser-hackathons';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  Filter,
  FileUp,
  Gift,
  Info,
  LayoutDashboard,
  Laptop,
  ListChecks,
  Mail,
  CalendarDays,
  MapPin,
  Minus,
  MoreVertical,
  MousePointerClick,
  Settings,
  PenSquare,
  Plus,
  Search,
  Settings2,
  Share2,
  Upload,
  UsersRound,
  X,
} from 'lucide-react';

type ManageSection = 'dashboard' | 'registrations' | 'edit';
type StageType = 'REGISTRATION' | 'SUBMISSION';
type RegistrationFilter = 'ALL' | 'COMPLETE' | 'INCOMPLETE';
type SubmissionFilter = 'ALL' | 'IN_PROGRESS' | 'SHORTLISTED' | 'REJECTED';
type SubmissionStatus = Exclude<SubmissionFilter, 'ALL'>;
type RegistrationStatus = Exclude<RegistrationFilter, 'ALL'>;

type StageDefinition = {
  id: string;
  name: string;
  code: string;
  type: StageType;
  sourceStageId?: string;
};

type StageEntry = {
  status: SubmissionStatus;
  submitted: boolean;
  score: string;
  panel: string;
};

type TeamRecord = {
  id: string;
  participantName: string;
  email: string;
  company: string;
  registrationStatus: RegistrationStatus;
  stageEntries: Record<string, StageEntry>;
};

type RoundDraft = {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  eliminationMode: 'ELIMINATION' | 'AUTO_ADVANCE';
  roundType: 'OFFLINE' | 'IN_OFFICE' | 'OTHER' | 'SUBMISSION';
  submissionFieldType: 'FILE';
  submissionFieldRequired: boolean;
  submissionFieldLabel: string;
  submissionFieldHint: string;
  submissionAllowedTypes: string[];
  submissionMaxSizeMb: number;
  evaluationEnabled: boolean;
  evaluationMaxScore: number;
  evaluationButtons: {
    shortlist: boolean;
    reject: boolean;
    onHold: boolean;
    noShow: boolean;
  };
};

type EditProgramForm = {
  title: string;
  organizationName: string;
  prizePool: string;
  logoDataUrl: string;
  overview: string;
  registrationStart: string;
  registrationEnd: string;
  participationType: BrowserHackathon['participationType'];
  minTeamSize: string;
  maxTeamSize: string;
  tracks: string;
  registrationFields: string;
};

const registrationFilters: Array<{ value: RegistrationFilter; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'COMPLETE', label: 'Complete' },
  { value: 'INCOMPLETE', label: 'Incomplete' },
];

const submissionFilters: Array<{ value: SubmissionFilter; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'REJECTED', label: 'Rejected' },
];

const dashboardMenu: Array<{
  key: ManageSection;
  label: string;
  icon: typeof UsersRound;
}> = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'registrations', label: 'Manage Registrations', icon: UsersRound },
  { key: 'edit', label: 'Edit Program', icon: PenSquare },
];

const editProgramSections = [
  { id: 'basic', label: 'Basic details', icon: PenSquare },
  { id: 'registration', label: 'Registration Settings', icon: Settings },
  { id: 'rounds', label: 'Rounds & Stages', icon: ListChecks },
  { id: 'prizes', label: 'Prizes', icon: Gift },
] as const;

const allowedSubmissionTypes = [
  'txt', 'doc', 'docx', 'csv', 'pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp',
  'tiff', 'tif', 'mp3', 'wav', 'aac', 'mp4', 'avi', 'mkv', 'mov', 'xlsx', 'pptx', 'zip',
] as const;

export default function ManageHackathonPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { currentUser } = useAuth();
  const [hackathon, setHackathon] = useState<BrowserHackathon | null>(null);
  const [activeSection, setActiveSection] = useState<ManageSection>('registrations');
  const [sidebarPinnedOpen, setSidebarPinnedOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

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

  const sidebarExpanded = sidebarPinnedOpen || sidebarHovered;

  return (
    <div className="overflow-hidden rounded-[28px] border bg-card shadow-sm">
      <div className="grid min-h-[840px] grid-cols-[auto_minmax(0,1fr)]">
        <div className="relative overflow-visible">
          <aside
            className={cn(
              'h-full bg-[#214a7a] text-white transition-[width] duration-300 ease-out',
              sidebarExpanded ? 'w-[260px]' : 'w-[76px]'
            )}
            onMouseEnter={() => setSidebarHovered(true)}
            onMouseLeave={() => setSidebarHovered(false)}
          >
            <div className="space-y-2 p-4">
              {dashboardMenu.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    className={cn(
                      'flex w-full items-center rounded-2xl px-4 py-3 text-left text-[15px] font-medium transition',
                      sidebarExpanded ? 'justify-start gap-3' : 'justify-center',
                      active ? 'bg-white text-[#1b3559]' : 'text-white/95 hover:bg-white/10'
                    )}
                    onClick={() => setActiveSection(item.key)}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {sidebarExpanded ? <span className="truncate">{item.label}</span> : null}
                  </button>
                );
              })}
            </div>
          </aside>

          <button
            type="button"
            aria-label={sidebarExpanded ? 'Collapse manage menu' : 'Expand manage menu'}
            className="absolute left-full top-8 z-10 -translate-x-1/2 rounded-full border-4 border-[#f8fafc] bg-[#2f5f98] p-1.5 text-white shadow-lg transition hover:bg-[#244f82]"
            onClick={() => setSidebarPinnedOpen((current) => !current)}
          >
            {sidebarExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        <section className="bg-[#f8fafc] p-6">
          {activeSection === 'dashboard' ? <DashboardView hackathon={hackathon} currentUserName={currentUser?.name} /> : null}
          {activeSection === 'registrations' ? <ManageRegistrationsTab hackathon={hackathon} /> : null}
          {activeSection === 'edit' ? <EditProgramView hackathon={hackathon} onHackathonChange={setHackathon} /> : null}
        </section>
      </div>
    </div>
  );
}

function DashboardView({
  hackathon,
  currentUserName,
}: {
  hackathon: BrowserHackathon;
  currentUserName?: string | null;
}) {
  const analytics = getBrowserHackathonAnalytics(hackathon);
  const topTrack = analytics.trackStats[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-[24px] bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Hello {currentUserName || 'Admin'}!
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
    </div>
  );
}

function ManageRegistrationsTab({ hackathon }: { hackathon: BrowserHackathon }) {
  const { toast } = useToast();
  const [stages, setStages] = useState<StageDefinition[]>([]);
  const [selectedStageId, setSelectedStageId] = useState('');
  const [records, setRecords] = useState<TeamRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [registrationFilter, setRegistrationFilter] = useState<RegistrationFilter>('ALL');
  const [submissionFilter, setSubmissionFilter] = useState<SubmissionFilter>('IN_PROGRESS');
  const [stageInsertMode, setStageInsertMode] = useState(false);
  const [roundDrawerOpen, setRoundDrawerOpen] = useState(false);
  const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null);
  const [roundDraft, setRoundDraft] = useState<RoundDraft>(() => createDefaultRoundDraft());

  useEffect(() => {
    const baseStages = createInitialStages();
    setStages(baseStages);
    setSelectedStageId(baseStages[0]?.id ?? '');
    setRecords(createTeamRecords(hackathon, baseStages));
  }, [hackathon]);

  const selectedStage = useMemo(
    () => stages.find((stage) => stage.id === selectedStageId) ?? stages[0] ?? null,
    [selectedStageId, stages]
  );

  const registrationCounts = useMemo(
    () => ({
      ALL: records.length,
      COMPLETE: records.filter((record) => record.registrationStatus === 'COMPLETE').length,
      INCOMPLETE: records.filter((record) => record.registrationStatus === 'INCOMPLETE').length,
    }),
    [records]
  );

  const submissionCounts = useMemo(() => {
    if (!selectedStage || selectedStage.type !== 'SUBMISSION') {
      return { ALL: 0, IN_PROGRESS: 0, SHORTLISTED: 0, REJECTED: 0 };
    }

    return {
      ALL: records.length,
      IN_PROGRESS: records.filter((record) => record.stageEntries[selectedStage.id]?.status === 'IN_PROGRESS').length,
      SHORTLISTED: records.filter((record) => record.stageEntries[selectedStage.id]?.status === 'SHORTLISTED').length,
      REJECTED: records.filter((record) => record.stageEntries[selectedStage.id]?.status === 'REJECTED').length,
    };
  }, [records, selectedStage]);

  const visibleRecords = useMemo(() => {
    if (!selectedStage) {
      return [];
    }

    return records.filter((record) => {
      const matchesSearch = searchQuery.trim() === ''
        || [record.participantName, record.email, record.company]
          .some((value) => value.toLowerCase().includes(searchQuery.trim().toLowerCase()));

      if (!matchesSearch) {
        return false;
      }

      if (selectedStage.type === 'REGISTRATION') {
        return registrationFilter === 'ALL' || record.registrationStatus === registrationFilter;
      }

      const entry = record.stageEntries[selectedStage.id];
      return submissionFilter === 'ALL' || entry?.status === submissionFilter;
    });
  }, [records, registrationFilter, searchQuery, selectedStage, submissionFilter]);

  if (!selectedStage) {
    return null;
  }

  const filters = selectedStage.type === 'REGISTRATION'
    ? registrationFilters.map((filter) => ({
      ...filter,
      count: registrationCounts[filter.value],
      active: registrationFilter === filter.value,
      onClick: () => setRegistrationFilter(filter.value),
    }))
    : submissionFilters.map((filter) => ({
      ...filter,
      count: submissionCounts[filter.value],
      active: submissionFilter === filter.value,
      onClick: () => setSubmissionFilter(filter.value),
    }));

  const actionButtons = selectedStage.type === 'REGISTRATION'
    ? [
      { label: 'Upload Registrations', icon: Upload, onClick: () => handleToastAction('Upload Registrations', selectedStage.name, toast) },
      { label: 'Download Registrations', icon: Download, onClick: () => downloadRegistrations(hackathon.slug, selectedStage.code, visibleRecords, toast) },
      { label: 'Email', icon: Mail, onClick: () => handleToastAction('Email', selectedStage.name, toast) },
      { label: 'Certificate', icon: Award, onClick: () => handleToastAction('Certificate', selectedStage.name, toast) },
    ]
    : [
      { label: 'Email', icon: Mail, onClick: () => handleToastAction('Email', selectedStage.name, toast) },
      { label: 'Certificate', icon: Award, onClick: () => handleToastAction('Certificate', selectedStage.name, toast) },
      { label: 'Download Profiles', icon: Download, onClick: () => downloadProfiles(hackathon.slug, selectedStage.code, visibleRecords, toast) },
      { label: 'Submissions', icon: Download, onClick: () => downloadSubmissions(hackathon.slug, selectedStage.id, selectedStage.code, visibleRecords, toast) },
      { label: 'Evaluate', icon: CheckCircle2, onClick: () => handleToastAction('Evaluate', selectedStage.name, toast) },
      { label: 'Declare Result', icon: Award, onClick: () => handleToastAction('Declare Result', selectedStage.name, toast) },
    ];

  const handleOpenRoundDrawer = (index: number) => {
    setInsertAfterIndex(index);
    setRoundDraft(createDefaultRoundDraft(stages.filter((stage) => stage.type === 'SUBMISSION').length + 1));
    setRoundDrawerOpen(true);
  };

  const handleCreateRound = () => {
    if (insertAfterIndex === null) {
      return;
    }

    const nextStages = insertSubmissionStageAt(stages, insertAfterIndex, roundDraft);
    const insertedStage = nextStages[insertAfterIndex + 1];

    setStages(nextStages);
    setSelectedStageId(insertedStage.id);
    setSubmissionFilter('IN_PROGRESS');
    setStageInsertMode(false);
    setRoundDrawerOpen(false);
    setInsertAfterIndex(null);
    setRecords((current) => mergeRecordsWithStages(current, nextStages));
    toast({
      title: 'Round added',
      description: `${insertedStage.name} is now available in Manage Registrations.`,
    });
  };

  return (
    <div className="overflow-hidden rounded-[24px] border bg-white shadow-sm">
      <Sheet open={roundDrawerOpen} onOpenChange={setRoundDrawerOpen}>
      <div className="grid min-h-[780px] lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-r bg-[#fbfbfc] p-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h1 className="text-[2rem] font-semibold tracking-tight text-slate-900">Stages</h1>
              <p className="text-sm text-slate-500">Manage registration workflow</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-full"
              onClick={() => setStageInsertMode((current) => !current)}
            >
              {stageInsertMode ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              <span className="sr-only">{stageInsertMode ? 'Close add stage' : 'Add stage'}</span>
            </Button>
          </div>

          <div className="mt-4 space-y-5">
            {stages.map((stage, index) => {
              const active = selectedStage.id === stage.id;

              return (
                <div key={stage.id} className="relative">
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-start gap-3 rounded-[18px] border bg-white px-4 py-4 text-left shadow-sm transition',
                      active ? 'border-[#2563eb] ring-1 ring-[#2563eb]/20' : 'border-slate-200 hover:border-slate-300'
                    )}
                    onClick={() => {
                      setSelectedStageId(stage.id);
                      if (stage.type === 'REGISTRATION') {
                        setRegistrationFilter('ALL');
                      } else {
                        setSubmissionFilter('IN_PROGRESS');
                      }
                    }}
                  >
                    <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-emerald-300 bg-emerald-50">
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-md border px-1.5 py-0.5 font-semibold uppercase tracking-wide">
                          {stage.code}
                        </span>
                        <span className="truncate uppercase tracking-wide">
                          {stage.type === 'REGISTRATION' ? 'Registration' : 'Submissions Through Unstop'}
                        </span>
                      </div>
                      <p className="mt-2 text-xl font-semibold leading-6 text-slate-900">{stage.name}</p>
                    </div>
                    <MoreVertical className="mt-1 h-4 w-4 text-slate-400" />
                  </button>
                  {stageInsertMode ? (
                    <button
                      type="button"
                      className="mt-4 flex w-full items-center justify-center rounded-full bg-[#dcebfb] px-4 py-3 text-sm font-semibold text-[#1463ff] transition hover:bg-[#cfe3fb]"
                      onClick={() => handleOpenRoundDrawer(index)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Round Here
                    </button>
                  ) : index < stages.length - 1 ? (
                    <div className="ml-6 mt-2 h-6 w-px bg-slate-300" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </aside>

        <section className="bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b px-5 pt-4">
            <div className="flex flex-wrap gap-8">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={cn(
                    'border-b-2 px-2 pb-4 text-lg font-semibold transition',
                    filter.active ? 'border-[#1463ff] text-[#1463ff]' : 'border-transparent text-slate-500'
                  )}
                  onClick={filter.onClick}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            <Button variant="outline" className="mb-3 h-11 rounded-xl px-4 text-base">
              Credit Balance
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4 px-5 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full max-w-[420px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="h-11 rounded-xl border-slate-300 pl-11 text-base"
                    placeholder="Search here"
                  />
                </div>
                <Button variant="outline" className="h-11 rounded-xl px-4 text-base">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-medium text-slate-700">
                {actionButtons.map((action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.label}
                      type="button"
                      className="inline-flex items-center gap-2 transition hover:text-slate-900"
                      onClick={action.onClick}
                    >
                      <Icon className="h-4 w-4" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="overflow-hidden rounded-[18px] border border-slate-200">
              <div
                className={cn(
                  'grid items-center bg-[#eef4fb] px-4 py-3 text-sm font-semibold text-slate-700',
                  selectedStage.type === 'REGISTRATION'
                    ? 'grid-cols-[64px_minmax(260px,1.6fr)_164px_250px]'
                    : 'grid-cols-[64px_minmax(260px,1.5fr)_144px_160px_96px_250px]'
                )}
              >
                <div>#</div>
                <div>{hackathon.participationType === 'TEAM' ? '1 TEAMS / PARTICIPANTS' : '1 PARTICIPANT'}</div>
                {selectedStage.type === 'SUBMISSION' ? <div>ROUND PANEL</div> : null}
                <div>{selectedStage.type === 'REGISTRATION' ? 'REG. STATUS' : 'STATUS'}</div>
                {selectedStage.type === 'SUBMISSION' ? <div>SCORE</div> : null}
                <div>ACTION / STATUS</div>
              </div>

              {visibleRecords.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-slate-500">
                  No participants match the current filters.
                </div>
              ) : (
                visibleRecords.map((record, index) => {
                  const stageEntry = record.stageEntries[selectedStage.id];

                  return (
                    <div
                      key={record.id}
                      className={cn(
                        'grid items-center border-t border-slate-200 px-4 py-4',
                        selectedStage.type === 'REGISTRATION'
                          ? 'grid-cols-[64px_minmax(260px,1.6fr)_164px_250px]'
                          : 'grid-cols-[64px_minmax(260px,1.5fr)_144px_160px_96px_250px]'
                      )}
                    >
                      <div className="text-lg font-semibold text-slate-800">{index + 1}</div>

                      <div className="flex items-center gap-4 pr-4">
                        <AvatarChip name={record.participantName} />
                        <div className="min-w-0">
                          <p className="truncate text-[1.3rem] font-semibold text-slate-900">{record.participantName}</p>
                          <p className="truncate text-sm text-slate-500">{record.email}</p>
                          <p className="truncate text-base text-slate-600">{record.company}</p>
                        </div>
                      </div>

                      {selectedStage.type === 'SUBMISSION' ? (
                        <div>
                          <div className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-dashed border-slate-300 px-4 text-sm font-medium text-slate-600">
                            {stageEntry?.panel ?? '--'}
                          </div>
                        </div>
                      ) : null}

                      <div>
                        {selectedStage.type === 'REGISTRATION' ? (
                          <StatusPill
                            tone={record.registrationStatus === 'COMPLETE' ? 'success' : 'warning'}
                            label={record.registrationStatus === 'COMPLETE' ? 'Complete' : 'Incomplete'}
                          />
                        ) : stageEntry ? (
                          <StatusPill tone={getSubmissionTone(stageEntry)} label={getSubmissionStatusLabel(stageEntry)} />
                        ) : (
                          <StatusPill tone="neutral" label="No submission" />
                        )}
                      </div>

                      {selectedStage.type === 'SUBMISSION' ? (
                        <div className="text-lg font-semibold text-slate-700">{stageEntry?.score ?? '--'}</div>
                      ) : null}

                      <div className="space-y-3">
                        {selectedStage.type === 'REGISTRATION' ? (
                          <div className="flex items-center gap-3">
                            <ActionIconButton
                              label="Email participant"
                              onClick={() => handleToastAction(`Email ${record.participantName}`, selectedStage.name, toast)}
                            >
                              <Mail className="h-4 w-4" />
                            </ActionIconButton>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <ActionIconButton
                              label="Reject submission"
                              disabled={!stageEntry?.submitted}
                              className="border-red-300 text-red-500 hover:bg-red-50"
                              onClick={() => {
                                if (!stageEntry?.submitted) {
                                  return;
                                }

                                setRecords((current) => updateSubmissionStatus(current, selectedStage.id, record.id, 'REJECTED'));
                                toast({
                                  title: 'Submission rejected',
                                  description: `${record.participantName} was marked rejected in ${selectedStage.name}.`,
                                });
                              }}
                            >
                              <X className="h-4 w-4" />
                            </ActionIconButton>
                            <ActionIconButton
                              label="Approve submission"
                              disabled={!stageEntry?.submitted}
                              className="border-blue-300 text-blue-500 hover:bg-blue-50"
                              onClick={() => {
                                if (!stageEntry?.submitted) {
                                  return;
                                }

                                setRecords((current) => updateSubmissionStatus(current, selectedStage.id, record.id, 'SHORTLISTED'));
                                toast({
                                  title: 'Submission approved',
                                  description: `${record.participantName} was shortlisted in ${selectedStage.name}.`,
                                });
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </ActionIconButton>
                            <ActionIconButton
                              label="Download submission"
                              disabled={!stageEntry?.submitted}
                              onClick={() => {
                                if (!stageEntry?.submitted) {
                                  return;
                                }

                                downloadTextFile(
                                  `${record.participantName.toLowerCase().replace(/\s+/g, '-')}-${selectedStage.code.toLowerCase()}-submission.txt`,
                                  [
                                    `Participant: ${record.participantName}`,
                                    `Email: ${record.email}`,
                                    `Company: ${record.company}`,
                                    `Stage: ${selectedStage.name}`,
                                    `Panel: ${stageEntry.panel}`,
                                    `Status: ${getSubmissionStatusLabel(stageEntry)}`,
                                  ].join('\n')
                                );
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </ActionIconButton>
                            <ActionIconButton
                              label="Email participant"
                              onClick={() => handleToastAction(`Email ${record.participantName}`, selectedStage.name, toast)}
                            >
                              <Mail className="h-4 w-4" />
                            </ActionIconButton>
                          </div>
                        )}
                        <StageTransition stage={selectedStage} stages={stages} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-[760px]">
        <div className="flex min-h-full flex-col bg-white">
          <div className="border-b px-6 pt-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="h-auto w-full justify-start gap-6 rounded-none bg-transparent p-0 text-base">
                <TabsTrigger value="basic" className="rounded-none border-b-[3px] border-transparent px-0 py-4 text-base data-[state=active]:border-[#173f73] data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                  Basic Info
                </TabsTrigger>
                <TabsTrigger
                  value="platform"
                  disabled={roundDraft.roundType !== 'SUBMISSION'}
                  className="rounded-none border-b-[3px] border-transparent px-0 py-4 text-base data-[state=active]:border-[#173f73] data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Platform Settings
                </TabsTrigger>
                <TabsTrigger
                  value="evaluation"
                  disabled={roundDraft.roundType !== 'SUBMISSION'}
                  className="rounded-none border-b-[3px] border-transparent px-0 py-4 text-base data-[state=active]:border-[#173f73] data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Evaluation
                </TabsTrigger>
                <TabsTrigger value="declare" disabled className="rounded-none border-b-[3px] border-transparent px-0 py-4 text-base text-slate-400 data-[state=active]:border-[#173f73] data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                  Declare Result
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-0 px-6 py-6">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-800">Round Type</Label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {([
                        { value: 'OFFLINE', label: 'Offline', icon: MapPin },
                        { value: 'IN_OFFICE', label: 'In-Office', icon: Building2 },
                        { value: 'OTHER', label: 'Other', icon: Laptop },
                        { value: 'SUBMISSION', label: 'Submission', icon: FileUp },
                      ] as const).map((option) => {
                        const Icon = option.icon;
                        const active = roundDraft.roundType === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            className={cn(
                              'flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition',
                              active ? 'border-[#1463ff] bg-[#eef5ff] text-slate-900' : 'border-slate-200 hover:border-slate-300'
                            )}
                            onClick={() => setRoundDraft((current) => ({ ...current, roundType: option.value }))}
                          >
                            <div className={cn('rounded-xl p-2', active ? 'bg-[#1463ff] text-white' : 'bg-slate-100 text-slate-600')}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-semibold">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <FormField label="Round Title" required>
                    <Input
                      value={roundDraft.title}
                      onChange={(event) => setRoundDraft((current) => ({ ...current, title: event.target.value }))}
                      className="h-12 rounded-xl"
                    />
                  </FormField>

                  <FormField label="Description" required>
                    <Textarea
                      value={roundDraft.description}
                      onChange={(event) => setRoundDraft((current) => ({ ...current, description: event.target.value }))}
                      className="min-h-[120px] rounded-xl"
                    />
                  </FormField>

                  <div className="grid gap-5 md:grid-cols-2">
                    <FormField label="Round Start Date & Time" required>
                      <div className="relative">
                        <Input
                          type="datetime-local"
                          value={roundDraft.startAt}
                          onChange={(event) => setRoundDraft((current) => ({ ...current, startAt: event.target.value }))}
                          className="h-12 rounded-xl pr-12"
                        />
                        <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      </div>
                    </FormField>

                    <FormField label="Round End Date & Time" required>
                      <div className="relative">
                        <Input
                          type="datetime-local"
                          value={roundDraft.endAt}
                          onChange={(event) => setRoundDraft((current) => ({ ...current, endAt: event.target.value }))}
                          className="h-12 rounded-xl pr-12"
                        />
                        <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      </div>
                    </FormField>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-5">
                    <RadioGroup
                      value={roundDraft.eliminationMode}
                      onValueChange={(value) => setRoundDraft((current) => ({ ...current, eliminationMode: value as RoundDraft['eliminationMode'] }))}
                      className="gap-4"
                    >
                      <div className="border-b border-dashed pb-4">
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="ELIMINATION" id="elimination" className="mt-1 border-[#173f73] text-[#1463ff]" />
                          <Label htmlFor="elimination" className="text-base font-medium leading-7 text-slate-700">
                            Yes. It's an eliminator as I'd like to shortlist participants for the next round.
                          </Label>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="AUTO_ADVANCE" id="auto-advance" className="mt-1 border-[#173f73] text-[#1463ff]" />
                        <Label htmlFor="auto-advance" className="text-base font-medium leading-7 text-[#1463ff]">
                          No. All participants will move to the next round automatically.
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="platform" className="mt-0 px-6 py-6">
                {roundDraft.roundType === 'SUBMISSION' ? (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-base font-semibold text-[#173f73]">Create Submission form:</p>

                      <div className="mt-5 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-4 border-b px-4 py-4">
                          <div className="flex min-w-[240px] items-center gap-3 border-r pr-4">
                            <div className="rounded-xl bg-blue-50 p-2 text-[#1463ff]">
                              <FileUp className="h-4 w-4" />
                            </div>
                            <span className="text-base font-medium text-slate-700">File</span>
                            <ChevronDown className="ml-auto h-4 w-4 text-slate-500" />
                          </div>
                          <div className="ml-auto flex items-center gap-6">
                            <div className="flex items-center gap-3">
                              <span className="text-base font-medium text-slate-600">Required</span>
                              <Switch
                                checked={roundDraft.submissionFieldRequired}
                                onCheckedChange={(checked) => setRoundDraft((current) => ({ ...current, submissionFieldRequired: checked }))}
                              />
                            </div>
                            <div className="flex items-center gap-3 border-l pl-6 text-slate-700">
                              <Copy className="h-5 w-5" />
                              <Plus className="h-5 w-5" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-5 p-4">
                          <FormField label="Field Label" required>
                            <Input
                              value={roundDraft.submissionFieldLabel}
                              onChange={(event) => setRoundDraft((current) => ({ ...current, submissionFieldLabel: event.target.value }))}
                              className="h-12 rounded-xl"
                            />
                          </FormField>

                          <FormField label="Remark/Hint">
                            <Input
                              value={roundDraft.submissionFieldHint}
                              onChange={(event) => setRoundDraft((current) => ({ ...current, submissionFieldHint: event.target.value }))}
                              className="h-12 rounded-xl"
                            />
                          </FormField>

                          <div>
                            <p className="text-base leading-7 text-slate-600">
                              Enter the file types in lowercase, separated by commas, without spaces or periods (e.g., pdf,jpg,png). By default, all formats are accepted.
                            </p>
                            <div className="mt-3 rounded-2xl border border-slate-200 p-4">
                              <div className="flex flex-wrap gap-3">
                                {allowedSubmissionTypes.map((type) => {
                                  const selected = roundDraft.submissionAllowedTypes.includes(type);

                                  return (
                                    <button
                                      key={type}
                                      type="button"
                                      className={cn(
                                        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                                        selected ? 'bg-[#1463ff] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                      )}
                                      onClick={() => setRoundDraft((current) => ({
                                        ...current,
                                        submissionAllowedTypes: current.submissionAllowedTypes.includes(type)
                                          ? current.submissionAllowedTypes.filter((item) => item !== type)
                                          : [...current.submissionAllowedTypes, type],
                                      }))}
                                    >
                                      {type}
                                      <X className="h-4 w-4" />
                                    </button>
                                  );
                                })}
                              </div>
                              <p className="mt-6 text-base text-slate-400">Please Select file types</p>
                            </div>
                          </div>

                          <FormField label="Max. file size allowed for upload (In MB) ?" required>
                            <Input
                              type="number"
                              value={roundDraft.submissionMaxSizeMb.toString()}
                              onChange={(event) => setRoundDraft((current) => ({
                                ...current,
                                submissionMaxSizeMb: Number(event.target.value) || 0,
                              }))}
                              className="h-12 rounded-xl"
                            />
                          </FormField>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                    Platform Settings are needed only for submission rounds.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="evaluation" className="mt-0 px-6 py-6">
                {roundDraft.roundType === 'SUBMISSION' ? (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 p-5">
                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4">
                        <span className="text-xl font-medium text-slate-700">Evaluation Fields and Parameters for this Round</span>
                        <Switch
                          checked={roundDraft.evaluationEnabled}
                          onCheckedChange={(checked) => setRoundDraft((current) => ({ ...current, evaluationEnabled: checked }))}
                        />
                      </div>

                      <p className="mt-8 text-lg text-slate-700">
                        <span className="font-semibold">Note:</span> The interview evaluation configuration is defined by these parameters.
                      </p>

                      <div className="mt-8 rounded-2xl border border-slate-200">
                        <div className="space-y-6 p-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <p className="text-[2rem] font-semibold text-slate-800">Max Score</p>
                              <Info className="h-5 w-5 text-slate-400" />
                            </div>
                            <div className="flex items-center gap-4">
                              <button
                                type="button"
                                className="rounded-full border p-2 text-slate-700"
                                onClick={() => setRoundDraft((current) => ({ ...current, evaluationMaxScore: Math.max(0, current.evaluationMaxScore - 1) }))}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="text-3xl font-semibold text-slate-800">{roundDraft.evaluationMaxScore}</span>
                              <button
                                type="button"
                                className="rounded-full border p-2 text-slate-700"
                                onClick={() => setRoundDraft((current) => ({ ...current, evaluationMaxScore: Math.min(10, current.evaluationMaxScore + 1) }))}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="px-1">
                            <Slider
                              min={0}
                              max={10}
                              step={1}
                              value={[roundDraft.evaluationMaxScore]}
                              onValueChange={([value]) => setRoundDraft((current) => ({ ...current, evaluationMaxScore: value }))}
                            />
                            <div className="mt-2 flex items-center justify-between text-3xl text-slate-500">
                              <span>0</span>
                              <span>10</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid border-t md:grid-cols-2">
                          <EvaluationToggleRow
                            label="Shortlist button"
                            checked={roundDraft.evaluationButtons.shortlist}
                            onCheckedChange={(checked) => setRoundDraft((current) => ({
                              ...current,
                              evaluationButtons: { ...current.evaluationButtons, shortlist: checked },
                            }))}
                          />
                          <EvaluationToggleRow
                            label="Reject button"
                            checked={roundDraft.evaluationButtons.reject}
                            leftBorder
                            onCheckedChange={(checked) => setRoundDraft((current) => ({
                              ...current,
                              evaluationButtons: { ...current.evaluationButtons, reject: checked },
                            }))}
                          />
                          <EvaluationToggleRow
                            label="On Hold button"
                            checked={roundDraft.evaluationButtons.onHold}
                            onCheckedChange={(checked) => setRoundDraft((current) => ({
                              ...current,
                              evaluationButtons: { ...current.evaluationButtons, onHold: checked },
                            }))}
                          />
                          <EvaluationToggleRow
                            label="No Show button"
                            checked={roundDraft.evaluationButtons.noShow}
                            leftBorder
                            onCheckedChange={(checked) => setRoundDraft((current) => ({
                              ...current,
                              evaluationButtons: { ...current.evaluationButtons, noShow: checked },
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                    Evaluation controls are needed only for submission rounds.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <SheetFooter className="mt-auto border-t px-6 py-4 sm:flex-row sm:justify-between sm:space-x-0">
            <Button variant="ghost" className="text-base font-medium text-slate-700" onClick={() => setRoundDrawerOpen(false)}>
              Close
            </Button>
            <Button className="rounded-full px-8" onClick={handleCreateRound}>
              Save
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
      </Sheet>
    </div>
  );
}

function EditProgramView({
  hackathon,
  onHackathonChange,
}: {
  hackathon: BrowserHackathon;
  onHackathonChange: React.Dispatch<React.SetStateAction<BrowserHackathon | null>>;
}) {
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [activeEditSection, setActiveEditSection] = useState<(typeof editProgramSections)[number]['id']>('basic');
  const [form, setForm] = useState(() => createEditProgramForm(hackathon));

  useEffect(() => {
    setForm(createEditProgramForm(hackathon));
  }, [hackathon]);

  const activeItem = editProgramSections.find((item) => item.id === activeEditSection) ?? editProgramSections[0];

  const updateForm = <K extends keyof EditProgramForm>(key: K, value: EditProgramForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleLogoUpload = (file?: File) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, logoDataUrl: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const nextHackathon: BrowserHackathon = {
      ...hackathon,
      title: form.title.trim() || hackathon.title,
      organizationName: form.organizationName.trim(),
      prizePool: form.prizePool.trim(),
      logoDataUrl: form.logoDataUrl,
      overviewHtml: form.overview.trim()
        ? `<p>${form.overview.trim().replace(/\n/g, '<br />')}</p>`
        : '',
      overviewText: getTextFromHtml(form.overview.trim()
        ? `<p>${form.overview.trim().replace(/\n/g, '<br />')}</p>`
        : ''),
      registrationStart: form.registrationStart.trim(),
      registrationEnd: form.registrationEnd.trim(),
      participationType: form.participationType,
      minTeamSize: form.minTeamSize.trim(),
      maxTeamSize: form.maxTeamSize.trim(),
      tracks: form.tracks
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      registrationFields: form.registrationFields
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
    };

    saveBrowserHackathon(nextHackathon);
    onHackathonChange(nextHackathon);
    toast({
      title: 'Hackathon updated',
      description: 'The public hackathon details now reflect your latest edits.',
    });
  };

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="grid min-h-[760px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-r bg-slate-50/80 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[2rem] font-semibold tracking-tight text-slate-900">Edit Program</h2>
              <p className="mt-1 text-sm text-slate-500">Visible public hackathon details</p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-5 space-y-2">
            {editProgramSections.map((item) => {
              const Icon = item.icon;
              const active = item.id === activeEditSection;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-base transition',
                    active ? 'bg-[#dcebfb] text-slate-900' : 'text-slate-700 hover:bg-slate-100'
                  )}
                  onClick={() => setActiveEditSection(item.id)}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex min-h-[760px] flex-col">
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h3 className="text-4xl font-semibold tracking-tight text-slate-900">{activeItem.label}</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                  {getEditSectionDescription(activeEditSection)}
                </p>
              </div>
            </div>

            <div className="mt-12 max-w-3xl space-y-10">
              {activeEditSection === 'basic' ? (
                <div className="space-y-8">
                  <section className="space-y-6">
                    <h4 className="text-2xl font-semibold text-slate-900">About the Program</h4>

                    <div>
                      <p className="mb-3 text-sm font-semibold text-slate-800">Program logo</p>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => handleLogoUpload(event.target.files?.[0])}
                      />
                      <button
                        type="button"
                        className="group relative h-28 w-28 overflow-hidden rounded-[22px] border bg-white shadow-sm"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        {form.logoDataUrl ? (
                          <img src={form.logoDataUrl} alt={`${form.title} logo`} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-slate-100 text-slate-400">
                            <PenSquare className="h-8 w-8" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-[#0f6ad9] px-2 py-2 text-xs font-semibold text-white">
                          Change Logo
                        </div>
                      </button>
                    </div>

                    <FormField label="Program Title" required>
                      <Input
                        value={form.title}
                        onChange={(event) => updateForm('title', event.target.value)}
                        className="h-12 rounded-xl"
                      />
                      <p className="mt-2 text-sm text-slate-500">Max 190 characters</p>
                    </FormField>

                    <FormField label="Organisation Name" required info>
                      <Input
                        value={form.organizationName}
                        onChange={(event) => updateForm('organizationName', event.target.value)}
                        className="h-12 rounded-xl"
                      />
                    </FormField>

                    <FormField label="About Program">
                      <Textarea
                        value={form.overview}
                        onChange={(event) => updateForm('overview', event.target.value)}
                        className="min-h-[180px] rounded-xl"
                      />
                    </FormField>
                  </section>
                </div>
              ) : null}

              {activeEditSection === 'registration' ? (
                <div className="space-y-8">
                  <section className="space-y-6">
                    <h4 className="text-2xl font-semibold text-slate-900">Registration Settings</h4>

                    <FormField label="Participation Type" required>
                      <Select
                        value={form.participationType}
                        onValueChange={(value) => updateForm('participationType', value as BrowserHackathon['participationType'])}
                      >
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TEAM">Team</SelectItem>
                          <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField label="Registration Opens" required>
                        <Input
                          value={form.registrationStart}
                          onChange={(event) => updateForm('registrationStart', event.target.value)}
                          className="h-12 rounded-xl"
                        />
                      </FormField>

                      <FormField label="Registration Deadline" required>
                        <Input
                          value={form.registrationEnd}
                          onChange={(event) => updateForm('registrationEnd', event.target.value)}
                          className="h-12 rounded-xl"
                        />
                      </FormField>
                    </div>

                    {form.participationType === 'TEAM' ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Minimum Team Size" required>
                          <Input
                            value={form.minTeamSize}
                            onChange={(event) => updateForm('minTeamSize', event.target.value)}
                            className="h-12 rounded-xl"
                          />
                        </FormField>

                        <FormField label="Maximum Team Size" required>
                          <Input
                            value={form.maxTeamSize}
                            onChange={(event) => updateForm('maxTeamSize', event.target.value)}
                            className="h-12 rounded-xl"
                          />
                        </FormField>
                      </div>
                    ) : null}

                    <FormField label="Registration Fields">
                      <Textarea
                        value={form.registrationFields}
                        onChange={(event) => updateForm('registrationFields', event.target.value)}
                        className="min-h-[180px] rounded-xl"
                      />
                      <p className="mt-2 text-sm text-slate-500">Use one field per line. These fields appear in registration setup and influence preview analytics.</p>
                    </FormField>
                  </section>
                </div>
              ) : null}

              {activeEditSection === 'rounds' ? (
                <div className="space-y-8">
                  <section className="space-y-6">
                    <h4 className="text-2xl font-semibold text-slate-900">Rounds & Stages</h4>

                    <FormField label="Tracks / Themes">
                      <Textarea
                        value={form.tracks}
                        onChange={(event) => updateForm('tracks', event.target.value)}
                        className="min-h-[220px] rounded-xl"
                      />
                      <p className="mt-2 text-sm text-slate-500">Use one track per line. These are shown on the hackathon card and the public preview FAQs.</p>
                    </FormField>

                    <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-5">
                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Info className="h-4 w-4 text-slate-500" />
                        Public preview impact
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        The public session preview already shows a staged timeline. This section controls the visible tracks and participant-facing stage context without exposing payment, eligibility, or additional info panels.
                      </p>
                    </div>
                  </section>
                </div>
              ) : null}

              {activeEditSection === 'prizes' ? (
                <div className="space-y-8">
                  <section className="space-y-6">
                    <h4 className="text-2xl font-semibold text-slate-900">Prizes</h4>

                    <FormField label="Prize Pool" required>
                      <Input
                        value={form.prizePool}
                        onChange={(event) => updateForm('prizePool', event.target.value)}
                        className="h-12 rounded-xl"
                      />
                    </FormField>

                    <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm font-semibold text-slate-800">Where this shows up</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        The value is reflected in the reward preview card and the dedicated Prize section on the public hackathon page.
                      </p>
                    </div>
                  </section>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between border-t bg-white px-6 py-4 lg:px-8">
            <Button asChild variant="ghost" className="text-base font-medium text-slate-700">
              <Link href={`/hackathons/${hackathon.slug}`}>Close</Link>
            </Button>
            <Button className="rounded-full px-8" onClick={handleSave}>
              Save
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function createEditProgramForm(hackathon: BrowserHackathon): EditProgramForm {
  return {
    title: hackathon.title,
    organizationName: hackathon.organizationName || 'Cprime Technologies',
    prizePool: hackathon.prizePool || '₹1,00,000',
    logoDataUrl: hackathon.logoDataUrl,
    overview: hackathon.overviewText || getTextFromHtml(hackathon.overviewHtml),
    registrationStart: hackathon.registrationStart,
    registrationEnd: hackathon.registrationEnd,
    participationType: hackathon.participationType,
    minTeamSize: hackathon.minTeamSize,
    maxTeamSize: hackathon.maxTeamSize,
    tracks: hackathon.tracks.join('\n'),
    registrationFields: hackathon.registrationFields.join('\n'),
  };
}

function getEditSectionDescription(section: (typeof editProgramSections)[number]['id']) {
  switch (section) {
    case 'basic':
      return 'Provide basic details about the program, who is organizing it, and what visitors should understand when they open the public hackathon page.';
    case 'registration':
      return 'Configure participation type, registration window, team size constraints, and the fields expected from applicants.';
    case 'rounds':
      return 'Shape the participant-facing tracks and stage context that appear across the hackathon preview and registration flow.';
    case 'prizes':
      return 'Set the prize pool shown on the public hackathon page.';
    default:
      return '';
  }
}

function FormField({
  children,
  info = false,
  label,
  required = false,
}: {
  children: ReactNode;
  info?: boolean;
  label: string;
  required?: boolean;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
        <span>{label}</span>
        {required ? <span className="text-red-500">*</span> : null}
        {info ? <Info className="h-4 w-4 text-slate-400" /> : null}
      </div>
      {children}
    </div>
  );
}

function EvaluationToggleRow({
  checked,
  leftBorder = false,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  leftBorder?: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className={cn('flex items-center justify-between border-b px-4 py-4 last:border-b-0', leftBorder && 'md:border-l')}>
      <span className="text-xl font-medium text-slate-700">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function createInitialStages(): StageDefinition[] {
  return [
    { id: 'reg', name: 'All Registrations', code: 'REG', type: 'REGISTRATION' },
    {
      id: 'submission-r1',
      name: 'Submission Round (via Unstop)',
      code: 'R1',
      type: 'SUBMISSION',
      sourceStageId: 'reg',
    },
  ];
}

function addSubmissionStage(stages: StageDefinition[]): StageDefinition[] {
  const submissionCount = stages.filter((stage) => stage.type === 'SUBMISSION').length;
  const nextCode = `R${submissionCount + 1}`;
  const nextStage: StageDefinition = {
    id: `submission-${nextCode.toLowerCase()}`,
    name: `Submission Round ${submissionCount + 1} (via Unstop)`,
    code: nextCode,
    type: 'SUBMISSION',
    sourceStageId: stages[stages.length - 1]?.id,
  };

  return [...stages, nextStage];
}

function insertSubmissionStageAt(stages: StageDefinition[], index: number, draft?: RoundDraft): StageDefinition[] {
  const submissionCount = stages.filter((stage) => stage.type === 'SUBMISSION').length;
  const newStageNumber = submissionCount + 1;
  const insertAfterStage = stages[index];
  const nextStages = [...stages];
  const nextStage: StageDefinition = {
    id: `submission-r${newStageNumber}-${Date.now()}`,
    name: draft?.title.trim() || (newStageNumber === 1 ? 'Submission Round (via Unstop)' : `Submission Round ${newStageNumber} (via Unstop)`),
    code: `R${newStageNumber}`,
    type: 'SUBMISSION',
    sourceStageId: insertAfterStage?.id,
  };

  nextStages.splice(index + 1, 0, nextStage);

  return nextStages.map((stage, stageIndex) => {
    if (stage.type === 'REGISTRATION') {
      return stage;
    }

    const orderedSubmissionIndex = nextStages
      .slice(0, stageIndex + 1)
      .filter((item) => item.type === 'SUBMISSION').length;
    const previousStage = nextStages[stageIndex - 1];

    return {
      ...stage,
      id: stage.id.startsWith('submission-r')
        ? `submission-r${orderedSubmissionIndex}${stage.id.includes('-') ? `-${stage.id.split('-').slice(2).join('-')}` : ''}`
        : stage.id,
      name: stage.id === nextStage.id
        ? nextStage.name
        : orderedSubmissionIndex === 1
          ? 'Submission Round (via Unstop)'
          : `Submission Round ${orderedSubmissionIndex} (via Unstop)`,
      code: `R${orderedSubmissionIndex}`,
      sourceStageId: previousStage?.id,
    };
  });
}

function createDefaultRoundDraft(roundNumber = 1): RoundDraft {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  return {
    title: roundNumber === 1 ? 'Submission Round (via Unstop)' : `Submission Round ${roundNumber} (via Unstop)`,
    description: 'Participants will submit their work here once the round is live.',
    startAt: formatDateTimeLocal(new Date()),
    endAt: formatDateTimeLocal(nextWeek),
    eliminationMode: 'AUTO_ADVANCE',
    roundType: 'SUBMISSION',
    submissionFieldType: 'FILE',
    submissionFieldRequired: true,
    submissionFieldLabel: 'Upload submission',
    submissionFieldHint: '',
    submissionAllowedTypes: [...allowedSubmissionTypes],
    submissionMaxSizeMb: 50,
    evaluationEnabled: true,
    evaluationMaxScore: 5,
    evaluationButtons: {
      shortlist: true,
      reject: true,
      onHold: true,
      noShow: true,
    },
  };
}

function formatDateTimeLocal(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  const hours = `${value.getHours()}`.padStart(2, '0');
  const minutes = `${value.getMinutes()}`.padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function createTeamRecords(hackathon: BrowserHackathon, stages: StageDefinition[]): TeamRecord[] {
  const demoParticipants = [
    {
      id: 'participant-1',
      participantName: 'Pavanprasad0605',
      email: 'pavanprasad0605@gmail.com',
      company: 'Cprime Technologies',
      registrationStatus: 'COMPLETE' as const,
    },
    {
      id: 'participant-2',
      participantName: 'Aarav Build Lab',
      email: 'aarav@buildlab.dev',
      company: hackathon.tracks[0] ?? 'Build Lab',
      registrationStatus: 'COMPLETE' as const,
    },
    {
      id: 'participant-3',
      participantName: 'Nexus Foundry',
      email: 'team@nexusfoundry.ai',
      company: hackathon.tracks[1] ?? 'Nexus Foundry',
      registrationStatus: 'COMPLETE' as const,
    },
    {
      id: 'participant-4',
      participantName: 'Orbit Stack',
      email: 'hello@orbitstack.dev',
      company: hackathon.tracks[2] ?? 'Orbit Stack',
      registrationStatus: 'INCOMPLETE' as const,
    },
  ];

  return demoParticipants.map((participant, participantIndex) => ({
    ...participant,
    stageEntries: Object.fromEntries(
      stages
        .filter((stage) => stage.type === 'SUBMISSION')
        .map((stage, submissionIndex) => [stage.id, createSubmissionEntry(participantIndex, submissionIndex)])
    ),
  }));
}

function mergeRecordsWithStages(records: TeamRecord[], stages: StageDefinition[]) {
  return records.map((record, recordIndex) => ({
    ...record,
    stageEntries: Object.fromEntries(
      stages
        .filter((stage) => stage.type === 'SUBMISSION')
        .map((stage, submissionIndex) => [
          stage.id,
          record.stageEntries[stage.id] ?? createSubmissionEntry(recordIndex, submissionIndex),
        ])
    ),
  }));
}

function createSubmissionEntry(recordIndex: number, submissionIndex: number): StageEntry {
  if (submissionIndex === 0) {
    if (recordIndex === 0) {
      return { status: 'IN_PROGRESS', submitted: false, score: '--', panel: 'Panel A' };
    }
    if (recordIndex === 1) {
      return { status: 'SHORTLISTED', submitted: true, score: '87', panel: 'Panel B' };
    }
    if (recordIndex === 2) {
      return { status: 'REJECTED', submitted: true, score: '49', panel: 'Panel C' };
    }

    return { status: 'IN_PROGRESS', submitted: true, score: '--', panel: 'Panel A' };
  }

  if (recordIndex === 0) {
    return { status: 'IN_PROGRESS', submitted: true, score: '--', panel: 'Panel A' };
  }
  if (recordIndex === 1) {
    return { status: 'SHORTLISTED', submitted: true, score: '84', panel: 'Panel B' };
  }
  if (recordIndex === 2) {
    return { status: 'REJECTED', submitted: true, score: '53', panel: 'Panel C' };
  }

  return { status: 'IN_PROGRESS', submitted: true, score: '--', panel: 'Panel A' };
}

function updateSubmissionStatus(
  records: TeamRecord[],
  stageId: string,
  recordId: string,
  status: SubmissionStatus
) {
  return records.map((record) => {
    if (record.id !== recordId) {
      return record;
    }

    const entry = record.stageEntries[stageId];
    if (!entry) {
      return record;
    }

    return {
      ...record,
      stageEntries: {
        ...record.stageEntries,
        [stageId]: {
          ...entry,
          status,
          submitted: true,
          score: status === 'SHORTLISTED' ? '84' : entry.score === '--' ? '49' : entry.score,
        },
      },
    };
  });
}

function downloadRegistrations(
  slug: string,
  code: string,
  records: TeamRecord[],
  toast: ReturnType<typeof useToast>['toast']
) {
  downloadTextFile(
    `${slug}-${code.toLowerCase()}-registrations.csv`,
    [
      'participant_name,email,company,registration_status',
      ...records.map((record) => (
        [
          escapeCsv(record.participantName),
          escapeCsv(record.email),
          escapeCsv(record.company),
          record.registrationStatus,
        ].join(',')
      )),
    ].join('\n')
  );
  toast({
    title: 'Registrations exported',
    description: `${records.length} record(s) downloaded.`,
  });
}

function downloadProfiles(
  slug: string,
  code: string,
  records: TeamRecord[],
  toast: ReturnType<typeof useToast>['toast']
) {
  downloadTextFile(
    `${slug}-${code.toLowerCase()}-profiles.csv`,
    [
      'participant_name,email,company',
      ...records.map((record) => (
        [escapeCsv(record.participantName), escapeCsv(record.email), escapeCsv(record.company)].join(',')
      )),
    ].join('\n')
  );
  toast({
    title: 'Profiles exported',
    description: `${records.length} profile(s) downloaded.`,
  });
}

function downloadSubmissions(
  slug: string,
  stageId: string,
  code: string,
  records: TeamRecord[],
  toast: ReturnType<typeof useToast>['toast']
) {
  const submitted = records.filter((record) => record.stageEntries[stageId]?.submitted);

  downloadTextFile(
    `${slug}-${code.toLowerCase()}-submissions.csv`,
    [
      'participant_name,email,company,status,score,panel',
      ...submitted.map((record) => {
        const entry = record.stageEntries[stageId];
        return [
          escapeCsv(record.participantName),
          escapeCsv(record.email),
          escapeCsv(record.company),
          entry?.status ?? '',
          entry?.score ?? '',
          entry?.panel ?? '',
        ].join(',');
      }),
    ].join('\n')
  );
  toast({
    title: 'Submissions exported',
    description: `${submitted.length} submission(s) downloaded.`,
  });
}

function downloadTextFile(filename: string, contents: string) {
  const blob = new Blob([contents], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function handleToastAction(
  label: string,
  stageName: string,
  toast: ReturnType<typeof useToast>['toast']
) {
  toast({
    title: label,
    description: `${label} is ready for backend wiring on ${stageName}.`,
  });
}

function AvatarChip({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4f46e5,#8b5cf6)] text-sm font-semibold text-white shadow-sm">
      {initials}
    </div>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}) {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
    neutral: 'bg-slate-100 text-slate-700',
  } satisfies Record<string, string>;

  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold', styles[tone])}>
      <span className="h-2.5 w-2.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function ActionIconButton({
  children,
  className,
  disabled = false,
  label,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 text-slate-700 transition',
        disabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-slate-50',
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function StageTransition({
  stage,
  stages,
}: {
  stage: StageDefinition;
  stages: StageDefinition[];
}) {
  if (stage.type === 'REGISTRATION') {
    const nextStage = stages.find((candidate) => candidate.sourceStageId === stage.id);

    return (
      <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span>{stage.code}</span>
        {nextStage ? (
          <>
            <ArrowRight className="h-4 w-4 text-emerald-600" />
            <span>{nextStage.code}</span>
          </>
        ) : null}
      </div>
    );
  }

  const sourceStage = stages.find((candidate) => candidate.id === stage.sourceStageId);

  return (
    <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
      {sourceStage ? <span>{sourceStage.code}</span> : null}
      {sourceStage ? <ArrowRight className="h-4 w-4 text-emerald-600" /> : null}
      <span>{stage.code}</span>
    </div>
  );
}

function getSubmissionStatusLabel(entry: StageEntry) {
  if (!entry.submitted && entry.status === 'IN_PROGRESS') {
    return 'Not Submitted';
  }
  if (entry.status === 'IN_PROGRESS') {
    return 'Pending Review';
  }
  if (entry.status === 'SHORTLISTED') {
    return 'Shortlisted';
  }
  return 'Rejected';
}

function getSubmissionTone(entry: StageEntry): 'success' | 'danger' | 'info' {
  if (entry.status === 'SHORTLISTED') {
    return 'success';
  }
  if (entry.status === 'REJECTED') {
    return 'danger';
  }
  return 'info';
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
