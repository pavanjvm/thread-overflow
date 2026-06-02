'use client';

import { type ElementType, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CalendarIcon,
  Copy,
  ImageIcon,
  Italic,
  List,
  ListOrdered,
  Scissors,
  ShieldAlert,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
  Undo2,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  createHackathonSlug,
  getTextFromHtml,
  saveBrowserHackathon,
} from '@/lib/browser-hackathons';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Step = 1 | 2;
type ParticipationType = 'INDIVIDUAL' | 'TEAM';
type EditorCommand = {
  command: string;
  icon: ElementType;
  label: string;
};

const editorCommands: EditorCommand[] = [
  { command: 'bold', icon: Bold, label: 'Bold' },
  { command: 'italic', icon: Italic, label: 'Italic' },
  { command: 'underline', icon: Underline, label: 'Underline' },
  { command: 'strikeThrough', icon: Strikethrough, label: 'Strikethrough' },
  { command: 'justifyLeft', icon: AlignLeft, label: 'Align left' },
  { command: 'justifyCenter', icon: AlignCenter, label: 'Align center' },
  { command: 'justifyRight', icon: AlignRight, label: 'Align right' },
  { command: 'justifyFull', icon: AlignJustify, label: 'Justify' },
  { command: 'insertUnorderedList', icon: List, label: 'Bullet list' },
  { command: 'insertOrderedList', icon: ListOrdered, label: 'Numbered list' },
  { command: 'cut', icon: Scissors, label: 'Cut' },
  { command: 'copy', icon: Copy, label: 'Copy' },
  { command: 'superscript', icon: Superscript, label: 'Superscript' },
  { command: 'subscript', icon: Subscript, label: 'Subscript' },
];

export default function NewHackathonPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const aboutEditorRef = useRef<HTMLDivElement | null>(null);
  const aboutImageInputRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState<Step>(1);
  const [logoName, setLogoName] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [coverName, setCoverName] = useState('');
  const [coverImageDataUrl, setCoverImageDataUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [trackInput, setTrackInput] = useState('');
  const [tracks, setTracks] = useState<string[]>(['AI Ops', 'Developer Tools']);
  const [registrationStart, setRegistrationStart] = useState('');
  const [registrationEnd, setRegistrationEnd] = useState('');
  const [registrationStartDate, setRegistrationStartDate] = useState<Date>();
  const [registrationEndDate, setRegistrationEndDate] = useState<Date>();
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const [participationType, setParticipationType] = useState<ParticipationType>('TEAM');
  const [minTeamSize, setMinTeamSize] = useState('1');
  const [maxTeamSize, setMaxTeamSize] = useState('2');
  const [customFieldInput, setCustomFieldInput] = useState('');
  const [customRegistrationFields, setCustomRegistrationFields] = useState<string[]>([]);
  const [draftSaved, setDraftSaved] = useState(false);
  const [created, setCreated] = useState(false);

  const registrationFields = useMemo(() => {
    const defaultFields = participationType === 'INDIVIDUAL'
      ? ['Full Name', 'Mobile Number', 'Track']
      : ['Team Name', 'Team Leader Name', 'Mobile Number', 'Add Team Members', 'Track'];

    return [...defaultFields, ...customRegistrationFields];
  }, [participationType, customRegistrationFields]);

  const defaultRegistrationFields = useMemo(() => {
    if (participationType === 'INDIVIDUAL') {
      return ['Full Name', 'Mobile Number', 'Track'];
    }

    return ['Team Name', 'Team Leader Name', 'Mobile Number', 'Add Team Members', 'Track'];
  }, [participationType]);

  const canMoveToStepTwo =
    logoName.trim() !== '' &&
    coverName.trim() !== '' &&
    title.trim() !== '' &&
    description.replace(/<[^>]*>/g, '').trim() !== '' &&
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
  };

  const handleRemoveTrack = (track: string) => {
    setTracks((current) => current.filter((item) => item !== track));
  };

  const handleLogoUpload = (file?: File) => {
    if (!file) {
      setLogoName('');
      setLogoDataUrl('');
      return;
    }

    setLogoName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUrl(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (file?: File) => {
    if (!file) {
      setCoverName('');
      setCoverImageDataUrl('');
      return;
    }

    setCoverName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setCoverImageDataUrl(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const handleRegistrationStartSelect = (date?: Date) => {
    if (!date) {
      return;
    }

    setRegistrationStartDate(date);
    setRegistrationStart(format(date, 'dd MMM yyyy'));
    setStartCalendarOpen(false);

    if (registrationEndDate && registrationEndDate < date) {
      setRegistrationEndDate(undefined);
      setRegistrationEnd('');
    }
  };

  const handleRegistrationEndSelect = (date?: Date) => {
    if (!date) {
      return;
    }

    setRegistrationEndDate(date);
    setRegistrationEnd(format(date, 'dd MMM yyyy'));
    setEndCalendarOpen(false);
  };

  const handleAddRegistrationField = () => {
    const trimmed = customFieldInput.trim();

    if (!trimmed || registrationFields.includes(trimmed)) {
      return;
    }

    setCustomRegistrationFields((current) => [...current, trimmed]);
    setCustomFieldInput('');
  };

  const handleRemoveRegistrationField = (field: string) => {
    setCustomRegistrationFields((current) => current.filter((item) => item !== field));
  };

  const syncAboutDescription = () => {
    setDescription(aboutEditorRef.current?.innerHTML ?? '');
  };

  const handleEditorCommand = (command: string) => {
    aboutEditorRef.current?.focus();
    document.execCommand(command);
    syncAboutDescription();
  };

  const handleAboutImageUpload = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      aboutEditorRef.current?.focus();
      document.execCommand('insertImage', false, String(reader.result));
      syncAboutDescription();
    };
    reader.readAsDataURL(file);
  };

  const handleDraftSave = () => {
    setDraftSaved(true);
  };

  const handleCreateHackathon = () => {
    const id = `hackathon-${Date.now()}`;
    const overviewText = getTextFromHtml(description);

    saveBrowserHackathon({
      id,
      slug: createHackathonSlug(title, id),
      title: title.trim(),
      logoDataUrl,
      coverImageDataUrl,
      overviewHtml: description,
      overviewText,
      tracks,
      registrationStart,
      registrationEnd,
      participationType,
      minTeamSize,
      maxTeamSize,
      registrationFields,
      createdAt: new Date().toISOString(),
    });

    router.push('/hackathons');
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
            <div className="rounded-2xl border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Title</p>
              <p className="mt-2 text-lg font-semibold">{title}</p>
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
                    <p className="text-2xl font-medium">Hackathon Details</p>
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
                      onChange={(event) => handleLogoUpload(event.target.files?.[0])}
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
                    <Label className="text-2xl font-medium">Cover Image *</Label>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(event) => handleCoverUpload(event.target.files?.[0])}
                    />
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="relative flex min-h-48 w-full overflow-hidden rounded-2xl border border-dashed bg-muted/30 text-left"
                    >
                      {coverImageDataUrl ? (
                        <img
                          src={coverImageDataUrl}
                          alt="Selected cover preview"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex w-full flex-col items-center justify-center gap-3 p-8 text-muted-foreground">
                          <Upload className="h-8 w-8" />
                          <span className="text-lg font-medium text-foreground">Add Cover Image</span>
                          <span className="text-sm">JPG, JPEG, or PNG</span>
                        </div>
                      )}
                      {coverImageDataUrl && (
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 px-4 py-3 text-sm font-medium text-white">
                          {coverName}
                        </div>
                      )}
                    </button>
                    <p className="text-sm text-orange-600">{coverName ? coverName : 'Cover image required'}</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-2xl font-medium">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Enter title."
                      className="h-16 rounded-2xl text-2xl"
                    />
                    <p className="text-sm text-muted-foreground">Max 190 characters</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="about" className="text-2xl font-medium">About Hackathon *</Label>
                      <p className="mt-2 text-sm text-muted-foreground">Include rules, eligibility, process, format, etc.</p>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white">
                      <div className="flex flex-wrap items-center gap-1 border-b bg-white px-4 py-3">
                        <button
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleEditorCommand('undo');
                          }}
                          className="mr-2 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                          aria-label="Undo"
                        >
                          <Undo2 className="h-5 w-5" />
                        </button>
                        {editorCommands.map(({ command, icon: Icon, label }) => (
                          <button
                            key={command}
                            type="button"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              handleEditorCommand(command);
                            }}
                            className="rounded-md p-2 text-blue-600 hover:bg-blue-50"
                            aria-label={label}
                            title={label}
                          >
                            <Icon className="h-5 w-5" />
                          </button>
                        ))}
                        <input
                          ref={aboutImageInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => {
                            handleAboutImageUpload(event.target.files?.[0]);
                            event.target.value = '';
                          }}
                        />
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => aboutImageInputRef.current?.click()}
                          className="rounded-md p-2 text-blue-600 hover:bg-blue-50"
                          aria-label="Upload image"
                          title="Upload image"
                        >
                          <ImageIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="relative">
                        {!description && (
                          <div className="pointer-events-none absolute inset-x-0 top-0 p-6 text-base text-muted-foreground">
                            Describe the hackathon, who it is for, what participants will build, rules, eligibility, process, and format.
                          </div>
                        )}
                        <div
                          id="about"
                          ref={aboutEditorRef}
                          contentEditable
                          suppressContentEditableWarning
                          onInput={syncAboutDescription}
                          className="min-h-72 w-full overflow-auto p-6 text-base leading-7 outline-none [&_img]:my-4 [&_img]:max-h-80 [&_img]:max-w-full [&_img]:rounded-xl [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
                        />
                      </div>
                    </div>
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
                        <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              id="reg-start"
                              type="button"
                              variant="outline"
                              className={cn(
                                'h-14 w-full justify-start rounded-2xl px-4 text-left text-lg font-normal',
                                !registrationStart && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-3 h-5 w-5" />
                              {registrationStart || 'Select start date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={registrationStartDate}
                              onSelect={handleRegistrationStartSelect}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="reg-end">Registration End</Label>
                        <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              id="reg-end"
                              type="button"
                              variant="outline"
                              className={cn(
                                'h-14 w-full justify-start rounded-2xl px-4 text-left text-lg font-normal',
                                !registrationEnd && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-3 h-5 w-5" />
                              {registrationEnd || 'Select end date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={registrationEndDate}
                              onSelect={handleRegistrationEndSelect}
                              disabled={registrationStartDate ? { before: registrationStartDate } : undefined}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-8 pt-8">
                <div className="space-y-6">
                  <h2 className="text-4xl font-semibold tracking-tight">Hackathon Details & Participation Type</h2>

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
                      {defaultRegistrationFields.map((field) => (
                        <div key={field} className="rounded-2xl border bg-muted/30 p-4">
                          <p className="text-base font-medium">{field}</p>
                          {field === 'Track' ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {tracks.map((track) => (
                                <Badge key={track} variant="secondary">{track}</Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-1 text-sm text-muted-foreground">Required field</p>
                          )}
                        </div>
                      ))}
                      {customRegistrationFields.map((field) => (
                        <div key={field} className="flex items-start justify-between gap-3 rounded-2xl border bg-muted/30 p-4">
                          <div>
                            <p className="text-base font-medium">{field}</p>
                            <p className="mt-1 text-sm text-muted-foreground">Custom field</p>
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

                    <div className="mt-6 space-y-3">
                      <Label htmlFor="custom-field" className="text-2xl font-medium">Add Fields</Label>
                      <div className="flex gap-3">
                        <Input
                          id="custom-field"
                          value={customFieldInput}
                          onChange={(event) => setCustomFieldInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              handleAddRegistrationField();
                            }
                          }}
                          placeholder="Add a field like College Name, GitHub Profile, T-shirt Size"
                          className="h-14 rounded-2xl text-lg"
                        />
                        <Button type="button" onClick={handleAddRegistrationField} className="h-14 rounded-2xl px-6">
                          Add Field
                        </Button>
                      </div>
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
                  <Button onClick={handleCreateHackathon}>
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
