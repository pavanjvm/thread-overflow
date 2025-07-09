'use client';

import type { Post } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import VoteButtons from '@/components/VoteButtons';
import CommentCard from '@/components/CommentCard';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import PollDisplay from '@/components/PollDisplay';

interface PostViewProps {
  post: Post;
}

export default function PostView({ post }: PostViewProps) {
  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-[64px_1fr] gap-4">
      <div className="flex justify-center">
        <VoteButtons initialVotes={post.votes} />
      </div>
      <div>
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Avatar className="h-5 w-5">
                <AvatarImage src={post.community.iconUrl} data-ai-hint="community icon" />
                <AvatarFallback>{post.community.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Link href={`/c/${post.community.slug}`} className="font-semibold hover:underline hover:text-primary transition-colors">
                c/{post.community.slug}
              </Link>
              <span className="text-xs">•</span>
              <span>Posted by {post.author.name}</span>
              <span>•</span>
              <span>{post.createdAt}</span>
            </div>
            <CardTitle className="text-3xl">{post.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {post.pollOptions && post.pollOptions.length > 0 && (
                <div className="mb-6">
                    <PollDisplay options={post.pollOptions} />
                </div>
            )}
            <div className="prose dark:prose-invert max-w-none">
              <p>{post.content}</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">{post.comments.length} Comments</h2>
          <Separator />
          <div className="space-y-6 mt-6">
            {post.comments.map((comment) => (
              <CommentCard 
                key={comment.id} 
                comment={comment}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
