'use client';

import { useState } from 'react';
import type { Comment } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Reply, ChevronDown, ChevronUp } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

interface CommentCardProps {
  comment: Comment;
  subIdeaId?: number;
  prototypeId?: string;
  onCommentAdded: () => void;
  depth?: number;
}

const CommentCard = ({ comment, subIdeaId, prototypeId, onCommentAdded, depth = 0 }: CommentCardProps) => {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const { currentUser } = useAuth();

  const maxDepth = 3; // Limit nesting depth
  const canReply = depth < maxDepth;

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      // Determine the correct API endpoint based on what we're commenting on
      const endpoint = subIdeaId
        ? `${API_BASE_URL}/api/comments/${subIdeaId}`
        : `${API_BASE_URL}/api/comments/${prototypeId}/prototype`;

      await axios.post(endpoint, {
        content: replyContent,
        parentCommentId: comment.id
      }, { withCredentials: true });

      setReplyContent('');
      setShowReply(false);
      onCommentAdded();
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  return (
    <div className={cn("space-y-2", depth > 0 && "ml-4 border-l-2 border-gray-300 dark:border-gray-600 pl-3")}>
      <div className="flex space-x-2">
        <Avatar className="h-6 w-6 flex-shrink-0 mt-0.5">
          <AvatarImage src={comment.author.avatarUrl || ''} />
          <AvatarFallback className="text-xs">{comment.author.name?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-1">
            <span className="font-medium text-foreground">{comment.author.name}</span>
            <span>•</span>
            <span>{formatRelativeTime(comment.createdAt)}</span>
          </div>

          <div className="text-sm text-foreground mb-2">
            {comment.content}
          </div>

          <div className="flex items-center space-x-3">

            {currentUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReply(!showReply)}
                className="text-muted-foreground hover:text-foreground h-6 px-2 text-xs"
                disabled={!canReply}
                title={!canReply ? "Maximum reply depth reached" : "Reply to this comment"}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
          </div>

          {showReply && canReply && currentUser && (
            <div className="mt-2 space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[60px] text-sm resize-none"
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={handleSubmitReply}
                  disabled={isSubmitting || !replyContent.trim()}
                  className="h-7 text-xs"
                >
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowReply(false);
                    setReplyContent('');
                  }}
                  className="h-7 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleReplies}
            className="text-muted-foreground hover:text-foreground h-6 px-2 text-xs -ml-2"
          >
            {showReplies ? (
              <ChevronUp className="h-3 w-3 mr-1" />
            ) : (
              <ChevronDown className="h-3 w-3 mr-1" />
            )}
            {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </Button>

          {showReplies && (
            <div className="mt-2 space-y-2">
              {comment.replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  subIdeaId={subIdeaId}
                  onCommentAdded={onCommentAdded}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentCard;
