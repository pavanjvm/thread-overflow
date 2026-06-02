import type { Hackathon } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientConsoleTab({ hackathon }: { hackathon: Hackathon }) {
  return (
    <div id="client-console" className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        {hackathon.clientWorkspace.metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-3xl">{metric.value}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-sm font-medium">{metric.delta}</p>
              <p className="text-sm text-muted-foreground">{metric.helperText}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline and funnel board</CardTitle>
            <CardDescription>What a client sees while operating the program from demand generation to conversion.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {hackathon.clientWorkspace.pipeline.map((stage) => (
              <div key={stage.label} className="grid gap-3 rounded-2xl border p-4 md:grid-cols-[1.2fr_120px_120px] md:items-center">
                <div>
                  <p className="font-semibold">{stage.label}</p>
                  <p className="text-sm text-muted-foreground">{stage.insight}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Volume</p>
                  <p className="font-semibold">{stage.volume}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Conversion</p>
                  <p className="font-semibold">{stage.conversion}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ops checklist</CardTitle>
              <CardDescription>Daily operator tasks that keep the program inside SLA.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {hackathon.clientWorkspace.opsChecklist.map((item) => (
                <div key={item} className="rounded-xl bg-muted/50 px-3 py-2 text-sm">{item}</div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Judge and sponsor notes</CardTitle>
              <CardDescription>Signals that typically drive pilots, offers, and post-event outcomes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {hackathon.clientWorkspace.judgePanelNotes.map((note) => (
                <div key={note} className="rounded-2xl border p-4">
                  <Badge variant="outline">Insight</Badge>
                  <p className="mt-3 text-sm text-muted-foreground">{note}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
