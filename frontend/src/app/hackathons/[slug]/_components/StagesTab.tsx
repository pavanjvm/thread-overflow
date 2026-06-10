import type { Hackathon } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const stageTone: Record<Hackathon['stages'][number]['status'], string> = {
  COMPLETED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  ACTIVE: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
  UPCOMING: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
};

export default function StagesTab({ hackathon }: { hackathon: Hackathon }) {
  return (
    <div className="grid gap-6">
      {hackathon.stages.map((stage, index) => (
        <Card key={stage.id}>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Stage {index + 1}</Badge>
                <Badge className={stageTone[stage.status]}>{stage.status}</Badge>
              </div>
              <CardTitle>{stage.name}</CardTitle>
              <CardDescription>{stage.objective}</CardDescription>
            </div>
            <div className="rounded-2xl bg-muted/50 px-4 py-3 text-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Owner</p>
              <p className="font-semibold">{stage.owner}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">Window</p>
              <p className="font-medium">{stage.window}</p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Stage completion</span>
                  <span className="font-medium">{stage.completion}%</span>
                </div>
                <Progress value={stage.completion} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Required deliverables</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {stage.deliverables.map((deliverable) => (
                    <li key={deliverable} className="rounded-xl bg-muted/50 px-3 py-2">{deliverable}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Submissions</p>
                <p className="mt-1 text-xl font-semibold">{stage.analytics.submissions}</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Conversion</p>
                <p className="mt-1 text-xl font-semibold">{stage.analytics.conversion}</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Ops SLA</p>
                <p className="mt-1 text-xl font-semibold">{stage.analytics.sla}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
