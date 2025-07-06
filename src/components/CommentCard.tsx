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
}

const CommentCard = ({ comment }: CommentCardProps) => {
  const [stars, setStars] = useState(comment.stars);
  const [isStarred, setIsStarred] = useState(false);
  const { toast } = useToast();

  const handleStar = () => {
    const newStarredState = !isStarred;
    setIsStarred(newStarredState);
    setStars(stars + (newStarredState ? 1 : -1));
    toast({
        title: newStarredState ? "Star Awarded!" : "Star Removed",
        description: `You've ${newStarredState ? 'awarded a star to' : 'removed your star from'} ${comment.author.name}'s comment.`,
    })
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
             <Button
                variant="ghost"
                size="sm"
                onClick={handleStar}
                className={cn(isStarred && 'text-yellow-500')}
              >
                <Star className={cn('h-4 w-4 mr-2', isStarred && 'fill-current')} />
                {stars} Star{stars !== 1 ? 's' : ''}
              </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
};

export default CommentCard;
