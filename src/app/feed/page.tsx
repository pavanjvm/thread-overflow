'use client';

import { posts as mockPosts } from '@/lib/mock-data';
import PostCard from '@/components/PostCard';
import { useEffect, useState } from 'react';
import type { Post } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating an API call
    const publishedPosts = mockPosts.filter(post => post.status !== 'draft');
    setPosts(publishedPosts);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        All Posts
      </h1>
      <div className="grid gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}
