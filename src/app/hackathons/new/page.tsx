'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, Upload, User, Users, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Step = 1 | 2;
type ParticipationType = 'INDIVIDUAL' | 'TEAM';

export default function NewHackathonPage() {
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState<Step>(1);
  const [logoName, setLogoName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [organisationName, setOrganisationName] = useState(currentUser?.name ?? 'Organisation');
  const [trackInput, setTrackInput] = useState('');
  const [tracks, setTracks] = useState<string[]>(['AI Ops', 'Developer Tools']);
  const [registrationStart, setRegistrationStart] = useState('');
  const [registrationEnd, setRegistrationEnd] = useState('');
  const [participationType, setParticipationType] = useState<ParticipationType>('TEAM');
  const [minTeamSize, setMinTeamSize] = useState('1');
  const [maxTeamSize, setMaxTeamSize] = useState('2');
  const [selectedTrack, setSelectedTrack] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const [created, setCreated] = useState(false);

  const registrationFields = useMemo(() => {
    if (participationType === 'INDIVIDUAL') {
      return ['Full Name', 'Mobile Number', 'Track'];
    }

    return ['Team Name', 'Team Leader Name', 'Mobile Number', 'Add Team Members', 'Track'];
  }, [participationType]);

  const canMoveToStepTwo =
    logoName.trim() !== '' &&
    title.trim() !== '' &&
    description.trim() !== '' &&
    organisationName.trim() !== '' &&
    tracks.length > 0 &&
    registrationStart.trim() !== '' &&
    registrationEnd.trim() !== '';

  const handleAddTrack = () => {
    const trimmed = trackInput.trim();

    if (!trimmed || tracks.includes(trimmed)) {
      return;
    }

    setTracks((current) => [...current, trimmed]);
    setTrackInput('');

    if (!selectedTrack) {
      setSelectedTrack(trimmed);
    }
  };

  const handleRemoveTrack = (track: string) => {
    setTracks((current) => current.filter((item) => item !== track));

    if (selectedTrack === track) {
      setSelectedTrack('');
    }
  };

  const handleDraftSave = () => {
    setDraftSaved(true);
  };

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="mx-auto max-w-2xl w-full text-center">
          <CardHeader>
            <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle className="text-2xl mt-4">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to create a hackathon. This action is available only for admins.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/hackathons">Back to Hackathons</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (created) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 py-8">
        <Card className="overflow-hidden rounded-[28px] border border-slate-200">
          <div className="h-6 bg-gradient-to-r from-sky-500 via-sky-300 to-sky-100" />
          <CardHeader>
            <CardTitle className="text-3xl">Hackathon Draft Created</CardTitle>
            <CardDescription>
              The step-by-step configuration is ready. Next we can shape how the hackathon detail page should behave when someone opens it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Opportunity Title</p>
                <p className="mt-2 text-lg font-semibold">{title}</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Organisation</p>
                <p className="mt-2 text-lg font-semibold">{organisationName}</p>
              </div>
            </div>
            <div className="rounded-2xl border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Tracks</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {tracks.map((track) => (
                  <Badge key={track} variant="secondary">{track}</Badge>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Registration Form</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {registrationFields.map((field) => (
                  <Badge key={field} variant="outline">{field}</Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/hackathons">Back to Hackathons</Link>
              </Button>
              <Button variant="outline" onClick={() => setCreated(false)}>
                Edit Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 py-6">
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Post a Hackathon</h1>
          </div>

          <Card className="rounded-[28px] border border-slate-200 shadow-none">
            <CardContent className="p-8">
              <div className="relative space-y-10">
                <div className="absolute left-[26px] top-11 bottom-11 border-l border-dashed border-slate-300" />

                <button type="button" onClick={() => setStep(1)} className="relative flex w-full items-start gap-4 text-left">
                  <div className={cn(
                    'flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-white text-xl font-semibold shadow-sm',
                    step === 1 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-slate-700'
                  )}>
                    1
                  </div>
                  <div className="pt-1">
                    <p className="text-sm text-muted-foreground">Step 1</p>
                    <p className="text-2xl font-medium">Opportunity details</p>
                  </div>
                </button>

                <button type="button" onClick={() => setStep(2)} className="relative flex w-full items-start gap-4 text-left">
                  <div className={cn(
                    'flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-white text-xl font-semibold shadow-sm',
                    step === 2 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-slate-700'
                  )}>
                    2
                  </div>
                  <div className="pt-1">
                    <p className="text-sm text-muted-foreground">Step 2</p>
                    <p className="text-2xl font-medium">Registration Form</p>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden rounded-[28px] border border-slate-200 shadow-none">
          <div className="h-24 bg-gradient-to-r from-sky-500 via-sky-300 to-sky-100" />
          <CardContent className="space-y-8 p-8 pt-0">
            {step === 1 ? (
              <>
                <div className="flex flex-col gap-4 border-b pb-8 md:flex-row md:items-start">
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(event) => setLogoName(event.target.files?.[0]?.name ?? '')}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-[-64px] flex h-36 w-36 flex-col items-center justify-center rounded-[28px] border bg-white shadow-sm"
                    >
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <Upload className="h-6 w-6" />
                      </div>
                      <span className="text-xl font-medium">{logoName ? 'Change Logo' : 'Add Logo'}</span>
                    </button>
                    <p className="mt-3 text-sm text-orange-600">{logoName ? logoName : 'Logo required'}</p>
                  </div>
                  <div className="pt-2 text-xl text-muted-foreground">
                    Supported logo image JPG, JPEG, or PNG. Max 1 MB
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-2xl font-medium">Opportunity Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Enter Opportunity Title."
                      className="h-16 rounded-2xl text-2xl"
                    />
                    <p className="text-sm text-muted-foreground">Max 190 characters</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="org-name" className="text-2xl font-medium">Organisation Name *</Label>
                    <Input
                      id="org-name"
                      value={organisationName}
                      onChange={(event) => setOrganisationName(event.target.value)}
                      className="h-16 rounded-2xl text-2xl"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="about" className="text-2xl font-medium">About the Opportunity *</Label>
                    <Textarea
                      id="about"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Describe the hackathon, who it is for, what participants will build, and how the process works."
                      className="min-h-40 rounded-2xl text-lg"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-2xl font-medium">Tracks *</Label>
                    <div className="flex gap-3">
                      <Input
                        value={trackInput}
                        onChange={(event) => setTrackInput(event.target.value)}
                        placeholder="Add a track like AI, Web3, Design, Robotics"
                        className="h-14 rounded-2xl text-lg"
                      />
                      <Button type="button" onClick={handleAddTrack} className="h-14 rounded-2xl px-6">
                        Add Track
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tracks.map((track) => (
                        <Badge key={track} variant="secondary" className="gap-2 px-3 py-2 text-base">
                          {track}
                          <button type="button" onClick={() => handleRemoveTrack(track)} className="rounded-full">
                            <X className="h-4 w-4" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-2xl font-medium">Registration Timeline *</Label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <Label htmlFor="reg-start">Registration Start</Label>
                        <Input
                          id="reg-start"
                          value={registrationStart}
                          onChange={(event) => setRegistrationStart(event.target.value)}
                          placeholder="Eg. 12 Aug 2026, 10:00 AM"
                          className="h-14 rounded-2xl text-lg"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="reg-end">Registration End</Label>
                        <Input
                          id="reg-end"
                          value={registrationEnd}
                          onChange={(event) => setRegistrationEnd(event.target.value)}
                          placeholder="Eg. 20 Aug 2026, 11:59 PM"
                          className="h-14 rounded-2xl text-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-8 pt-8">
                <div className="space-y-6">
                  <h2 className="text-4xl font-semibold tracking-tight">Opportunity Mode & Participation Type</h2>

                  <div className="rounded-[28px] border p-8">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label className="text-2xl font-medium">Participation Type</Label>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => setParticipationType('INDIVIDUAL')}
                            className={cn(
                              'flex items-center gap-3 rounded-2xl border border-dashed px-6 py-4 text-xl',
                              participationType === 'INDIVIDUAL' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300'
                            )}
                          >
                            <User className="h-6 w-6" />
                            Individual
                          </button>
                          <button
                            type="button"
                            onClick={() => setParticipationType('TEAM')}
                            className={cn(
                              'flex items-center gap-3 rounded-2xl border border-dashed px-6 py-4 text-xl',
                              participationType === 'TEAM' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300'
                            )}
                          >
                            <Users className="h-6 w-6" />
                            Team Participation
                          </button>
                        </div>
                      </div>

                      {participationType === 'TEAM' && (
                        <div className="space-y-4">
                          <Label className="text-2xl font-medium">Set team size</Label>
                          <div className="grid gap-4 md:grid-cols-2">
                            <Select value={minTeamSize} onValueChange={setMinTeamSize}>
                              <SelectTrigger className="h-16 rounded-2xl text-xl">
                                <SelectValue placeholder="Min team size" />
                              </SelectTrigger>
                              <SelectContent>
                                {['1', '2', '3', '4', '5'].map((value) => (
                                  <SelectItem key={value} value={value}>Min: {value}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={maxTeamSize} onValueChange={setMaxTeamSize}>
                              <SelectTrigger className="h-16 rounded-2xl text-xl">
                                <SelectValue placeholder="Max team size" />
                              </SelectTrigger>
                              <SelectContent>
                                {['2', '3', '4', '5', '6'].map((value) => (
                                  <SelectItem key={value} value={value}>Max: {value}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-3xl font-semibold tracking-tight">Registration Form</h3>
                  <div className="rounded-[28px] border p-8">
                    <div className="grid gap-4 md:grid-cols-2">
                      {registrationFields.map((field) => (
                        <div key={field} className="rounded-2xl border bg-muted/30 p-4">
                          <p className="text-base font-medium">{field}</p>
                          <p className="mt-1 text-sm text-muted-foreground">Required field</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 space-y-3">
                      <Label className="text-2xl font-medium">Track Selection</Label>
                      <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                        <SelectTrigger className="h-16 rounded-2xl text-xl">
                          <SelectValue placeholder="Select a track from the tracks you added" />
                        </SelectTrigger>
                        <SelectContent>
                          {tracks.map((track) => (
                            <SelectItem key={track} value={track}>{track}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <div className="flex items-center justify-between border-t px-8 py-6">
            <div className="text-sm text-muted-foreground">
              {draftSaved ? 'Draft saved locally.' : ''}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={handleDraftSave}>
                Save as Draft
              </Button>
              {step === 1 ? (
                <Button onClick={() => setStep(2)} disabled={!canMoveToStepTwo}>
                  Save and next
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Previous
                  </Button>
                  <Button onClick={() => setCreated(true)} disabled={!selectedTrack && tracks.length > 0}>
                    Create hackathon
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
