
'use client';

import { useState } from 'react';
import type { SubIdea } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import VoteButtons from './VoteButtons';
import CommentCard from './CommentCard';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { cn, formatRelativeTime } from '@/lib/utils';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

interface SubIdeaCardProps {
  subIdea: SubIdea;
  onCommentAdded?: () => void;
}

const statusConfig = {
  'OPEN_FOR_PROTOTYPING': {
    label: 'Open for prototyping',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
  },
  'SELF_PROTOTYPING': {
    label: 'Self-prototyping',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'
  },
  default: {
    label: 'Unknown Status',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
  }
};

const SubIdeaCard = ({ subIdea, onCommentAdded }: SubIdeaCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [showAddComment, setShowAddComment] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();

  const config = statusConfig[subIdea.status] || statusConfig.default;
  const commentCount = subIdea.comments?.length || 0;

  const handleSubmitComment = async () => {
    if (!commentContent.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/api/comments/${subIdea.id}`, {
        content: commentContent
      }, { withCredentials: true });

      setCommentContent('');
      setShowAddComment(false);
      onCommentAdded?.();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <Card className="hover:border-primary/50 transition-colors duration-300">
      <div className="flex">
        <div className="p-4 flex-shrink-0">
          <VoteButtons initialVotes={subIdea.votes} />
        </div>
        <div className="flex-grow py-4 pr-4">
          <div className="flex justify-between items-start gap-2">
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={subIdea.author.avatarUrl} data-ai-hint="user avatar" />
                  <AvatarFallback>{subIdea.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>Posted by {subIdea.author.name}</span>
                <span>•</span>
                <span>{formatRelativeTime(subIdea.createdAt)}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 text-right">
              <Badge variant="secondary" className={cn('whitespace-nowrap', config.className)}>
                {config.label}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">ID: {subIdea.id}</span>
            </div>
          </div>
          <CardTitle className="mt-1 text-lg">
            {subIdea.title}
          </CardTitle>
          <CardContent className="p-0 mt-2">
            <p className="text-muted-foreground line-clamp-2">{subIdea.description}</p>
          </CardContent>

          {/* Comments Section */}
          <div className="mt-4">
            <div className="flex items-center justify-between border-t border-muted pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleComments}
                className="text-muted-foreground hover:text-foreground flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="font-medium">{commentCount}</span>
                <span>{commentCount === 1 ? 'comment' : 'comments'}</span>
                {showComments ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {currentUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddComment(!showAddComment)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Add Comment
                </Button>
              )}
            </div>

            {showAddComment && currentUser && (
              <div className="mt-3 p-3 bg-muted/30 rounded-lg space-y-2">
                <Textarea
                  placeholder="Share your thoughts on this idea..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleSubmitComment}
                    disabled={isSubmitting || !commentContent.trim()}
                  >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddComment(false);
                      setCommentContent('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {showComments && (
              <div className="mt-3 space-y-3">
                {subIdea.comments && subIdea.comments.length > 0 ? (
                  subIdea.comments.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      subIdeaId={subIdea.id}
                      onCommentAdded={onCommentAdded}
                    />
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No comments yet. Be the first to share your thoughts!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SubIdeaCard;
