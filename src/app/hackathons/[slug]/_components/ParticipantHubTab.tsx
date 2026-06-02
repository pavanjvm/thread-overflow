import type { Hackathon } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ParticipantHubTab({ hackathon }: { hackathon: Hackathon }) {
  return (
    <div id="participant-hub" className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Eligibility and onboarding</CardTitle>
            <CardDescription>The participant-side guardrails for entering and staying active in the program.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {hackathon.participantWorkspace.eligibility.map((item) => (
              <div key={item} className="rounded-xl border px-3 py-2 text-sm text-muted-foreground">{item}</div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Builder toolkit</CardTitle>
            <CardDescription>Artifacts and resources unlocked to keep teams moving through stages.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {hackathon.participantWorkspace.toolkit.map((item) => (
              <Badge key={item} variant="secondary">{item}</Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tracks and team progress</CardTitle>
          <CardDescription>These are the participant-facing workstreams, due items, and current status calls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hackathon.participantWorkspace.tracks.map((track) => (
            <div key={track.id} className="rounded-2xl border p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{track.title}</p>
                    <Badge variant="outline">{track.stage}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{track.description}</p>
                </div>
                <Badge>{track.teamStatus}</Badge>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Next deliverable</p>
                  <p className="mt-1 font-medium">{track.deliverable}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Due by</p>
                  <p className="mt-1 font-medium">{track.dueBy}</p>
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-2xl border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Leaderboard snapshot</p>
                <p className="text-sm text-muted-foreground">Top teams by current score and reviewer confidence.</p>
              </div>
              <Badge variant="secondary">Live</Badge>
            </div>
            <div className="mt-4 space-y-3">
              {hackathon.participantWorkspace.leaderboard.map((entry) => (
                <div key={entry.rank} className="grid gap-3 rounded-xl bg-muted/50 p-3 sm:grid-cols-[60px_1fr_100px] sm:items-center">
                  <p className="text-lg font-semibold">{entry.rank}</p>
                  <div>
                    <p className="font-medium">{entry.teamName}</p>
                    <p className="text-sm text-muted-foreground">{entry.highlight}</p>
                  </div>
                  <p className="text-right text-lg font-semibold">{entry.score}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
