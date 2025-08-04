
'use client';

import { notFound, useParams } from 'next/navigation';
import { hackathons as mockHackathons } from '@/lib/mock-data';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { Hackathon } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit } from 'lucide-react';

const ApplyDialog = dynamic(() => import('./_components/ApplyDialog'), {
  ssr: false,
  loading: () => <div className="h-11 w-[125px] rounded-md bg-primary/80 animate-pulse" />
});

export default function HackathonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const slug = params.slug as string;
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (slug) {
      const foundHackathon = mockHackathons.find((h) => h.slug === slug);
      setHackathon(foundHackathon || null);
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <div className="flex justify-center border-b">
                <div className="flex bg-transparent p-0 rounded-none space-x-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
            <div className="py-6">
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    );
  }

  if (!hackathon) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="relative h-64 w-full overflow-hidden rounded-lg bg-card">
        <Image
          src={hackathon.coverImageUrl}
          alt={`${hackathon.title} cover image`}
          fill
          className="object-cover"
          data-ai-hint="hackathon cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-4xl font-bold">{hackathon.title}</h1>
          <p className="text-lg mt-1">{hackathon.subtitle}</p>
        </div>
        <div className="absolute top-6 right-6 flex gap-2">
          {currentUser?.role === 'admin' ? (
             <Button asChild variant="secondary">
                <Link href={`/hackathons/${hackathon.slug}/edit`}>
                  <span className="flex items-center">
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </span>
                </Link>
              </Button>
          ) : (
            <ApplyDialog />
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
