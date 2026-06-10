'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { BrowserHackathon } from '@/lib/browser-hackathons';
import { readBrowserHackathons, writeBrowserHackathons } from '@/lib/browser-hackathons';
import { fetchHackathons } from '@/lib/hackathons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarRange, Plus, Settings2, Sparkles, Users2 } from 'lucide-react';

export default function HackathonsPage() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  const [hackathons, setHackathons] = useState<BrowserHackathon[]>([]);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const loadHackathons = async () => {
      try {
        const nextHackathons = await fetchHackathons();
        if (cancelled) {
          return;
        }

        setHackathons(nextHackathons);
        writeBrowserHackathons(nextHackathons);
      } catch {
        if (!cancelled) {
          setHackathons(readBrowserHackathons());
        }
      }
    };

    void loadHackathons();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      <section className="space-y-4">
        <div className="flex justify-end">
          {isAdmin && (
            <Button asChild>
              <Link href="/hackathons/new">
                <Plus className="mr-2 h-4 w-4" />
                Create hackathon
              </Link>
            </Button>
          )}
        </div>
        {hackathons.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex min-h-72 flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="rounded-full bg-muted p-4">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">No hackathons created yet</h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Create a hackathon to preview it here during this browser session.
                </p>
              </div>
              {isAdmin && (
                <Button asChild>
                  <Link href="/hackathons/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create hackathon
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {hackathons.map((hackathon) => (
              <Card
                key={hackathon.id}
                className="h-full cursor-pointer overflow-hidden transition hover:border-primary hover:shadow-md"
                role="link"
                tabIndex={0}
                onClick={() => router.push(`/hackathons/${hackathon.slug}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    router.push(`/hackathons/${hackathon.slug}`);
                  }
                }}
              >
                  <div className="relative flex min-h-52 w-full items-end bg-gradient-to-br from-sky-600 via-cyan-500 to-emerald-300 p-6 text-white">
                    {hackathon.coverImageDataUrl && (
                      <img
                        src={hackathon.coverImageDataUrl}
                        alt={`${hackathon.title} cover`}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                    <div className="relative z-10 flex w-full items-end justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/80">
                          {hackathon.participationType === 'TEAM' ? 'Team Hackathon' : 'Individual Hackathon'}
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold">{hackathon.title}</h2>
                      </div>
                      <Badge className="bg-white/15 text-white hover:bg-white/15">PLANNING</Badge>
                    </div>
                  </div>
                  <CardContent className="space-y-5 p-6">
                    <div>
                      <p className="text-sm font-medium">Hackathon Details</p>
                      {hackathon.overviewText ? (
                        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                          {hackathon.overviewText}
                        </p>
                      ) : null}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-muted/50 p-3">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                          <CalendarRange className="h-3.5 w-3.5" />
                          Registration
                        </div>
                        <p className="mt-1 font-medium">{hackathon.registrationStart} to {hackathon.registrationEnd}</p>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-3">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                          <Users2 className="h-3.5 w-3.5" />
                          Mode
                        </div>
                        <p className="mt-1 font-medium">
                          {hackathon.participationType === 'TEAM'
                            ? `${hackathon.minTeamSize}-${hackathon.maxTeamSize} members`
                            : 'Individual'}
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-3">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                          <Sparkles className="h-3.5 w-3.5" />
                          Tracks
                        </div>
                        <p className="mt-1 font-medium">{hackathon.tracks.length} tracks</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex justify-end pt-1">
                        <Button
                          type="button"
                          className="rounded-full"
                          onClick={(event) => {
                            event.stopPropagation();
                            router.push(`/hackathons/${hackathon.slug}/manage`);
                          }}
                        >
                          <Settings2 className="mr-2 h-4 w-4" />
                          Manage
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
