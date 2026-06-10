'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, Edit } from 'lucide-react';
import { posts as mockPosts } from '@/lib/mock-data';
import PostCard from '@/components/PostCard';
import { useEffect, useState } from 'react';
import type { Post } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // This user data would typically come from an auth context or API call
  const user = {
    name: 'Test User',
    email: 'test@example.com',
    avatarUrl: 'https://placehold.co/128x128.png',
    bio: 'Software engineer passionate about building modern web applications with Next.js and Tailwind CSS.',
    stars: 125,
    posts: 12,
    comments: 42,
  };

  useEffect(() => {
    // Simulating API call for user's posts
    const filteredPosts = mockPosts.filter(post => post.author.name === 'Alice' && post.status !== 'draft');
    setUserPosts(filteredPosts);
    setLoading(false);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start gap-6">
          <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
            <AvatarImage src={user.avatarUrl} data-ai-hint="user avatar" />
            <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <CardTitle className="text-4xl">{user.name}</CardTitle>
              <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
            </div>
            <CardDescription className="mt-2 text-lg">{user.email}</CardDescription>
            <p className="mt-4 text-muted-foreground">{user.bio}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center border-t pt-6">
            <div className="space-y-1">
              <p className="text-2xl font-bold">{user.stars}</p>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><Star className="h-4 w-4" /> Stars</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{user.posts}</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{user.comments}</p>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><MessageSquare className="h-4 w-4" /> Comments</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent posts and comments.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
          ) : userPosts.length > 0 ? (
            <div className="space-y-6">
              {userPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent activity to show.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
