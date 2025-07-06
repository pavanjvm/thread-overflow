'use client';

import { useState } from 'react';
import { Comment } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CommentCardProps {
  comment: Comment;
  isPostAuthor: boolean;
  availableStars: number;
  onAwardStar: (commentId: string) => void;
}

const CommentCard = ({ comment, isPostAuthor, availableStars, onAwardStar }: CommentCardProps) => {
  const [localStars, setLocalStars] = useState(comment.stars);
  const { toast } = useToast();

  const handleAward = () => {
    onAwardStar(comment.id);
    // Optimistically update the star count
    if (availableStars > 0) {
        setLocalStars(prev => prev + 1);
    }
  };

  return (
    <Card className="bg-background/50">
      <div className="flex">
        <div className="flex-grow">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Avatar className="h-6 w-6">
                <AvatarImage src={comment.author.avatarUrl} data-ai-hint="user avatar" />
                <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{comment.author.name}</span>
              <span>•</span>
              <span>{comment.createdAt}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">{comment.content}</p>
          </CardContent>
          <CardFooter>
             {isPostAuthor ? (
                <Button variant="outline" size="sm" onClick={handleAward} disabled={availableStars <= 0}>
                    <Star className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-400" />
                    Award Star
                </Button>
             ) : (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground font-medium">
                   <Star className={cn('h-4 w-4', localStars > 0 ? 'text-yellow-500 fill-yellow-400' : 'text-muted-foreground')} />
                   <span>{localStars} Star{localStars !== 1 ? 's' : ''}</span>
                </div>
             )}
          </CardFooter>
        </div>
      </div>
    </Card>
  );
};

export default CommentCard;
