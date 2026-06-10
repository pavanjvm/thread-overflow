import type { Hackathon } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function InsightsTab({ hackathon }: { hackathon: Hackathon }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        {hackathon.analytics.headline.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-3xl">{metric.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{metric.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Geography mix</CardTitle>
            <CardDescription>Where teams and participants are coming from.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {hackathon.analytics.geography.map((item) => (
              <div key={item.region} className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2 text-sm">
                <span>{item.region}</span>
                <span className="font-semibold">{item.share}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Conversion funnel</CardTitle>
            <CardDescription>The full movement from registrations to finalists.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {hackathon.analytics.funnel.map((item) => (
              <div key={item.stage} className="rounded-xl border px-3 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.stage}</p>
                <p className="mt-1 text-xl font-semibold">{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Engagement signals</CardTitle>
            <CardDescription>Program health indicators beyond just application volume.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {hackathon.analytics.engagement.map((item) => (
              <div key={item.label} className="rounded-xl bg-muted/50 px-3 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-lg font-semibold">{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
