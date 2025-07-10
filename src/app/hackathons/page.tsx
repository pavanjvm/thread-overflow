
'use client';

import Link from 'next/link';
import { hackathons as mockHackathons } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Plus } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { Hackathon } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Simulating API call
    setHackathons(mockHackathons);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Hackathons</h1>
          <p className="text-muted-foreground mt-1">Join challenges, build amazing projects, and win prizes.</p>
        </div>
        {currentUser?.role === 'admin' && (
          <Button asChild>
            <Link href="/hackathons/new">
              <Plus className="mr-2 h-4 w-4" /> Create Hackathon
            </Link>
          </Button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-full flex flex-col">
              <Skeleton className="h-40 w-full" />
              <div className="p-6 flex flex-col flex-grow space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex-grow" />
                <div className="flex justify-between items-center mt-4">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
              </div>
            </Card>
          ))
        ) : (
          hackathons.map((hackathon) => (
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
          ))
        )}
      </div>
    </div>
  );
}
