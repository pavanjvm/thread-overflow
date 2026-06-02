'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { hackathons } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarRange, Plus, Sparkles, Trophy, Users2 } from 'lucide-react';

export default function HackathonsPage() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

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
        <div className="grid gap-6 lg:grid-cols-2">
          {hackathons.map((hackathon) => (
            <Card key={hackathon.id} className="overflow-hidden">
              <div className="relative h-52 w-full">
              <Image src={hackathon.coverImageUrl} alt={hackathon.title} fill className="object-cover" data-ai-hint="hackathon cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 text-white">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/80">{hackathon.theme}</p>
                  <h2 className="text-2xl font-semibold">{hackathon.title}</h2>
                </div>
                <Badge className="bg-white/15 text-white hover:bg-white/15">{hackathon.status}</Badge>
              </div>
            </div>
            <CardContent className="space-y-5 p-6">
              <div>
                <p className="text-sm font-medium">{hackathon.subtitle}</p>
                <p className="mt-2 text-sm text-muted-foreground">{hackathon.overview}</p>
              </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-muted/50 p-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <CalendarRange className="h-3.5 w-3.5" />
                    Timeline
                  </div>
                  <p className="mt-1 font-medium">{hackathon.eventDates.start} to {hackathon.eventDates.end}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <Users2 className="h-3.5 w-3.5" />
                    Audience
                  </div>
                  <p className="mt-1 font-medium">{hackathon.audience}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    Tracks
                  </div>
                  <p className="mt-1 font-medium">{hackathon.participantWorkspace.tracks.length} tracks</p>
                </div>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <Trophy className="h-3.5 w-3.5" />
                  Top outcomes
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {hackathon.analytics.headline.slice(0, 2).map((metric) => (
                    <div key={metric.label} className="rounded-xl bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                      <p className="mt-1 text-lg font-semibold">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                  Sponsor: <span className="font-medium text-foreground">{hackathon.clientWorkspace.sponsor}</span>
                </div>
                <Button asChild>
                  <Link href={`/hackathons/${hackathon.slug}`}>Open hackathon</Link>
                </Button>
              </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
