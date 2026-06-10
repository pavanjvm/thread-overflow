'use client';

import { posts as mockPosts } from '@/lib/mock-data';
import { notFound, useParams } from 'next/navigation';
import PostView from '@/components/PostView';
import { useEffect, useState } from 'react';
import type { Post } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

export default function PostPage() {
  const params = useParams();
  const id = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const foundPost = mockPosts.find((p) => p.id === id);
      setPost(foundPost || null);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
        <div className="max-w-4xl mx-auto grid md:grid-cols-[64px_1fr] gap-4">
            <div className="flex justify-center">
                <div className="flex flex-col items-center space-y-1">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-6 w-10" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
            <div>
                <Card>
                    <CardHeader className="space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-8 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-5/6" />
                    </CardContent>
                </Card>
                <div className="mt-8">
                    <Skeleton className="h-8 w-48 mb-4" />
                    <Skeleton className="h-px w-full" />
                    <div className="space-y-6 mt-6">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
  }

  if (!post) {
    notFound();
  }

  return <PostView post={post} />;
}
