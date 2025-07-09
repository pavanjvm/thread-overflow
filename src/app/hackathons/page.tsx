
import Link from 'next/link';
import { hackathons } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users } from 'lucide-react';
import Image from 'next/image';

export default function HackathonsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Hackathons</h1>
        <p className="text-muted-foreground mt-1">Join challenges, build amazing projects, and win prizes.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hackathons.map((hackathon) => (
          <Link href={`/hackathons/${hackathon.slug}`} key={hackathon.id} className="block">
            <Card className="h-full flex flex-col hover:border-primary/50 transition-colors duration-300 overflow-hidden">
              <div className="relative h-40 w-full">
                  <Image src={hackathon.coverImageUrl} alt={hackathon.title} fill className="object-cover" data-ai-hint="hackathon cover" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <CardTitle className="text-lg">{hackathon.title}</CardTitle>
                <CardDescription className="mt-1 flex-grow">{hackathon.subtitle}</CardDescription>
                <div className="flex justify-between items-center text-sm text-muted-foreground mt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{hackathon.timeline.start} - {hackathon.timeline.end}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{hackathon.projects.length * 5 + 100}+ Participants</span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
