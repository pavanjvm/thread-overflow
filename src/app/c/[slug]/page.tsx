'use client';

import { posts as mockPosts, communities as mockCommunities } from '@/lib/mock-data';
import PostCard from '@/components/PostCard';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Community, Post } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommunityPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [community, setCommunity] = useState<Community | null>(null);
  const [communityPosts, setCommunityPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      const foundCommunity = mockCommunities.find((c) => c.slug === slug);
      
      if (foundCommunity) {
        setCommunity(foundCommunity);
        const filteredPosts = mockPosts.filter((post) => post.community.id === foundCommunity.id && post.status !== 'draft');
        setCommunityPosts(filteredPosts);
      }
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Card>
          <div className="px-6">
            <div className="flex items-end gap-4 -mt-10">
              <Skeleton className="h-24 w-24 rounded-full border-4 border-card" />
              <div className="py-2 flex-grow space-y-2">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <div className="py-2">
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
          <CardContent className="pt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-6 w-24" />
          </CardFooter>
        </Card>
        <Skeleton className="h-8 w-48 mt-4" />
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!community) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="relative h-48 w-full overflow-hidden rounded-lg bg-card">
        <Image
          src={community.coverImageUrl}
          alt={`${community.name} cover image`}
          fill
          className="object-cover"
          data-ai-hint="community cover"
        />
      </div>

      <Card>
        <div className="px-6">
          <div className="flex items-end gap-4 -mt-10">
            <Avatar className="h-24 w-24 border-4 border-card">
              <AvatarImage src={community.iconUrl} data-ai-hint="community icon" />
              <AvatarFallback className="text-4xl">{community.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="py-2 flex-grow">
              <CardTitle className="text-3xl">{community.name}</CardTitle>
              <CardDescription>c/{community.slug}</CardDescription>
            </div>
            <div className="py-2">
              <Button>Join Community</Button>
            </div>
          </div>
        </div>
        <CardContent className="pt-4">
          <p className="text-muted-foreground">{community.description}</p>
        </CardContent>
        <CardFooter>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <span className="font-bold">{community.members.toLocaleString()}</span> members
          </div>
        </CardFooter>
      </Card>
      
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        Posts in c/{community.slug}
      </h2>
      
      <div className="grid gap-6">
        {communityPosts.length > 0 ? (
          communityPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <p className="text-muted-foreground">No posts in this community yet.</p>
        )}
      </div>
    </div>
  );
}
