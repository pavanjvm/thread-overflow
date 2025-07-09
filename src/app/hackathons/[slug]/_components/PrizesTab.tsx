import type { Hackathon } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export default function PrizesTab({ hackathon }: { hackathon: Hackathon }) {
  const prizeColors = ['text-yellow-500', 'text-slate-400', 'text-orange-400'];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {hackathon.prizes.map((prize, index) => (
        <Card key={prize.rank}>
          <CardHeader className="text-center">
            <Trophy className={`mx-auto h-12 w-12 ${prizeColors[index % prizeColors.length]}`} />
            <CardTitle className="text-2xl mt-2">{prize.rank}</CardTitle>
            <CardDescription className="text-xl font-bold text-primary">{prize.reward}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">{prize.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
