'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SimpleVoteButtonsProps {
  initialVotes: number;
}

const SimpleVoteButtons = ({ initialVotes }: SimpleVoteButtonsProps) => {
  const [votes, setVotes] = useState(initialVotes);
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);

  const handleUpvote = () => {
    if (voteStatus === 'up') {
      // Remove upvote
      setVotes(votes - 1);
      setVoteStatus(null);
    } else if (voteStatus === 'down') {
      // Change from downvote to upvote
      setVotes(votes + 2);
      setVoteStatus('up');
    } else {
      // Add upvote
      setVotes(votes + 1);
      setVoteStatus('up');
    }
  };

  const handleDownvote = () => {
    if (voteStatus === 'down') {
      // Remove downvote
      setVotes(votes + 1);
      setVoteStatus(null);
    } else if (voteStatus === 'up') {
      // Change from upvote to downvote
      setVotes(votes - 2);
      setVoteStatus('down');
    } else {
      // Add downvote
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
        className={cn(
          'h-8 w-8 rounded-full transition-colors', 
          voteStatus === 'up' && 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
        )}
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
      <span className="text-lg font-bold w-10 text-center">{votes}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDownvote}
        className={cn(
          'h-8 w-8 rounded-full transition-colors', 
          voteStatus === 'down' && 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
        )}
      >
        <ArrowDown className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default SimpleVoteButtons;
