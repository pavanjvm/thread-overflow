import type { Hackathon } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OverviewTab({ hackathon }: { hackathon: Hackathon }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About the Hackathon</CardTitle>
      </CardHeader>
      <CardContent className="prose dark:prose-invert max-w-none">
        <p>{hackathon.overview}</p>
      </CardContent>
    </Card>
  );
}
