'use client';

import { useState } from 'react';
import type { Comment } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import { MessageSquare } from 'lucide-react';
import VoteButtons from './VoteButtons';
import { Textarea } from '@/components/ui/textarea';

interface CommentCardProps {
  comment: Comment;
}

const CommentCard = ({ comment }: CommentCardProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatarUrl} data-ai-hint="user avatar" />
          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="w-px flex-grow bg-border my-2"></div>
      </div>
      <div className="flex-grow">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{comment.author.name}</span>
          <span>•</span>
          <span>{comment.createdAt}</span>
        </div>
        <p className="text-foreground mt-2">{comment.content}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <VoteButtons initialVotes={comment.votes} />
          <Button variant="ghost" size="sm" onClick={() => setShowReplyForm(!showReplyForm)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Reply
          </Button>
        </div>
        
        {showReplyForm && (
            <div className="mt-4">
                <Textarea placeholder={`Reply to ${comment.author.name}...`} />
                <div className="flex justify-end mt-2 gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowReplyForm(false)}>Cancel</Button>
                    <Button size="sm">Submit Reply</Button>
                </div>
            </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-6 space-y-6">
            {comment.replies.map(reply => (
              <CommentCard
                key={reply.id}
                comment={reply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentCard;
