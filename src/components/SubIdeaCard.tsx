
'use client';

import type { SubIdea } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import VoteButtons from './VoteButtons';
import Link from 'next/link';

interface SubIdeaCardProps {
  subIdea: SubIdea;
}

const SubIdeaCard = ({ subIdea }: SubIdeaCardProps) => {
  return (
    <Card className="hover:border-primary/50 transition-colors duration-300">
      <div className="flex">
        <div className="p-4 flex-shrink-0">
          <VoteButtons initialVotes={subIdea.votes} />
        </div>
        <div className="flex-grow py-4 pr-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Avatar className="h-5 w-5">
              <AvatarImage src={subIdea.author.avatarUrl} data-ai-hint="user avatar" />
              <AvatarFallback>{subIdea.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>Posted by {subIdea.author.name}</span>
            <span>•</span>
            <span>{subIdea.createdAt}</span>
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
