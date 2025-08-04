'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoteButtonsProps {
  initialVotes: number;
  itemId: string | number;
  type: 'prototype' | 'subidea';
}

const VoteButtons = ({ initialVotes, itemId, type }: VoteButtonsProps) => {
  const [votes, setVotes] = useState(initialVotes);
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

// Fetch current vote data
  const fetchVoteData = async () => {
    try {
      const url = `${API_BASE_URL}/api/votes/${type === 'prototype' ? 'prototypes' : 'subideas'}?${type === 'prototype' ? 'prototypeId' : 'subIdeaId'}=${itemId}`;
      const response = await axios.get(url, { withCredentials: true });
      const { voteCounts, userVote } = response.data;
      
      setVotes(voteCounts.total);
      setVoteStatus(userVote === 1 ? 'up' : userVote === -1 ? 'down' : null);
    } catch (error) {
      console.error(`Error fetching vote data for ${type}:`, error);
      // Fallback to initial values
      setVotes(initialVotes);
      setVoteStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load vote data on mount
  useEffect(() => {
    fetchVoteData();
  }, [itemId, type]);

  const handleVote = async (value: number) => {
    try {
      const url = `${API_BASE_URL}${type === 'prototype' ? '/api/votes/prototypes' : '/api/votes/subideas'}/${itemId}`;
      await axios.post(url, { value }, { withCredentials: true });
      // Refresh vote data after voting
      await fetchVoteData();
    } catch (error) {
      console.error(`Error voting on ${type}:`, error);
      // Revert UI changes on error
      await fetchVoteData();
    }
  };

  const handleUpvote = async () => {
    // Optimistic UI update
    const prevVotes = votes;
    const prevStatus = voteStatus;
    
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
    
    // Send vote to server (will refresh data)
    await handleVote(1);
  };

  const handleDownvote = async () => {
    // Optimistic UI update
    const prevVotes = votes;
    const prevStatus = voteStatus;
    
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
    
    // Send vote to server (will refresh data)
    await handleVote(-1);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center space-y-1">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        <div className="h-6 w-10 bg-muted animate-pulse rounded" />
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

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

export default VoteButtons;
