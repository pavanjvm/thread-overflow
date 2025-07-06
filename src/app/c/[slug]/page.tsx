import { posts, communities } from '@/lib/mock-data';
import PostCard from '@/components/PostCard';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Community } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { notFound } from 'next/navigation';

export default function CommunityPage({ params }: { params: { slug: string } }) {
  const community = communities.find((c) => c.slug === params.slug);
  
  if (!community) {
    notFound();
  }
  
  const communityPosts = posts.filter((post) => post.community.id === community.id && post.status !== 'draft');

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
