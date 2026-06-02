'use client';

import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { hackathons } from '@/lib/mock-data';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, CalendarRange, Edit, Sparkles, Users2 } from 'lucide-react';

const ApplyDialog = dynamic(() => import('./_components/ApplyDialog'), {
  ssr: false,
  loading: () => <div className="h-11 w-[144px] rounded-md bg-primary/80 animate-pulse" />,
});

export default function HackathonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { currentUser } = useAuth();
  const hackathon = hackathons.find((item) => item.slug === slug);

  if (!hackathon) {
    notFound();
  }

  const isClient = currentUser?.role === 'ADMIN';

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border">
        <div className="relative min-h-[320px]">
          <Image
            src={hackathon.coverImageUrl}
            alt={`${hackathon.title} cover image`}
            fill
            className="object-cover"
            data-ai-hint="hackathon cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/55 to-slate-900/20" />
          <div className="relative z-10 flex min-h-[320px] flex-col justify-between gap-8 px-6 py-8 text-white md:px-10">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-cyan-400/15 text-cyan-100 hover:bg-cyan-400/15">{hackathon.status}</Badge>
              <Badge variant="outline" className="border-white/20 text-white">{hackathon.format}</Badge>
              <Badge variant="outline" className="border-white/20 text-white">{hackathon.theme}</Badge>
            </div>
            <div className="grid gap-8 lg:grid-cols-[1.35fr_0.85fr] lg:items-end">
              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{hackathon.title}</h1>
                  <p className="mt-3 max-w-3xl text-lg text-white/80">{hackathon.subtitle}</p>
                </div>
                <p className="max-w-3xl text-sm leading-6 text-white/70">{hackathon.overview}</p>
                <div className="flex flex-wrap gap-3">
                  {isClient ? (
                    <>
                      <Button asChild variant="secondary">
                        <Link href={`/hackathons/${hackathon.slug}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit program
                        </Link>
                      </Button>
                      <Button asChild className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                        <Link href={`/hackathons/${hackathon.slug}#client-console`}>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Open client console
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <ApplyDialog />
                      <Button asChild variant="secondary">
                        <Link href={`/hackathons/${hackathon.slug}#participant-hub`}>
                          <Users2 className="mr-2 h-4 w-4" />
                          Open participant hub
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/60">
                    <CalendarRange className="h-3.5 w-3.5" />
                    Program window
                  </div>
                  <p className="mt-2 text-lg font-semibold">{hackathon.eventDates.start} to {hackathon.prizeAnnouncement.end}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/60">
                    <Sparkles className="h-3.5 w-3.5" />
                    Active stage
                  </div>
                  <p className="mt-2 text-lg font-semibold">{hackathon.stages.find((stage) => stage.status === 'ACTIVE')?.name ?? 'Showcase prep'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/60">
                    <Users2 className="h-3.5 w-3.5" />
                    Sponsor
                  </div>
                  <p className="mt-2 text-lg font-semibold">{hackathon.clientWorkspace.sponsor}</p>
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
