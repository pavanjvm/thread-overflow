'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Clock3, ExternalLink, FileText, GitBranch, Link2, PlayCircle, Trophy, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { readBrowserHackathonBySlug, saveBrowserHackathon, type BrowserHackathon, type BrowserHackathonStage } from '@/lib/browser-hackathons';
import {
  fetchHackathonBySlug,
  fetchMyHackathonRegistration,
  type HackathonRegistrationDetailItem,
  type HackathonRegistrationSubmissionItem,
  upsertMyHackathonStageSubmission,
} from '@/lib/hackathons';

type SubmissionFormState = {
  projectTitle: string;
  summary: string;
  demoUrl: string;
  repositoryUrl: string;
  videoUrl: string;
  deckUrl: string;
  additionalNotes: string;
};

function emptyForm(): SubmissionFormState {
  return {
    projectTitle: '',
    summary: '',
    demoUrl: '',
    repositoryUrl: '',
    videoUrl: '',
    deckUrl: '',
    additionalNotes: '',
  };
}

function createFormFromSubmission(submission?: HackathonRegistrationSubmissionItem): SubmissionFormState {
  return {
    projectTitle: submission?.projectTitle ?? '',
    summary: submission?.summary ?? '',
    demoUrl: submission?.demoUrl ?? '',
    repositoryUrl: submission?.repositoryUrl ?? '',
    videoUrl: submission?.videoUrl ?? '',
    deckUrl: submission?.deckUrl ?? '',
    additionalNotes: submission?.additionalNotes ?? '',
  };
}

function getSubmissionStatus(submission?: HackathonRegistrationSubmissionItem) {
  if (!submission) {
    return {
      label: 'Not Started',
      tone: 'neutral' as const,
      description: 'This round is available, but your team has not started a submission yet.',
    };
  }

  if (!submission.submitted) {
    return {
      label: 'Draft Saved',
      tone: 'info' as const,
      description: 'Your team has a draft saved. Submit it before the round deadline for review.',
    };
  }

  if (submission.status === 'SHORTLISTED') {
    return {
      label: 'Shortlisted',
      tone: 'success' as const,
      description: 'Your team has been selected for the next step in this hackathon.',
    };
  }

  if (submission.status === 'REJECTED') {
    return {
      label: 'Not Selected',
      tone: 'danger' as const,
      description: submission.decisionNote || 'This round has been reviewed and your team was not shortlisted.',
    };
  }

  return {
    label: 'Under Review',
    tone: 'warning' as const,
    description: 'Your submission was sent successfully and is waiting for organizer review.',
  };
}

function getStatusClasses(tone: 'neutral' | 'info' | 'warning' | 'success' | 'danger') {
  return {
    neutral: 'bg-slate-100 text-slate-700',
    info: 'bg-blue-50 text-blue-700',
    warning: 'bg-amber-50 text-amber-700',
    success: 'bg-emerald-50 text-emerald-700',
    danger: 'bg-red-50 text-red-700',
  }[tone];
}

function getStageWindowLabel(stage: BrowserHackathonStage) {
  if (!stage.startAt && !stage.endAt) {
    return 'Window to be announced';
  }

  if (stage.startAt && stage.endAt) {
    return `${stage.startAt} to ${stage.endAt}`;
  }

  return stage.startAt ?? stage.endAt ?? 'Window to be announced';
}

function canEditSubmission(stage: BrowserHackathonStage) {
  if (!stage.startAt || !stage.endAt) {
    return true;
  }

  const now = Date.now();
  const startAt = new Date(stage.startAt).getTime();
  const endAt = new Date(stage.endAt).getTime();

  if (Number.isNaN(startAt) || Number.isNaN(endAt)) {
    return true;
  }

  return now >= startAt && now <= endAt;
}

export default function HackathonSubmissionPage() {
  const params = useParams();
  const { toast } = useToast();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [hackathon, setHackathon] = useState<BrowserHackathon | null>(null);
  const [registration, setRegistration] = useState<HackathonRegistrationDetailItem | null>(null);
  const [selectedStageId, setSelectedStageId] = useState('');
  const [form, setForm] = useState<SubmissionFormState>(() => emptyForm());
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) {
      return;
    }

    let cancelled = false;

    const loadPage = async () => {
      try {
        const [hackathonDetail, registrationDetail] = await Promise.all([
          fetchHackathonBySlug(slug).catch(() => readBrowserHackathonBySlug(slug)),
          fetchMyHackathonRegistration(slug),
        ]);

        if (cancelled) {
          return;
        }

        setHackathon(hackathonDetail);
        if (hackathonDetail) {
          saveBrowserHackathon(hackathonDetail);
        }
        setRegistration(registrationDetail);
        const firstStageId = hackathonDetail?.stages?.find((stage) => stage.type === 'SUBMISSION')?.id ?? '';
        setSelectedStageId(firstStageId);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadPage();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const submissionStages = useMemo(
    () => hackathon?.stages?.filter((stage) => stage.type === 'SUBMISSION') ?? [],
    [hackathon],
  );
  const selectedStage = useMemo(
    () => submissionStages.find((stage) => stage.id === selectedStageId) ?? submissionStages[0] ?? null,
    [selectedStageId, submissionStages],
  );
  const selectedSubmission = useMemo(
    () => registration?.submissions.find((submission) => submission.stageId === selectedStage?.id),
    [registration, selectedStage?.id],
  );
  const status = getSubmissionStatus(selectedSubmission);
  const editable = selectedStage ? canEditSubmission(selectedStage) : false;

  useEffect(() => {
    setForm(createFormFromSubmission(selectedSubmission));
  }, [selectedSubmission?.stageId, selectedSubmission?.projectTitle, selectedSubmission?.summary, selectedSubmission?.demoUrl, selectedSubmission?.repositoryUrl, selectedSubmission?.videoUrl, selectedSubmission?.deckUrl, selectedSubmission?.additionalNotes]);

  const handleSave = async (submitted: boolean) => {
    if (!slug || !selectedStage) {
      return;
    }

    try {
      if (submitted) {
        setSubmitting(true);
      } else {
        setSavingDraft(true);
      }

      const updatedRegistration = await upsertMyHackathonStageSubmission(slug, selectedStage.id, {
        ...form,
        submitted,
      });

      setRegistration(updatedRegistration);
      toast({
        title: submitted ? 'Submission sent' : 'Draft saved',
        description: submitted
          ? 'Your team submission is now waiting for organizer review.'
          : 'Your draft was saved for this round.',
      });
    } catch {
      toast({
        title: submitted ? 'Unable to submit project' : 'Unable to save draft',
        description: 'Please review the submission details and try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingDraft(false);
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-[520px] rounded-3xl border bg-card" />;
  }

  if (!hackathon) {
    return (
      <Card className="rounded-3xl">
        <CardContent className="space-y-4 p-8 text-center">
          <h1 className="text-2xl font-semibold">Hackathon not found</h1>
          <Button asChild>
            <Link href="/hackathons">Back to hackathons</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!registration) {
    return (
      <Card className="rounded-3xl">
        <CardContent className="space-y-4 p-8 text-center">
          <h1 className="text-2xl font-semibold">Register before submitting</h1>
          <p className="text-sm text-muted-foreground">
            Your team needs a hackathon registration before the submission portal can be used.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href={`/hackathons/${hackathon.slug}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to hackathon
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/hackathons/${hackathon.slug}/register`}>Register now</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (submissionStages.length === 0) {
    return (
      <Card className="rounded-3xl">
        <CardContent className="space-y-4 p-8 text-center">
          <h1 className="text-2xl font-semibold">Submission rounds are not open yet</h1>
          <p className="text-sm text-muted-foreground">
            This hackathon does not have any submission stages configured yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Submission Portal</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">{hackathon.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Save a draft, submit during the round window, and track whether your team is shortlisted from the same page.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/hackathons/${hackathon.slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to hackathon
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4">
          {submissionStages.map((stage) => {
            const submission = registration.submissions.find((item) => item.stageId === stage.id);
            const stageStatus = getSubmissionStatus(submission);

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setSelectedStageId(stage.id)}
                className={[
                  'w-full rounded-3xl border p-4 text-left transition',
                  selectedStage?.id === stage.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:border-primary/40',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-muted-foreground">{stage.code}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(stageStatus.tone)}`}>
                    {stageStatus.label}
                  </span>
                </div>
                <p className="mt-3 text-lg font-semibold">{stage.name}</p>
                <p className="mt-2 text-sm text-muted-foreground">{getStageWindowLabel(stage)}</p>
              </button>
            );
          })}
        </aside>

        <div className="space-y-6">
          {selectedStage ? (
            <>
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-4">
                    <span>{selectedStage.name}</span>
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(status.tone)}`}>
                      {status.label}
                    </span>
                  </CardTitle>
                  <CardDescription>{status.description}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-4">
                  <SummaryTile icon={Clock3} label="Submission window" value={getStageWindowLabel(selectedStage)} />
                  <SummaryTile icon={CheckCircle2} label="Current stage" value={selectedStage.code} />
                  <SummaryTile icon={Trophy} label="Score" value={selectedSubmission?.score || '--'} />
                  <SummaryTile icon={FileText} label="Review note" value={selectedSubmission?.decisionNote || 'No note yet'} />
                </CardContent>
              </Card>

              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>Project Submission</CardTitle>
                  <CardDescription>
                    Typical hackathon submissions include a project summary plus at least one working artifact such as a demo, repository, video, or deck.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {!editable ? (
                    <div className="rounded-2xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                      This round is outside its submission window, so the form is read-only.
                    </div>
                  ) : null}

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="project-title">Project title</Label>
                      <Input
                        id="project-title"
                        value={form.projectTitle}
                        onChange={(event) => setForm((current) => ({ ...current, projectTitle: event.target.value }))}
                        disabled={!editable}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="project-summary">Project summary</Label>
                      <Textarea
                        id="project-summary"
                        value={form.summary}
                        onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
                        className="min-h-32"
                        disabled={!editable}
                      />
                    </div>

                    <LinkField
                      id="demo-url"
                      label="Demo URL"
                      value={form.demoUrl}
                      icon={Link2}
                      disabled={!editable}
                      onChange={(value) => setForm((current) => ({ ...current, demoUrl: value }))}
                    />
                    <LinkField
                      id="repository-url"
                      label="Repository URL"
                      value={form.repositoryUrl}
                      icon={GitBranch}
                      disabled={!editable}
                      onChange={(value) => setForm((current) => ({ ...current, repositoryUrl: value }))}
                    />
                    <LinkField
                      id="video-url"
                      label="Video URL"
                      value={form.videoUrl}
                      icon={PlayCircle}
                      disabled={!editable}
                      onChange={(value) => setForm((current) => ({ ...current, videoUrl: value }))}
                    />
                    <LinkField
                      id="deck-url"
                      label="Deck / Presentation URL"
                      value={form.deckUrl}
                      icon={ExternalLink}
                      disabled={!editable}
                      onChange={(value) => setForm((current) => ({ ...current, deckUrl: value }))}
                    />

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="submission-notes">Additional notes</Label>
                      <Textarea
                        id="submission-notes"
                        value={form.additionalNotes}
                        onChange={(event) => setForm((current) => ({ ...current, additionalNotes: event.target.value }))}
                        className="min-h-28"
                        disabled={!editable}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!editable || savingDraft || submitting}
                      onClick={() => void handleSave(false)}
                    >
                      {savingDraft ? 'Saving draft...' : 'Save draft'}
                    </Button>
                    <Button
                      type="button"
                      disabled={!editable || savingDraft || submitting}
                      onClick={() => void handleSave(true)}
                    >
                      {submitting ? 'Submitting...' : 'Submit for review'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>How selection works</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-3">
                  <StatusInfo icon={FileText} title="Draft" description="Your team can save work without sending it for review yet." />
                  <StatusInfo icon={Clock3} title="Under Review" description="Once submitted, the round waits for organizer evaluation." />
                  <StatusInfo icon={selectedSubmission?.status === 'REJECTED' ? XCircle : Trophy} title="Shortlisted / Not Selected" description="Organizers change the round status after evaluation, and you see it here immediately." />
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-muted/20 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-3 text-sm font-medium">{value}</p>
    </div>
  );
}

function LinkField({
  id,
  label,
  value,
  icon: Icon,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  icon: typeof Link2;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pl-9"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function StatusInfo({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border bg-muted/20 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/80">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 font-semibold">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
