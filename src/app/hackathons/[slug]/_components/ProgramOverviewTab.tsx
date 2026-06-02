import type { Hackathon } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarRange, Sparkles, Trophy, Users2 } from 'lucide-react';

export default function ProgramOverviewTab({ hackathon }: { hackathon: Hackathon }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Program Narrative</CardTitle>
          <CardDescription>
            This is the operating model for the hackathon: challenge framing, stage progression, and outcome design.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm leading-7 text-muted-foreground">{hackathon.overview}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Theme
              </div>
              <p className="mt-2 font-semibold">{hackathon.theme}</p>
            </div>
            <div className="rounded-2xl bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <Users2 className="h-3.5 w-3.5" />
                Audience
              </div>
              <p className="mt-2 font-semibold">{hackathon.audience}</p>
            </div>
            <div className="rounded-2xl bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <CalendarRange className="h-3.5 w-3.5" />
                Event dates
              </div>
              <p className="mt-2 font-semibold">{hackathon.eventDates.start} to {hackathon.eventDates.end}</p>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold">Participant-facing perks</h3>
            <div className="flex flex-wrap gap-2">
              {hackathon.participantWorkspace.perks.map((perk) => (
                <Badge key={perk} variant="secondary">{perk}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Prize architecture</CardTitle>
            <CardDescription>Rewards are tied to implementation quality and sponsor-fit outcomes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {hackathon.prizes.map((prize) => (
              <div key={prize.rank} className="rounded-2xl border p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <p className="font-semibold">{prize.rank}</p>
                </div>
                <p className="mt-2 text-sm font-medium">{prize.reward}</p>
                <p className="text-sm text-muted-foreground">{prize.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Client brief</CardTitle>
            <CardDescription>The sponsor-side objective and operating motion for this program.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Sponsor</p>
              <p className="font-semibold">{hackathon.clientWorkspace.sponsor}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Objective</p>
              <p className="text-sm text-muted-foreground">{hackathon.clientWorkspace.objective}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Service tier</p>
              <p className="font-medium">{hackathon.clientWorkspace.serviceTier}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
