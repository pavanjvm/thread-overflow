
'use client';

import type { Proposal } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import VoteButtons from './VoteButtons';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { ThumbsUp, ThumbsDown, CheckCircle, XCircle, Hourglass, FileText } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface ProposalCardProps {
  proposal: Proposal;
  isProjectOwner: boolean;
}

const statusConfig = {
    'Pending': { 
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        icon: Hourglass
    },
    'Accepted': { 
        className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        icon: CheckCircle,
    },
    'Rejected': { 
        className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        icon: XCircle,
    },
};
  

const ProposalCard = ({ proposal, isProjectOwner }: ProposalCardProps) => {
  const [currentStatus, setCurrentStatus] = useState(proposal.status);
  const [rejectionReason, setRejectionReason] = useState(proposal.rejectionReason);
  const [comment, setComment] = useState('');
  const [actionType, setActionType] = useState<'accept' | 'reject' | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const config = statusConfig[currentStatus];

  const handleAction = () => {
    // In a real app, this would be an API call
    if (actionType === 'accept') {
        console.log(`Accepting proposal ${proposal.id} with comment: ${comment}`);
        setCurrentStatus('Accepted');
    } else if (actionType === 'reject') {
        console.log(`Rejecting proposal ${proposal.id} with reason: ${comment}`);
        setCurrentStatus('Rejected');
        setRejectionReason(comment);
    }
    setIsDialogOpen(false);
    setComment('');
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card className="hover:border-primary/50 transition-colors duration-300 overflow-hidden">
        <div className="flex">
          <div className="p-4 flex-shrink-0">
            <VoteButtons initialVotes={proposal.votes} />
          </div>
          <div className="flex-grow py-4 pr-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <CardTitle className="text-lg mb-1">{proposal.title}</CardTitle>
                   {proposal.presentationUrl && (
                    <a href={proposal.presentationUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
                      <Badge variant="outline" className="text-sm font-normal cursor-pointer hover:bg-accent py-1">
                        <FileText className="mr-1.5 h-4 w-4" />
                        Presentation
                      </Badge>
                    </a>
                  )}
                </div>
                <Badge variant="secondary" className={cn('whitespace-nowrap', config.className)}>
                    <config.icon className="mr-1.5 h-3.5 w-3.5" />
                    {currentStatus}
                </Badge>
              </div>
            <CardDescription className="text-sm text-muted-foreground mt-2">
                <div className="flex items-center space-x-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={proposal.author.avatarUrl} data-ai-hint="user avatar" />
                      <AvatarFallback>{proposal.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>Proposed by {proposal.author.name}</span>
                    <span>•</span>
                    <span>{proposal.createdAt}</span>
                  </div>
              </CardDescription>
            <CardContent className="p-0 mt-3">
              <p className="text-muted-foreground line-clamp-3">{proposal.description}</p>
               {currentStatus === 'Rejected' && rejectionReason && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-md border border-red-200 dark:border-red-500/30">
                      <span className="font-semibold">Reason:</span> {rejectionReason}
                  </div>
              )}
            </CardContent>
            <CardFooter className="p-0 mt-4 flex justify-between items-center">
              <div></div>
              {isProjectOwner && currentStatus === 'Pending' && (
                  <div className="flex gap-2">
                      <DialogTrigger asChild>
                          <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 dark:border-green-700/50"
                              onClick={() => setActionType('accept')}
                            >
                              <ThumbsUp className="mr-2" /> Accept
                          </Button>
                      </DialogTrigger>
                       <DialogTrigger asChild>
                           <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 dark:border-red-700/50"
                              onClick={() => setActionType('reject')}
                            >
                              <ThumbsDown className="mr-2" /> Reject
                          </Button>
                       </DialogTrigger>
                  </div>
              )}
            </CardFooter>
          </div>
        </div>
      </Card>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {actionType === 'accept' ? 'Accept Proposal' : 'Reject Proposal'}
          </DialogTitle>
          <DialogDescription>
             {actionType === 'accept' 
                ? 'You are about to accept this proposal. You can add an optional comment below.' 
                : 'You are about to reject this proposal. Please provide a reason for your decision.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comment" className="text-right">
              {actionType === 'accept' ? 'Comment' : 'Reason'}
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="col-span-3"
              placeholder={actionType === 'accept' ? 'Optional feedback...' : 'Required reason for rejection...'}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={handleAction} disabled={actionType === 'reject' && !comment.trim()}>
            {actionType === 'accept' ? 'Accept and Send' : 'Reject and Send'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalCard;
