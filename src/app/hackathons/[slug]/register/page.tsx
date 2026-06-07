'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Loader2, Plus, Search, Users, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { readBrowserHackathonBySlug, saveBrowserHackathon, type BrowserHackathon } from '@/lib/browser-hackathons';
import { searchOrgUsers, type DirectoryUserOption } from '@/lib/graph';
import { createHackathonRegistration, fetchHackathonBySlug } from '@/lib/hackathons';
import { useAuth } from '@/context/AuthContext';

type Teammate = {
  name: string;
  email: string;
};

function normalizeRegistrationFieldLabel(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export default function HackathonRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [hackathon, setHackathon] = useState<BrowserHackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [participantName, setParticipantName] = useState(currentUser?.name ?? '');
  const [participantEmail, setParticipantEmail] = useState(currentUser?.email ?? '');
  const [teamName, setTeamName] = useState('');
  const [track, setTrack] = useState('');
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [teammateQuery, setTeammateQuery] = useState('');
  const [teammateOptions, setTeammateOptions] = useState<DirectoryUserOption[]>([]);
  const [teammateSearchLoading, setTeammateSearchLoading] = useState(false);
  const [teammateSearchError, setTeammateSearchError] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});

  useEffect(() => {
    setParticipantName(currentUser?.name ?? '');
    setParticipantEmail(currentUser?.email ?? '');
  }, [currentUser]);

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
          setLoading(false);
        }
      }
    };

    void loadHackathon();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!hackathon) {
      return;
    }

    if (!track && hackathon.tracks.length > 0) {
      setTrack(hackathon.tracks[0] ?? '');
    }

    setResponses((current) => {
      const next = { ...current };

      for (const field of hackathon.registrationFields) {
        if (!(field in next)) {
          next[field] = '';
        }
      }

      return next;
    });
  }, [hackathon, track]);

  const minTeamSize = useMemo(() => Number(hackathon?.minTeamSize || '1') || 1, [hackathon?.minTeamSize]);
  const maxTeamSize = useMemo(() => Number(hackathon?.maxTeamSize || '1') || 1, [hackathon?.maxTeamSize]);
  const totalTeamSize = 1 + teammates.filter((teammate) => teammate.name.trim() || teammate.email.trim()).length;
  const requiresTrack = (hackathon?.tracks.length ?? 0) > 0;
  const selectedTeammateEmails = useMemo(
    () => new Set(teammates.map((teammate) => teammate.email.trim().toLowerCase()).filter(Boolean)),
    [teammates],
  );
  const visibleRegistrationFields = useMemo(() => {
    if (!hackathon) {
      return [];
    }

    const reservedFields = new Set([
      'full name',
      'name',
      'participant name',
      'lead name',
      'team leader name',
      'team lead name',
      'email',
      'email address',
      'participant email',
      'mobile',
      'mobile number',
      'phone',
      'phone number',
      'contact number',
      'contact no',
      'team name',
      'track',
      'tracks',
      'team members',
      'add team members',
      'teammates',
    ]);

    return hackathon.registrationFields.filter((field) => {
      const normalizedField = normalizeRegistrationFieldLabel(field);

      if (reservedFields.has(normalizedField)) {
        return false;
      }

      return true;
    });
  }, [hackathon]);
  const hasCustomQuestions = visibleRegistrationFields.length > 0;

  const handleAddTeammate = () => {
    if (totalTeamSize >= maxTeamSize) {
      return;
    }

    setTeammates((current) => [...current, { name: '', email: '' }]);
  };

  const handleUpdateTeammate = (index: number, key: keyof Teammate, value: string) => {
    setTeammates((current) => current.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [key]: value } : item
    )));
  };

  const handleRemoveTeammate = (index: number) => {
    setTeammates((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSelectTeammate = (option: DirectoryUserOption) => {
    if (totalTeamSize >= maxTeamSize) {
      return;
    }

    const normalizedEmail = option.email.toLowerCase();
    if (
      normalizedEmail === participantEmail.trim().toLowerCase() ||
      selectedTeammateEmails.has(normalizedEmail)
    ) {
      return;
    }

    setTeammates((current) => [
      ...current,
      {
        name: option.name,
        email: option.email,
      },
    ]);
    setTeammateQuery('');
    setTeammateOptions([]);
    setTeammateSearchError(null);
  };

  useEffect(() => {
    if (hackathon?.participationType !== 'TEAM') {
      return;
    }

    const normalizedQuery = teammateQuery.trim();
    if (normalizedQuery.length < 2) {
      setTeammateOptions([]);
      setTeammateSearchError(null);
      setTeammateSearchLoading(false);
      return;
    }

    let cancelled = false;
    setTeammateSearchLoading(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const results = await searchOrgUsers(normalizedQuery);
        if (cancelled) {
          return;
        }

        const filteredResults = results.filter((user) => {
          const normalizedEmail = user.email.toLowerCase();
          return (
            normalizedEmail !== participantEmail.trim().toLowerCase() &&
            !selectedTeammateEmails.has(normalizedEmail)
          );
        });

        setTeammateOptions(filteredResults);
        setTeammateSearchError(null);
      } catch {
        if (!cancelled) {
          setTeammateOptions([]);
          setTeammateSearchError('Unable to search your organization directory right now. Sign out and sign in again if directory access was just enabled.');
        }
      } finally {
        if (!cancelled) {
          setTeammateSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [hackathon?.participationType, teammateQuery, participantEmail, selectedTeammateEmails]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hackathon || !slug) {
      return;
    }

    const cleanedTeammates = teammates
      .map((teammate) => ({
        name: teammate.name.trim(),
        email: teammate.email.trim(),
      }))
      .filter((teammate) => teammate.name && teammate.email);

    if (hackathon.participationType === 'TEAM') {
      if (!teamName.trim()) {
        toast({
          title: 'Team name is required',
          description: 'Add a team name before submitting the registration.',
          variant: 'destructive',
        });
        return;
      }

      if (1 + cleanedTeammates.length < minTeamSize) {
        toast({
          title: 'Not enough team members',
          description: `This hackathon requires at least ${minTeamSize} team members.`,
          variant: 'destructive',
        });
        return;
      }
    }

    if (requiresTrack && !track) {
      toast({
        title: 'Track selection is required',
        description: 'Choose a track before submitting the registration.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const result = await createHackathonRegistration(slug, {
        participantName: participantName.trim(),
        participantEmail: participantEmail.trim(),
        teamName: hackathon.participationType === 'TEAM' ? teamName.trim() : undefined,
        track: track || undefined,
        teammates: cleanedTeammates,
        formResponses: visibleRegistrationFields.map((field) => ({
          field,
          value: (responses[field] ?? '').trim(),
        })),
      });

      saveBrowserHackathon(result.hackathon);
      toast({
        title: 'Registration submitted',
        description: 'Your registration has been saved for this hackathon.',
      });
      router.push(`/hackathons/${slug}`);
    } catch {
      toast({
        title: 'Unable to submit registration',
        description: 'Please check the form and try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-[420px] rounded-3xl border bg-card" />;
  }

  if (!hackathon) {
    return (
      <Card className="rounded-3xl">
        <CardContent className="space-y-4 p-8 text-center">
          <h1 className="text-2xl font-semibold">Hackathon not found</h1>
          <p className="text-sm text-muted-foreground">The registration form is not available for this hackathon.</p>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/hackathons">Back to hackathons</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Hackathon Registration</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">{hackathon.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete the registration details below. Your registration is tied to your Microsoft account.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/hackathons/${hackathon.slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to hackathon
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Lead Registration</CardTitle>
              <CardDescription>The lead registrant is the logged-in user and will be used for future updates.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="participant-name">Full name</Label>
                <Input
                  id="participant-name"
                  value={participantName}
                  onChange={(event) => setParticipantName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="participant-email">Email</Label>
                <Input
                  id="participant-email"
                  type="email"
                  value={participantEmail}
                  onChange={(event) => setParticipantEmail(event.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Registration Details</CardTitle>
              <CardDescription>
                {hackathon.participationType === 'TEAM'
                  ? `This hackathon accepts teams of ${minTeamSize} to ${maxTeamSize}. Add teammates and complete the remaining details below.`
                  : requiresTrack || hasCustomQuestions
                    ? 'Choose a track and complete the custom registration fields configured for this hackathon.'
                    : 'No extra questions are configured for this hackathon. Review the details and submit your registration.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hackathon.participationType === 'TEAM' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="team-name">Team name</Label>
                    <Input
                      id="team-name"
                      value={teamName}
                      onChange={(event) => setTeamName(event.target.value)}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border bg-muted/30 px-4 py-3">
                    <div>
                      <p className="font-medium">Current team size</p>
                      <p className="text-sm text-muted-foreground">{totalTeamSize} member(s) including you</p>
                    </div>
                    <Badge variant="secondary">{minTeamSize}-{maxTeamSize} allowed</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="teammate-search">Find teammates from your organization</Label>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="teammate-search"
                          placeholder="Search by name or email"
                          value={teammateQuery}
                          onChange={(event) => setTeammateQuery(event.target.value)}
                          className="pl-9"
                          disabled={totalTeamSize >= maxTeamSize}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Start typing at least 2 characters to search the Entra directory.
                      </p>
                      {teammateSearchLoading ? (
                        <div className="flex items-center gap-2 rounded-2xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Searching your organization...
                        </div>
                      ) : null}
                      {teammateSearchError ? (
                        <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                          {teammateSearchError}
                        </div>
                      ) : null}
                      {teammateOptions.length > 0 ? (
                        <div className="overflow-hidden rounded-2xl border">
                          <Command shouldFilter={false}>
                            <CommandList>
                              <CommandEmpty>No teammates found.</CommandEmpty>
                              <CommandGroup>
                                {teammateOptions.map((option) => (
                                  <CommandItem
                                    key={option.id}
                                    value={`${option.name} ${option.email}`}
                                    onSelect={() => handleSelectTeammate(option)}
                                    className="flex items-center justify-between gap-3 px-4 py-3"
                                  >
                                    <div>
                                      <p className="font-medium">{option.name}</p>
                                      <p className="text-xs text-muted-foreground">{option.email}</p>
                                    </div>
                                    <Plus className="h-4 w-4 text-primary" />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </div>
                      ) : null}
                      {!teammateSearchLoading && !teammateSearchError && teammateQuery.trim().length >= 2 && teammateOptions.length === 0 ? (
                        <div className="rounded-2xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                          No matching teammates found in your organization.
                        </div>
                      ) : null}
                    </div>

                    {teammates.map((teammate, index) => (
                      <div key={`teammate-${index}`} className="grid gap-3 rounded-2xl border p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_48px]">
                        <Input
                          placeholder="Teammate name"
                          value={teammate.name}
                          onChange={(event) => handleUpdateTeammate(index, 'name', event.target.value)}
                        />
                        <Input
                          type="email"
                          placeholder="Teammate email"
                          value={teammate.email}
                          onChange={(event) => handleUpdateTeammate(index, 'email', event.target.value)}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveTeammate(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={handleAddTeammate}
                      disabled={totalTeamSize >= maxTeamSize}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add manually
                    </Button>
                  </div>
                </>
              ) : null}

              {requiresTrack ? (
                <div className="space-y-2">
                  <Label>Track</Label>
                  <Select value={track} onValueChange={setTrack}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select a track" />
                    </SelectTrigger>
                    <SelectContent>
                      {hackathon.tracks.map((trackOption) => (
                        <SelectItem key={trackOption} value={trackOption}>{trackOption}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {visibleRegistrationFields.map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={`field-${field}`}>{field}</Label>
                  <Textarea
                    id={`field-${field}`}
                    value={responses[field] ?? ''}
                    onChange={(event) => setResponses((current) => ({ ...current, [field]: event.target.value }))}
                    className="min-h-24 rounded-xl"
                    required
                  />
                </div>
              ))}

              {!requiresTrack && !hasCustomQuestions ? (
                <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                  This registration only needs your participant details. You can submit immediately.
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" className="rounded-full px-8" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit registration'}
            </Button>
          </div>
        </form>

        <aside className="space-y-4">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Registration summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-2xl border bg-muted/30 p-4">
                <p className="font-medium">Participation format</p>
                <p className="mt-1 text-muted-foreground">
                  {hackathon.participationType === 'TEAM'
                    ? `${minTeamSize}-${maxTeamSize} members per team`
                    : 'Individual registration'}
                </p>
              </div>
              <div className="rounded-2xl border bg-muted/30 p-4">
                <p className="font-medium">Registration window</p>
                <p className="mt-1 text-muted-foreground">{hackathon.registrationStart} to {hackathon.registrationEnd}</p>
              </div>
              <div className="rounded-2xl border bg-muted/30 p-4">
                <p className="font-medium">Current registrations</p>
                <p className="mt-1 text-muted-foreground">{hackathon.registrationCount ?? 0} participant(s) registered so far.</p>
              </div>
              {hasCustomQuestions ? (
                <div className="rounded-2xl border bg-muted/30 p-4">
                  <p className="font-medium">Custom questions</p>
                  <ul className="mt-2 space-y-2 text-muted-foreground">
                    {visibleRegistrationFields.map((field) => (
                      <li key={field} className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{field}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {hackathon.participationType === 'TEAM' ? (
                <div className="rounded-2xl border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 font-medium">
                    <Users className="h-4 w-4" />
                    Team reminder
                  </div>
                  <p className="mt-2 text-muted-foreground">
                    Team registrations can be updated later, but you must submit with at least {minTeamSize} members.
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
