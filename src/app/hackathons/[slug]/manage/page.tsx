'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  createDefaultHackathonStages,
  getTextFromHtml,
  getBrowserHackathonAnalytics,
  getBrowserHackathonStages,
  readBrowserHackathonBySlug,
  removeBrowserHackathon,
  saveBrowserHackathon,
  type BrowserHackathon,
  type BrowserHackathonEvaluationCriterion,
  type BrowserHackathonStage,
  type BrowserHackathonTrackAnalytics,
} from '@/lib/browser-hackathons';
import {
  deleteHackathon,
  deleteHackathonRegistration,
  fetchHackathonBySlug,
  fetchHackathonRegistrations,
  updateHackathonStages,
  type HackathonRegistrationItem,
} from '@/lib/hackathons';
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
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
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
  ListChecks,
  Mail,
  CalendarDays,
  MoreVertical,
  User,
  Settings,
  PenSquare,
  Plus,
  Search,
  Settings2,
  Share2,
  Trash2,
  Users,
  UsersRound,
  X,
} from 'lucide-react';

type ManageSection = 'dashboard' | 'registrations' | 'edit';
type RegistrationFilter = 'ALL' | 'COMPLETE' | 'INCOMPLETE';
type SubmissionFilter = 'ALL' | 'IN_PROGRESS' | 'SHORTLISTED' | 'REJECTED';
type SubmissionStatus = Exclude<SubmissionFilter, 'ALL'>;
type RegistrationStatus = Exclude<RegistrationFilter, 'ALL'>;

type StageDefinition = BrowserHackathonStage;

type StageEntry = {
  status: SubmissionStatus;
  submitted: boolean;
  score: string;
  panel: string;
};

type TeamRecord = {
  id: string;
  displayName: string;
  participantName: string;
  email: string;
  detail: string;
  registrationStatus: RegistrationStatus;
  stageEntries: Record<string, StageEntry>;
};

type RoundDraft = {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  eliminationMode: 'ELIMINATION' | 'AUTO_ADVANCE';
  roundType: 'OFFLINE' | 'SUBMISSION';
  submissionFieldType: 'FILE';
  submissionFieldRequired: boolean;
  submissionFieldLabel: string;
  submissionFieldHint: string;
  submissionAllowedTypes: string[];
  submissionMaxSizeMb: number;
  evaluationEnabled: boolean;
  evaluationMaxScore: number;
  evaluationCriteria: BrowserHackathonEvaluationCriterion[];
  evaluationButtons: {
    shortlist: boolean;
    reject: boolean;
    onHold: boolean;
    noShow: boolean;
  };
};

type RoundDrawerStep = 'basic' | 'platform' | 'evaluation';

type EditProgramForm = {
  title: string;
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
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { currentUser } = useAuth();
  const [hackathon, setHackathon] = useState<BrowserHackathon | null>(null);
  const [loadingHackathon, setLoadingHackathon] = useState(true);
  const [activeSection, setActiveSection] = useState<ManageSection>('registrations');
  const [sidebarPinnedOpen, setSidebarPinnedOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!slug) {
      return;
    }

    let cancelled = false;

    const loadHackathon = async () => {
      try {
        const nextHackathon = await fetchHackathonBySlug(slug);
        if (cancelled) {
          return;
        }

        setHackathon(nextHackathon);
        saveBrowserHackathon(nextHackathon);
      } catch {
        if (!cancelled) {
          setHackathon(readBrowserHackathonBySlug(slug));
        }
      } finally {
        if (!cancelled) {
          setLoadingHackathon(false);
        }
      }
    };

    void loadHackathon();

    return () => {
      cancelled = true;
    };
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

  if (loadingHackathon) {
    return <div className="min-h-[480px] rounded-[28px] border bg-card shadow-sm" />;
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

  const handleDeleteHackathon = async () => {
    const confirmed = window.confirm(`Delete "${hackathon.title}"? This will remove the hackathon, registrations, and stages.`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteHackathon(hackathon.slug);
      removeBrowserHackathon(hackathon.id);
      toast({
        title: 'Hackathon deleted',
        description: `${hackathon.title} has been removed.`,
      });
      router.push('/hackathons');
    } catch {
      toast({
        title: 'Unable to delete hackathon',
        description: 'The hackathon could not be removed right now.',
        variant: 'destructive',
      });
    }
  };

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
          {activeSection === 'dashboard' ? (
            <DashboardView
              hackathon={hackathon}
              currentUserName={currentUser?.name}
              onDeleteHackathon={handleDeleteHackathon}
            />
          ) : null}
          {activeSection === 'registrations' ? <ManageRegistrationsTab hackathon={hackathon} onHackathonChange={setHackathon} /> : null}
          {activeSection === 'edit' ? <EditProgramView hackathon={hackathon} onHackathonChange={setHackathon} /> : null}
        </section>
      </div>
    </div>
  );
}

function DashboardView({
  hackathon,
  currentUserName,
  onDeleteHackathon,
}: {
  hackathon: BrowserHackathon;
  currentUserName?: string | null;
  onDeleteHackathon: () => void;
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
            Manage {hackathon.title}. Registration activity will appear here as participants start applying.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{hackathon.participationType === 'TEAM' ? 'Team format' : 'Individual format'}</Badge>
          <Button asChild variant="outline">
            <Link href={`/hackathons/${hackathon.slug}`}>Open public page</Link>
          </Button>
          <Button variant="destructive" onClick={onDeleteHackathon}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete hackathon
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
          icon={Settings}
          title="Registration Fields"
          value={hackathon.registrationFields.length.toString()}
          helper="Configured on the hackathon form"
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
              {analytics.trackStats.length > 0 ? (
                analytics.trackStats.map((track) => (
                  <TrackOverviewRow
                    key={track.track}
                    track={track.track}
                    registrations={track.registrations}
                    total={analytics.totalRegistrations}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No tracks configured yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-white/70 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>Track Wise Registrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.trackStats.length > 0 ? (
              analytics.trackStats.map((track) => (
                <TrackStatCard key={track.track} track={track} maxRegistrations={analytics.totalRegistrations} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Track analytics will appear after tracks are configured.</p>
            )}
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
              body={topTrack && topTrack.registrations > 0 ? `${topTrack.track} is currently leading with ${topTrack.registrations} registrations.` : 'Track performance will appear once registrations start.'}
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
            {analytics.trackStats.length > 0 ? (
              analytics.trackStats.map((track, index) => (
                <div key={track.track} className="rounded-2xl border bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{track.track}</p>
                      <p className="text-sm text-muted-foreground">{track.impressions} impressions</p>
                    </div>
                    <Badge variant={index === 0 ? 'default' : 'secondary'}>{track.conversionRate}% CVR</Badge>
                  </div>
                  <Progress
                    className="mt-4 h-2.5 bg-secondary/70"
                    value={analytics.totalRegistrations > 0 ? (track.registrations / analytics.totalRegistrations) * 100 : 0}
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No tracks configured yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-white/70 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>Hackathon Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickEditRow label="Registration Deadline" value={hackathon.registrationEnd} />
            <QuickEditRow label="Tracks" value={`${hackathon.tracks.length} configured`} />
            <QuickEditRow label="Participation" value={hackathon.participationType === 'TEAM' ? `${hackathon.minTeamSize}-${hackathon.maxTeamSize} members` : 'Individual'} />
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-white/70 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>Registration Form</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hackathon.registrationFields.length > 0 ? (
              hackathon.registrationFields.map((field) => (
                <div key={field} className="flex items-center justify-between rounded-2xl border px-4 py-3">
                  <span className="font-medium text-foreground">{field}</span>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No registration fields configured yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ManageRegistrationsTab({
  hackathon,
  onHackathonChange,
}: {
  hackathon: BrowserHackathon;
  onHackathonChange: React.Dispatch<React.SetStateAction<BrowserHackathon | null>>;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [stages, setStages] = useState<StageDefinition[]>([]);
  const [selectedStageId, setSelectedStageId] = useState('');
  const [records, setRecords] = useState<TeamRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [registrationFilter, setRegistrationFilter] = useState<RegistrationFilter>('ALL');
  const [submissionFilter, setSubmissionFilter] = useState<SubmissionFilter>('IN_PROGRESS');
  const [stageInsertMode, setStageInsertMode] = useState(false);
  const [roundDrawerOpen, setRoundDrawerOpen] = useState(false);
  const [roundDrawerStep, setRoundDrawerStep] = useState<RoundDrawerStep>('basic');
  const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null);
  const [roundDraft, setRoundDraft] = useState<RoundDraft>(() => createDefaultRoundDraft());
  const [loadingRecords, setLoadingRecords] = useState(true);

  useEffect(() => {
    const baseStages = getBrowserHackathonStages(hackathon);
    setStages(baseStages);
    setSelectedStageId(baseStages[0]?.id ?? '');
  }, [hackathon]);

  useEffect(() => {
    let cancelled = false;

    const loadRegistrations = async () => {
      setLoadingRecords(true);

      try {
        const registrations = await fetchHackathonRegistrations(hackathon.slug);
        if (cancelled) {
          return;
        }

        setRecords(mapRegistrationsToTeamRecords(registrations, stages));
      } catch {
        if (!cancelled) {
          setRecords([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingRecords(false);
        }
      }
    };

    void loadRegistrations();

    return () => {
      cancelled = true;
    };
  }, [hackathon.slug, stages]);

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
        || [record.displayName, record.participantName, record.email, record.detail]
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
      { label: 'Download Registrations', icon: Download, onClick: () => downloadRegistrations(hackathon.slug, selectedStage.code, visibleRecords, toast) },
    ]
    : [
      { label: 'Certificate', icon: Award, onClick: () => handleToastAction('Certificate', selectedStage.name, toast) },
      { label: 'Download Profiles', icon: Download, onClick: () => downloadProfiles(hackathon.slug, selectedStage.code, visibleRecords, toast) },
      { label: 'Submissions', icon: Download, onClick: () => downloadSubmissions(hackathon.slug, selectedStage.id, selectedStage.code, visibleRecords, toast) },
      { label: 'Evaluate', icon: CheckCircle2, onClick: () => handleToastAction('Evaluate', selectedStage.name, toast) },
      { label: 'Declare Result', icon: Award, onClick: () => handleToastAction('Declare Result', selectedStage.name, toast) },
    ];

  const handleOpenRoundDrawer = (index: number) => {
    setInsertAfterIndex(index);
    setRoundDraft(createDefaultRoundDraft(stages.filter((stage) => stage.type === 'SUBMISSION').length + 1));
    setRoundDrawerStep('basic');
    setRoundDrawerOpen(true);
  };

  const handleCreateRound = async () => {
    if (insertAfterIndex === null) {
      return;
    }

    const nextStages = insertSubmissionStageAt(stages, insertAfterIndex, roundDraft);

    try {
      const updatedHackathon = await updateHackathonStages(hackathon.slug, nextStages);
      const updatedStages = getBrowserHackathonStages(updatedHackathon);
      const insertedStage = updatedStages[insertAfterIndex + 1];

      saveBrowserHackathon(updatedHackathon);
      onHackathonChange(updatedHackathon);
      setStages(updatedStages);
      if (insertedStage) {
        setSelectedStageId(insertedStage.id);
      }
      setSubmissionFilter('IN_PROGRESS');
      setStageInsertMode(false);
      setRoundDrawerOpen(false);
      setInsertAfterIndex(null);
      setRecords((current) => mergeRecordsWithStages(current, updatedStages));
      toast({
        title: 'Round added',
        description: `${insertedStage?.name ?? 'The new round'} is now available in Manage Registrations.`,
      });
    } catch {
      toast({
        title: 'Unable to add round',
        description: 'The round could not be saved right now.',
        variant: 'destructive',
      });
    }
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
                    ? 'grid-cols-[64px_minmax(260px,1.6fr)_164px_190px_92px]'
                    : 'grid-cols-[64px_minmax(260px,1.5fr)_144px_160px_96px_250px]'
                )}
              >
                <div>#</div>
                <div>{hackathon.participationType === 'TEAM' ? '1 TEAMS / PARTICIPANTS' : '1 PARTICIPANT'}</div>
                {selectedStage.type === 'SUBMISSION' ? <div>ROUND PANEL</div> : null}
                <div>{selectedStage.type === 'REGISTRATION' ? 'REG. STATUS' : 'STATUS'}</div>
                {selectedStage.type === 'SUBMISSION' ? <div>SCORE</div> : null}
                <div>ACTION / STATUS</div>
                {selectedStage.type === 'REGISTRATION' ? <div>DELETE</div> : null}
              </div>

              {loadingRecords ? (
                <div className="px-6 py-12 text-center text-sm text-slate-500">
                  Loading registrations...
                </div>
              ) : visibleRecords.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-slate-500">
                  No participants match the current filters.
                </div>
              ) : (
                visibleRecords.map((record, index) => {
                  const stageEntry = record.stageEntries[selectedStage.id];

                  return (
                    <div
                      key={record.id}
                      role="button"
                      tabIndex={0}
                      className={cn(
                        'grid items-center border-t border-slate-200 px-4 py-4',
                        'cursor-pointer transition hover:bg-slate-50/70',
                        selectedStage.type === 'REGISTRATION'
                          ? 'grid-cols-[64px_minmax(260px,1.6fr)_164px_190px_92px]'
                          : 'grid-cols-[64px_minmax(260px,1.5fr)_144px_160px_96px_250px]'
                      )}
                      onClick={() => router.push(`/hackathons/${hackathon.slug}/manage/${record.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          router.push(`/hackathons/${hackathon.slug}/manage/${record.id}`);
                        }
                      }}
                    >
                      <div className="text-lg font-semibold text-slate-800">{index + 1}</div>

                      <div className="flex items-center gap-4 pr-4">
                        <AvatarChip name={record.displayName} />
                        <div className="min-w-0">
                          <p className="truncate text-[1.3rem] font-semibold text-slate-900">{record.displayName}</p>
                          <p className="truncate text-sm text-slate-500">{record.email}</p>
                          {record.detail ? <p className="truncate text-base text-slate-600">{record.detail}</p> : null}
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
                          <div />
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
                                    `Detail: ${record.detail || '-'}`,
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
                      {selectedStage.type === 'REGISTRATION' ? (
                        <div className="flex items-center justify-center">
                            <ActionIconButton
                              label="Delete registration"
                              className="border-red-300 text-red-500 hover:bg-red-50"
                              onClick={() => {
                                void (async () => {
                                  try {
                                  await deleteHackathonRegistration(hackathon.slug, record.id);
                                  setRecords((current) => current.filter((item) => item.id !== record.id));
                                  toast({
                                    title: 'Registration deleted',
                                    description: `${record.displayName} was removed from registrations.`,
                                  });
                                } catch {
                                  toast({
                                    title: 'Unable to delete registration',
                                    description: 'Please try again.',
                                    variant: 'destructive',
                                  });
                                }
                              })();
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </ActionIconButton>
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-[760px]">
        <SheetHeader className="sr-only">
          <SheetTitle>Create Screening Round</SheetTitle>
          <SheetDescription>Configure the round type, submission requirements, and evaluation settings.</SheetDescription>
        </SheetHeader>
        <div className="flex min-h-full flex-col bg-white">
          <div className="border-b px-6 pt-6">
            <Tabs value={roundDrawerStep} onValueChange={(value) => setRoundDrawerStep(value as RoundDrawerStep)} className="w-full">
              <TabsList className="h-auto w-full justify-start gap-6 rounded-none bg-transparent p-0 text-base">
                <TabsTrigger value="basic" className="rounded-none border-b-[3px] border-transparent px-0 py-4 text-base data-[state=active]:border-[#173f73] data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                  Basic Info
                </TabsTrigger>
                <TabsTrigger
                  value="platform"
                  disabled={roundDraft.roundType !== 'SUBMISSION'}
                  className="rounded-none border-b-[3px] border-transparent px-0 py-4 text-base data-[state=active]:border-[#173f73] data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Submission Form
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
                        { value: 'SUBMISSION', label: 'Submission', icon: FileUp },
                        { value: 'OFFLINE', label: 'Offline / In-Office / Other', icon: CalendarDays },
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
                            onClick={() => {
                              setRoundDraft((current) => ({ ...current, roundType: option.value }));
                              setRoundDrawerStep('basic');
                            }}
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
                    Submission Form is needed only for submission rounds.
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
                        <div className="p-5">
                          <EvaluationCriteriaEditor draft={roundDraft} onChange={setRoundDraft} />
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
            <div className="flex items-center gap-3">
              {getPreviousRoundDrawerStep(roundDrawerStep, roundDraft.roundType) ? (
                <Button
                  variant="outline"
                  className="rounded-full px-8"
                  onClick={() => setRoundDrawerStep(getPreviousRoundDrawerStep(roundDrawerStep, roundDraft.roundType) ?? 'basic')}
                >
                  Back
                </Button>
              ) : null}
              {getNextRoundDrawerStep(roundDrawerStep, roundDraft.roundType) ? (
                <Button
                  className="rounded-full px-8"
                  onClick={() => setRoundDrawerStep(getNextRoundDrawerStep(roundDrawerStep, roundDraft.roundType) ?? 'basic')}
                >
                  Next
                </Button>
              ) : (
                <Button className="rounded-full px-8" onClick={handleCreateRound}>
                  Save
                </Button>
              )}
            </div>
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
  const [registrationFieldInput, setRegistrationFieldInput] = useState('');
  const [trackInput, setTrackInput] = useState('');
  const [programStages, setProgramStages] = useState<StageDefinition[]>(
    () => getBrowserHackathonStages(hackathon).filter((stage) => stage.type === 'SUBMISSION')
  );
  const [programRoundDrawerOpen, setProgramRoundDrawerOpen] = useState(false);
  const [programRoundDrawerStep, setProgramRoundDrawerStep] = useState<RoundDrawerStep>('basic');
  const [programRoundDraft, setProgramRoundDraft] = useState<RoundDraft>(() => createDefaultRoundDraft(1));

  useEffect(() => {
    setForm(createEditProgramForm(hackathon));
    setProgramStages(getBrowserHackathonStages(hackathon).filter((stage) => stage.type === 'SUBMISSION'));
    setProgramRoundDrawerOpen(false);
    setProgramRoundDrawerStep('basic');
    setProgramRoundDraft(createDefaultRoundDraft(1));
  }, [hackathon]);

  const activeItem = editProgramSections.find((item) => item.id === activeEditSection) ?? editProgramSections[0];

  const updateForm = <K extends keyof EditProgramForm>(key: K, value: EditProgramForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };
  const registrationFieldItems = form.registrationFields
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
  const trackItems = form.tracks
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
  const hasValidTeamSize = form.participationType !== 'TEAM'
    || (
      form.minTeamSize.trim() !== ''
      && form.maxTeamSize.trim() !== ''
      && Number(form.maxTeamSize) >= Number(form.minTeamSize)
    );

  const syncRegistrationFields = (fields: string[]) => {
    updateForm('registrationFields', fields.join('\n'));
  };
  const syncTracks = (tracks: string[]) => {
    updateForm('tracks', tracks.join('\n'));
  };

  const handleAddRegistrationField = () => {
    const trimmed = registrationFieldInput.trim();

    if (!trimmed || registrationFieldItems.includes(trimmed)) {
      return;
    }

    syncRegistrationFields([...registrationFieldItems, trimmed]);
    setRegistrationFieldInput('');
  };

  const handleRemoveRegistrationField = (field: string) => {
    syncRegistrationFields(registrationFieldItems.filter((item) => item !== field));
  };
  const handleAddTrack = () => {
    const trimmed = trackInput.trim();

    if (!trimmed || trackItems.includes(trimmed)) {
      return;
    }

    syncTracks([...trackItems, trimmed]);
    setTrackInput('');
  };

  const handleRemoveTrack = (track: string) => {
    syncTracks(trackItems.filter((item) => item !== track));
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
      stages: [
        createDefaultHackathonStages()[0],
        ...programStages,
      ],
    };

    saveBrowserHackathon(nextHackathon);
    onHackathonChange(nextHackathon);
    toast({
      title: 'Hackathon updated',
      description: 'The public hackathon details now reflect your latest edits.',
    });
  };

  const handleOpenProgramRoundDrawer = () => {
    const nextRoundNumber = programStages.length + 1;
    setProgramRoundDraft({
      ...createDefaultRoundDraft(nextRoundNumber),
      title: `Round ${nextRoundNumber}`,
    });
    setProgramRoundDrawerStep('basic');
    setProgramRoundDrawerOpen(true);
  };

  const handleCreateProgramRound = async () => {
    const nextStages = insertSubmissionStageAt(
      [createDefaultHackathonStages()[0], ...programStages],
      programStages.length,
      programRoundDraft,
    );

    try {
      const updatedHackathon = await updateHackathonStages(hackathon.slug, nextStages);
      const updatedProgramStages = getBrowserHackathonStages(updatedHackathon).filter((stage) => stage.type === 'SUBMISSION');

      saveBrowserHackathon(updatedHackathon);
      onHackathonChange(updatedHackathon);
      setProgramStages(updatedProgramStages);
      setProgramRoundDrawerOpen(false);
      toast({
        title: 'Round added',
        description: 'The new stage is now saved for this hackathon.',
      });
    } catch {
      toast({
        title: 'Unable to add round',
        description: 'The round could not be saved right now.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveProgramRound = async (stageId: string) => {
    const remaining = programStages
      .filter((stage) => stage.id !== stageId)
      .map((stage, index) => ({
        ...stage,
        code: `R${index + 1}`,
      }));

    try {
      const updatedHackathon = await updateHackathonStages(hackathon.slug, [createDefaultHackathonStages()[0], ...remaining]);
      const updatedProgramStages = getBrowserHackathonStages(updatedHackathon).filter((stage) => stage.type === 'SUBMISSION');

      saveBrowserHackathon(updatedHackathon);
      onHackathonChange(updatedHackathon);
      setProgramStages(updatedProgramStages);
      toast({
        title: 'Round removed',
        description: 'The stage list has been updated.',
      });
    } catch {
      toast({
        title: 'Unable to remove round',
        description: 'The stage could not be removed right now.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <Sheet open={programRoundDrawerOpen} onOpenChange={setProgramRoundDrawerOpen}>
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

                    <div className="rounded-[28px] border p-8">
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <Label className="text-2xl font-medium text-slate-900">Participation Type</Label>
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                updateForm('participationType', 'INDIVIDUAL');
                                updateForm('minTeamSize', '');
                                updateForm('maxTeamSize', '');
                              }}
                              className={cn(
                                'flex items-center gap-3 rounded-2xl border border-dashed px-6 py-4 text-xl',
                                form.participationType === 'INDIVIDUAL' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300 text-slate-700'
                              )}
                            >
                              <User className="h-6 w-6" />
                              Individual
                            </button>
                            <button
                              type="button"
                              onClick={() => updateForm('participationType', 'TEAM')}
                              className={cn(
                                'flex items-center gap-3 rounded-2xl border border-dashed px-6 py-4 text-xl',
                                form.participationType === 'TEAM' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300 text-slate-700'
                              )}
                            >
                              <Users className="h-6 w-6" />
                              Team Participation
                            </button>
                          </div>
                        </div>

                        {form.participationType === 'TEAM' ? (
                          <div className="space-y-4">
                            <Label className="text-2xl font-medium text-slate-900">Set team size</Label>
                            <div className="grid gap-4 md:grid-cols-2">
                              <Select value={form.minTeamSize} onValueChange={(value) => updateForm('minTeamSize', value)}>
                                <SelectTrigger className="h-16 rounded-2xl text-xl">
                                  <SelectValue placeholder="Select minimum team size" />
                                </SelectTrigger>
                                <SelectContent>
                                  {['1', '2', '3', '4', '5'].map((value) => (
                                    <SelectItem key={value} value={value}>Min: {value}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select value={form.maxTeamSize} onValueChange={(value) => updateForm('maxTeamSize', value)}>
                                <SelectTrigger className="h-16 rounded-2xl text-xl">
                                  <SelectValue placeholder="Select maximum team size" />
                                </SelectTrigger>
                                <SelectContent>
                                  {['2', '3', '4', '5', '6'].map((value) => (
                                    <SelectItem key={value} value={value}>Max: {value}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {!hasValidTeamSize ? (
                              <p className="text-sm text-destructive">Maximum team size must be greater than or equal to minimum team size.</p>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>

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

                    <div className="rounded-[28px] border p-8">
                      <div className="space-y-4">
                        <Label className="text-2xl font-medium text-slate-900">Registration Form</Label>
                        {registrationFieldItems.length > 0 ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            {registrationFieldItems.map((field) => (
                              <div key={field} className="flex items-start justify-between gap-3 rounded-2xl border bg-muted/30 p-4">
                                <div>
                                  <p className="text-base font-medium">{field}</p>
                                  <p className="mt-1 text-sm text-muted-foreground">Registration field</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRegistrationField(field)}
                                  className="rounded-full p-1 text-muted-foreground hover:bg-background hover:text-foreground"
                                  aria-label={`Remove ${field}`}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                            No registration fields added yet.
                          </div>
                        )}

                        <div className="space-y-3">
                          <Label htmlFor="edit-registration-field" className="text-2xl font-medium text-slate-900">Add Fields</Label>
                          <div className="flex gap-3">
                            <Input
                              id="edit-registration-field"
                              value={registrationFieldInput}
                              onChange={(event) => setRegistrationFieldInput(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  handleAddRegistrationField();
                                }
                              }}
                              className="h-14 rounded-2xl text-lg"
                            />
                            <Button type="button" onClick={handleAddRegistrationField} className="h-14 rounded-2xl px-6">
                              Add Field
                            </Button>
                          </div>
                          <p className="text-sm text-slate-500">These fields appear in registration setup and influence preview analytics.</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[28px] border p-8">
                      <div className="space-y-4">
                        <Label className="text-2xl font-medium text-slate-900">Tracks / Themes</Label>
                        <div className="flex gap-3">
                          <Input
                            value={trackInput}
                            onChange={(event) => setTrackInput(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault();
                                handleAddTrack();
                              }
                            }}
                            className="h-14 rounded-2xl text-lg"
                          />
                          <Button type="button" onClick={handleAddTrack} className="h-14 rounded-2xl px-6">
                            Add Track
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {trackItems.map((track) => (
                            <Badge key={track} variant="secondary" className="gap-2 px-3 py-2 text-base">
                              {track}
                              <button type="button" onClick={() => handleRemoveTrack(track)} className="rounded-full">
                                <X className="h-4 w-4" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        {trackItems.length === 0 ? (
                          <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                            No tracks added yet.
                          </div>
                        ) : null}
                        <p className="text-sm text-slate-500">These are shown on the hackathon card and the public preview FAQs.</p>
                      </div>
                    </div>
                  </section>
                </div>
              ) : null}

              {activeEditSection === 'rounds' ? (
                <div className="space-y-8">
                  <section className="space-y-6">
                    <h4 className="text-2xl font-semibold text-slate-900">Rounds & Stages</h4>

                    <div className="rounded-[24px] border border-dashed border-[#1463ff] bg-white p-8">
                      {programStages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4ff] text-[#1463ff]">
                            <ListChecks className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-2xl font-semibold text-slate-900">No round added yet</p>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                              Please click on the Add Round button to create a round.
                            </p>
                          </div>
                          <Button type="button" className="rounded-full px-6" onClick={handleOpenProgramRoundDrawer}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Round
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-lg font-semibold text-slate-900">Configured rounds</p>
                              <p className="text-sm text-slate-500">These rounds are applied after the registration stage.</p>
                            </div>
                            <Button type="button" className="rounded-full px-6" onClick={handleOpenProgramRoundDrawer}>
                              <Plus className="mr-2 h-4 w-4" />
                              Add Round
                            </Button>
                          </div>

                          <div className="space-y-3">
                            {programStages.map((stage) => (
                              <div key={stage.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-3">
                                    <Badge variant="outline">{stage.code}</Badge>
                                    <p className="truncate text-lg font-semibold text-slate-900">{stage.name}</p>
                                  </div>
                                  <p className="mt-2 text-sm text-slate-500">Submission round</p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-full text-slate-500 hover:text-slate-900"
                                  onClick={() => handleRemoveProgramRound(stage.id)}
                                  aria-label={`Remove ${stage.name}`}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-[760px]">
        <SheetHeader className="sr-only">
          <SheetTitle>Edit Screening Round</SheetTitle>
          <SheetDescription>Configure the round type, submission requirements, and evaluation settings.</SheetDescription>
        </SheetHeader>
        <div className="flex min-h-full flex-col bg-white">
          <div className="border-b px-6 pt-6">
            <Tabs value={programRoundDrawerStep} onValueChange={(value) => setProgramRoundDrawerStep(value as RoundDrawerStep)} className="w-full">
              <TabsList className="h-auto w-full justify-start gap-6 rounded-none bg-transparent p-0 text-base">
                <TabsTrigger value="basic" className="rounded-none border-b-[3px] border-transparent px-0 py-4 text-base data-[state=active]:border-[#173f73] data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                  Basic Info
                </TabsTrigger>
                <TabsTrigger
                  value="platform"
                  disabled={programRoundDraft.roundType !== 'SUBMISSION'}
                  className="rounded-none border-b-[3px] border-transparent px-0 py-4 text-base data-[state=active]:border-[#173f73] data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Submission Form
                </TabsTrigger>
                <TabsTrigger
                  value="evaluation"
                  disabled={programRoundDraft.roundType !== 'SUBMISSION'}
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
                        { value: 'SUBMISSION', label: 'Submission', icon: FileUp },
                        { value: 'OFFLINE', label: 'Offline / In-Office / Other', icon: CalendarDays },
                      ] as const).map((option) => {
                        const Icon = option.icon;
                        const active = programRoundDraft.roundType === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            className={cn(
                              'flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition',
                              active ? 'border-[#1463ff] bg-[#eef5ff] text-slate-900' : 'border-slate-200 hover:border-slate-300'
                            )}
                            onClick={() => {
                              setProgramRoundDraft((current) => ({ ...current, roundType: option.value }));
                              setProgramRoundDrawerStep('basic');
                            }}
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
                      value={programRoundDraft.title}
                      onChange={(event) => setProgramRoundDraft((current) => ({ ...current, title: event.target.value }))}
                      className="h-12 rounded-xl"
                    />
                  </FormField>

                  <FormField label="Description" required>
                    <Textarea
                      value={programRoundDraft.description}
                      onChange={(event) => setProgramRoundDraft((current) => ({ ...current, description: event.target.value }))}
                      className="min-h-[120px] rounded-xl"
                    />
                  </FormField>

                  <div className="grid gap-5 md:grid-cols-2">
                    <FormField label="Round Start Date & Time" required>
                      <div className="relative">
                        <Input
                          type="datetime-local"
                          value={programRoundDraft.startAt}
                          onChange={(event) => setProgramRoundDraft((current) => ({ ...current, startAt: event.target.value }))}
                          className="h-12 rounded-xl pr-12"
                        />
                        <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      </div>
                    </FormField>

                    <FormField label="Round End Date & Time" required>
                      <div className="relative">
                        <Input
                          type="datetime-local"
                          value={programRoundDraft.endAt}
                          onChange={(event) => setProgramRoundDraft((current) => ({ ...current, endAt: event.target.value }))}
                          className="h-12 rounded-xl pr-12"
                        />
                        <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      </div>
                    </FormField>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-5">
                    <RadioGroup
                      value={programRoundDraft.eliminationMode}
                      onValueChange={(value) => setProgramRoundDraft((current) => ({ ...current, eliminationMode: value as RoundDraft['eliminationMode'] }))}
                      className="gap-4"
                    >
                      <div className="border-b border-dashed pb-4">
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="ELIMINATION" id="edit-program-elimination" className="mt-1 border-[#173f73] text-[#1463ff]" />
                          <Label htmlFor="edit-program-elimination" className="text-base font-medium leading-7 text-slate-700">
                            Yes. It's an eliminator as I'd like to shortlist participants for the next round.
                          </Label>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="AUTO_ADVANCE" id="edit-program-auto-advance" className="mt-1 border-[#173f73] text-[#1463ff]" />
                        <Label htmlFor="edit-program-auto-advance" className="text-base font-medium leading-7 text-[#1463ff]">
                          No. All participants will move to the next round automatically.
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="platform" className="mt-0 px-6 py-6">
                {programRoundDraft.roundType === 'SUBMISSION' ? (
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
                                checked={programRoundDraft.submissionFieldRequired}
                                onCheckedChange={(checked) => setProgramRoundDraft((current) => ({ ...current, submissionFieldRequired: checked }))}
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
                              value={programRoundDraft.submissionFieldLabel}
                              onChange={(event) => setProgramRoundDraft((current) => ({ ...current, submissionFieldLabel: event.target.value }))}
                              className="h-12 rounded-xl"
                            />
                          </FormField>

                          <FormField label="Remark/Hint">
                            <Input
                              value={programRoundDraft.submissionFieldHint}
                              onChange={(event) => setProgramRoundDraft((current) => ({ ...current, submissionFieldHint: event.target.value }))}
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
                                  const selected = programRoundDraft.submissionAllowedTypes.includes(type);

                                  return (
                                    <button
                                      key={type}
                                      type="button"
                                      className={cn(
                                        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                                        selected ? 'bg-[#1463ff] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                      )}
                                      onClick={() => setProgramRoundDraft((current) => ({
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
                              value={programRoundDraft.submissionMaxSizeMb.toString()}
                              onChange={(event) => setProgramRoundDraft((current) => ({
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
                    Submission Form is needed only for submission rounds.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="evaluation" className="mt-0 px-6 py-6">
                {programRoundDraft.roundType === 'SUBMISSION' ? (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 p-5">
                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4">
                        <span className="text-xl font-medium text-slate-700">Evaluation Fields and Parameters for this Round</span>
                        <Switch
                          checked={programRoundDraft.evaluationEnabled}
                          onCheckedChange={(checked) => setProgramRoundDraft((current) => ({ ...current, evaluationEnabled: checked }))}
                        />
                      </div>

                      <p className="mt-8 text-lg text-slate-700">
                        <span className="font-semibold">Note:</span> The interview evaluation configuration is defined by these parameters.
                      </p>

                      <div className="mt-8 rounded-2xl border border-slate-200">
                        <div className="p-5">
                          <EvaluationCriteriaEditor draft={programRoundDraft} onChange={setProgramRoundDraft} />
                        </div>

                        <div className="grid border-t md:grid-cols-2">
                          <EvaluationToggleRow
                            label="Shortlist button"
                            checked={programRoundDraft.evaluationButtons.shortlist}
                            onCheckedChange={(checked) => setProgramRoundDraft((current) => ({
                              ...current,
                              evaluationButtons: { ...current.evaluationButtons, shortlist: checked },
                            }))}
                          />
                          <EvaluationToggleRow
                            label="Reject button"
                            checked={programRoundDraft.evaluationButtons.reject}
                            leftBorder
                            onCheckedChange={(checked) => setProgramRoundDraft((current) => ({
                              ...current,
                              evaluationButtons: { ...current.evaluationButtons, reject: checked },
                            }))}
                          />
                          <EvaluationToggleRow
                            label="On Hold button"
                            checked={programRoundDraft.evaluationButtons.onHold}
                            onCheckedChange={(checked) => setProgramRoundDraft((current) => ({
                              ...current,
                              evaluationButtons: { ...current.evaluationButtons, onHold: checked },
                            }))}
                          />
                          <EvaluationToggleRow
                            label="No Show button"
                            checked={programRoundDraft.evaluationButtons.noShow}
                            leftBorder
                            onCheckedChange={(checked) => setProgramRoundDraft((current) => ({
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
            <Button variant="ghost" className="text-base font-medium text-slate-700" onClick={() => setProgramRoundDrawerOpen(false)}>
              Close
            </Button>
            <div className="flex items-center gap-3">
              {getPreviousRoundDrawerStep(programRoundDrawerStep, programRoundDraft.roundType) ? (
                <Button
                  variant="outline"
                  className="rounded-full px-8"
                  onClick={() => setProgramRoundDrawerStep(getPreviousRoundDrawerStep(programRoundDrawerStep, programRoundDraft.roundType) ?? 'basic')}
                >
                  Back
                </Button>
              ) : null}
              {getNextRoundDrawerStep(programRoundDrawerStep, programRoundDraft.roundType) ? (
                <Button
                  className="rounded-full px-8"
                  onClick={() => setProgramRoundDrawerStep(getNextRoundDrawerStep(programRoundDrawerStep, programRoundDraft.roundType) ?? 'basic')}
                >
                  Next
                </Button>
              ) : (
                <Button className="rounded-full px-8" onClick={handleCreateProgramRound}>
                  Save
                </Button>
              )}
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
      </Sheet>
    </div>
  );
}

function createEditProgramForm(hackathon: BrowserHackathon): EditProgramForm {
  return {
    title: hackathon.title,
    prizePool: hackathon.prizePool || '',
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
      return 'Provide the core details visitors should understand when they open the public hackathon page.';
    case 'registration':
      return 'Configure participation type, registration window, team size constraints, and the fields expected from applicants.';
    case 'rounds':
      return 'Define the screening rounds that follow registration and configure the tracks shown to participants.';
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

function EvaluationCriteriaEditor({
  draft,
  onChange,
}: {
  draft: RoundDraft;
  onChange: React.Dispatch<React.SetStateAction<RoundDraft>>;
}) {
  const [labelInput, setLabelInput] = useState('');
  const [scoreInput, setScoreInput] = useState('5');

  const handleAddCriterion = () => {
    const trimmedLabel = labelInput.trim();
    const maxScore = Number(scoreInput);

    if (!trimmedLabel || !Number.isFinite(maxScore) || maxScore <= 0) {
      return;
    }

    onChange((current) => {
      const nextCriteria = [
        ...current.evaluationCriteria,
        {
          id: `criterion-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          label: trimmedLabel,
          maxScore,
        },
      ];

      return {
        ...current,
        evaluationCriteria: nextCriteria,
        evaluationMaxScore: getEvaluationCriteriaTotal(nextCriteria),
      };
    });
    setLabelInput('');
    setScoreInput('5');
  };

  const handleRemoveCriterion = (criterionId: string) => {
    onChange((current) => {
      const nextCriteria = current.evaluationCriteria.filter((criterion) => criterion.id !== criterionId);

      return {
        ...current,
        evaluationCriteria: nextCriteria,
        evaluationMaxScore: getEvaluationCriteriaTotal(nextCriteria),
      };
    });
  };

  const handleCriterionScoreChange = (criterionId: string, maxScore: number) => {
    onChange((current) => {
      const nextCriteria = current.evaluationCriteria.map((criterion) => (
        criterion.id === criterionId
          ? { ...criterion, maxScore: Math.max(1, Math.floor(maxScore) || 1) }
          : criterion
      ));

      return {
        ...current,
        evaluationCriteria: nextCriteria,
        evaluationMaxScore: getEvaluationCriteriaTotal(nextCriteria),
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[2rem] font-semibold text-slate-800">Evaluation Criteria</p>
            <p className="mt-1 text-sm text-slate-500">Define how judges should score this round.</p>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total score</p>
            <p className="text-2xl font-semibold text-slate-900">{draft.evaluationMaxScore}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {draft.evaluationCriteria.map((criterion) => (
            <div key={criterion.id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[minmax(0,1fr)_140px_44px] md:items-center">
              <div>
                <p className="text-base font-semibold text-slate-900">{criterion.label}</p>
                <p className="text-sm text-slate-500">Scored criterion</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor={criterion.id} className="text-xs font-semibold uppercase tracking-wide text-slate-500">Max score</Label>
                <Input
                  id={criterion.id}
                  type="number"
                  min={1}
                  value={criterion.maxScore.toString()}
                  onChange={(event) => handleCriterionScoreChange(criterion.id, Number(event.target.value))}
                  className="h-11 rounded-xl"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-6 rounded-full text-slate-500 hover:text-slate-900 md:mt-0"
                onClick={() => handleRemoveCriterion(criterion.id)}
                aria-label={`Remove ${criterion.label}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl border border-dashed border-slate-300 p-4 md:grid-cols-[minmax(0,1fr)_140px_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="criterion-label" className="text-sm font-semibold text-slate-700">Add criterion</Label>
            <Input
              id="criterion-label"
              value={labelInput}
              onChange={(event) => setLabelInput(event.target.value)}
              placeholder="Code quality"
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="criterion-score" className="text-sm font-semibold text-slate-700">Score</Label>
            <Input
              id="criterion-score"
              type="number"
              min={1}
              value={scoreInput}
              onChange={(event) => setScoreInput(event.target.value)}
              className="h-12 rounded-xl"
            />
          </div>
          <Button type="button" className="h-12 rounded-xl px-6" onClick={handleAddCriterion}>
            Add Parameter
          </Button>
        </div>
      </div>
    </div>
  );
}

function getRoundDrawerSteps(roundType: RoundDraft['roundType']): RoundDrawerStep[] {
  return roundType === 'SUBMISSION' ? ['basic', 'platform', 'evaluation'] : ['basic'];
}

function getNextRoundDrawerStep(currentStep: RoundDrawerStep, roundType: RoundDraft['roundType']) {
  const steps = getRoundDrawerSteps(roundType);
  const index = steps.indexOf(currentStep);
  return index >= 0 ? steps[index + 1] ?? null : null;
}

function getPreviousRoundDrawerStep(currentStep: RoundDrawerStep, roundType: RoundDraft['roundType']) {
  const steps = getRoundDrawerSteps(roundType);
  const index = steps.indexOf(currentStep);
  return index > 0 ? steps[index - 1] : null;
}

function getEvaluationCriteriaTotal(criteria: BrowserHackathonEvaluationCriterion[]) {
  return criteria.reduce((total, criterion) => total + criterion.maxScore, 0);
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
    startAt: draft?.startAt,
    endAt: draft?.endAt,
    sourceStageId: insertAfterStage?.id,
    evaluationEnabled: draft?.evaluationEnabled ?? true,
    evaluationMaxScore: draft?.evaluationMaxScore ?? 0,
    evaluationCriteria: draft?.evaluationCriteria ?? [],
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
      startAt: stage.startAt,
      endAt: stage.endAt,
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
  const evaluationCriteria = createDefaultEvaluationCriteria();

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
    evaluationMaxScore: getEvaluationCriteriaTotal(evaluationCriteria),
    evaluationCriteria,
    evaluationButtons: {
      shortlist: true,
      reject: true,
      onHold: true,
      noShow: true,
    },
  };
}

function createDefaultEvaluationCriteria(): BrowserHackathonEvaluationCriterion[] {
  return [
    { id: 'criterion-code-quality', label: 'Code Quality', maxScore: 5 },
    { id: 'criterion-design', label: 'Design', maxScore: 3 },
    { id: 'criterion-presentation', label: 'Presentation', maxScore: 2 },
  ];
}

function formatDateTimeLocal(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  const hours = `${value.getHours()}`.padStart(2, '0');
  const minutes = `${value.getMinutes()}`.padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function mapRegistrationsToTeamRecords(registrations: HackathonRegistrationItem[], stages: StageDefinition[]): TeamRecord[] {
  return registrations.map((registration, index) => ({
    id: registration.id,
    displayName: registration.teamName || registration.participantName,
    participantName: registration.participantName,
    email: registration.participantEmail,
    detail: registration.teamName ? registration.participantName : (registration.track || ''),
    registrationStatus: 'COMPLETE',
    stageEntries: Object.fromEntries(
      stages
        .filter((stage) => stage.type === 'SUBMISSION')
        .map((stage, submissionIndex) => [stage.id, createSubmissionEntry(index, submissionIndex)])
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
      'name,email,registration_status',
      ...records.map((record) => (
        [
          escapeCsv(record.displayName),
          escapeCsv(record.email),
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
      'name,email',
      ...records.map((record) => (
        [escapeCsv(record.displayName), escapeCsv(record.email)].join(',')
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
      'name,email,status,score,panel',
      ...submitted.map((record) => {
        const entry = record.stageEntries[stageId];
        return [
          escapeCsv(record.displayName),
          escapeCsv(record.email),
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
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
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
