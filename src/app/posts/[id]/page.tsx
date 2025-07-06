'use client';

import { posts, users } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import VoteButtons from '@/components/VoteButtons';
import CommentCard from '@/components/CommentCard';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import PollDisplay from '@/components/PollDisplay';
import type { Comment } from '@/lib/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function PostPage({ params }: { params: { id: string } }) {
  const post = posts.find((p) => p.id === params.id);
  const { toast } = useToast();

  if (!post) {
    notFound();
  }
  
  // For prototype purposes, assume the logged-in user is the first user.
  const currentUser = users[0];
  const isPostAuthor = post.author.id === currentUser.id;

  const [availableStars, setAvailableStars] = useState(post.availableStars);
  const [postComments, setPostComments] = useState<Comment[]>(post.comments);

  const handleAwardStar = (commentId: string) => {
    if (availableStars <= 0) {
      toast({
        variant: 'destructive',
        title: 'No Stars Left',
        description: 'You have no more stars to award for this post.',
      });
      return;
    }

    let commentFound = false;

    const awardStarRecursively = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          commentFound = true;
          return { ...comment, stars: comment.stars + 1 };
        }
        if (comment.replies && comment.replies.length > 0) {
          return { ...comment, replies: awardStarRecursively(comment.replies) };
        }
        return comment;
      });
    };
    
    const newComments = awardStarRecursively(postComments);

    if (commentFound) {
      setAvailableStars(prev => prev - 1);
      setPostComments(newComments);
      toast({
        title: 'Star Awarded!',
        description: "You've awarded a star to a comment.",
      });
    }
  };

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
          {isPostAuthor && (
            <CardFooter>
                <div className="text-sm text-muted-foreground">You have <span className="font-bold text-primary">{availableStars}</span> stars left to award on this post.</div>
            </CardFooter>
          )}
        </Card>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">{postComments.length} Comments</h2>
          <Separator />
          <div className="space-y-6 mt-6">
            {postComments.map((comment) => (
              <CommentCard 
                key={comment.id} 
                comment={comment}
                isPostAuthor={isPostAuthor}
                availableStars={availableStars}
                onAwardStar={handleAwardStar}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
