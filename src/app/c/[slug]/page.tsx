import { posts, communities } from '@/lib/mock-data';
import PostCard from '@/components/PostCard';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Community } from '@/lib/types';

export default function CommunityPage({ params }: { params: { slug: string } }) {
  let community: Community | undefined = communities.find((c) => c.slug === params.slug);
  
  if (!community) {
    community = {
        id: `new-${params.slug}`,
        name: params.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        slug: params.slug,
        iconUrl: `https://placehold.co/64x64.png`
    };
  }
  
  const communityPosts = posts.filter((post) => post.community.id === community!.id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={community.iconUrl} data-ai-hint="community icon" />
            <AvatarFallback className="text-2xl">{community.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-3xl">c/{community.slug}</CardTitle>
            <CardDescription className="text-lg">{community.name}</CardDescription>
          </div>
        </CardHeader>
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
