'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoteButtonsProps {
  initialVotes: number;
}

const VoteButtons = ({ initialVotes }: VoteButtonsProps) => {
  const [votes, setVotes] = useState(initialVotes);
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);

  const handleUpvote = () => {
    if (voteStatus === 'up') {
      setVotes(votes - 1);
      setVoteStatus(null);
    } else if (voteStatus === 'down') {
      setVotes(votes + 2);
      setVoteStatus('up');
    } else {
      setVotes(votes + 1);
      setVoteStatus('up');
    }
  };

  const handleDownvote = () => {
    if (voteStatus === 'down') {
      setVotes(votes + 1);
      setVoteStatus(null);
    } else if (voteStatus === 'up') {
      setVotes(votes - 2);
      setVoteStatus('down');
    } else {
      setVotes(votes - 1);
      setVoteStatus('down');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleUpvote}
        className={cn('h-8 w-8 rounded-full', voteStatus === 'up' && 'bg-accent text-accent-foreground')}
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
      <span className="text-lg font-bold w-10 text-center">{votes}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDownvote}
        className={cn('h-8 w-8 rounded-full', voteStatus === 'down' && 'bg-primary text-primary-foreground')}
      >
        <ArrowDown className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default VoteButtons;
