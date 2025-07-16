
'use client';

import type { SubIdea } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import VoteButtons from './VoteButtons';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface SubIdeaCardProps {
  subIdea: SubIdea;
}

const statusConfig = {
    'Open for prototyping': { className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
    'Self-prototyping': { className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' },
};

const SubIdeaCard = ({ subIdea }: SubIdeaCardProps) => {
  const config = statusConfig[subIdea.status];
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
                  <span>{subIdea.createdAt}</span>
                </div>
            </div>
            <div className="flex flex-col items-end gap-2 text-right">
              <Badge variant="secondary" className={cn('whitespace-nowrap', config.className)}>
                  {subIdea.status}
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
        </div>
      </div>
    </Card>
  );
};

export default SubIdeaCard;
