'use client';

import { posts as mockPosts, users } from '@/lib/mock-data';
import PostCard from '@/components/PostCard';
import { useEffect, useState } from 'react';
import type { Post } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DraftsPage() {
  const [draftPosts, setDraftPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For prototype purposes, assume the logged-in user is the first user.
    const currentUser = users[0];
    const filteredDrafts = mockPosts.filter(
      (post) => post.author.id === currentUser.id && post.status === 'draft'
    );
    setDraftPosts(filteredDrafts);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        My Drafts
      </h1>
      <div className="grid gap-6">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))
        ) : draftPosts.length > 0 ? (
          draftPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <p className="text-muted-foreground">You have no saved drafts.</p>
        )}
      </div>
    </div>
  );
}
