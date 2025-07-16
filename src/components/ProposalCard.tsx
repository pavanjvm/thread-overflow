
'use client';

import type { Proposal } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import VoteButtons from './VoteButtons';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { ThumbsUp, ThumbsDown, CheckCircle, XCircle, Hourglass } from 'lucide-react';
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

const PdfIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 80 80" width="16" height="16" {...props}>
      <path fill="#F7F7F7" d="M70.2,8.4H9.8C9,8.4,8.4,9,8.4,9.8v60.4c0,0.8,0.6,1.4,1.4,1.4h60.4c0.8,0,1.4-0.6,1.4-1.4V9.8 C71.6,9,71,8.4,70.2,8.4z" />
      <path fill="#D9D9D9" d="M70.2,8.4H9.8C9,8.4,8.4,9,8.4,9.8v60.4c0,0.8,0.6,1.4,1.4,1.4h60.4c0.8,0,1.4-0.6,1.4-1.4V9.8 C71.6,9,71,8.4,70.2,8.4z" />
      <path fill="#B50000" d="M21.9,13.2h10.4c1.1,0,2.1,0.2,2.9,0.5c1.1,0.5,2,1.3,2.7,2.4c0.7,1.1,1.1,2.4,1.1,3.9 c0,1.5-0.3,2.9-0.9,4.1s-1.5,2.1-2.7,2.7c-1,0.5-2,0.7-3,0.7H21.9V13.2z M24.8,24.3h1.8c0.7,0,1.3-0.1,1.8-0.3 c0.6-0.2,1.1-0.6,1.4-1.1c0.3-0.5,0.5-1.1,0.5-1.8c0-0.7-0.2-1.2-0.5-1.7s-0.7-0.8-1.2-1c-0.5-0.2-1-0.3-1.6-0.3h-2.2V24.3z" />
      <path fill="#B50000" d="M39.5,13.2h9.4c1.2,0,2.3,0.1,3.2,0.4c1.1,0.3,2.1,0.9,2.8,1.6c0.8,0.8,1.3,1.7,1.7,2.8 c0.3,1,0.5,2.1,0.5,3.2c0,1.2-0.2,2.3-0.5,3.4c-0.3,1-0.9,1.9-1.6,2.7c-0.8,0.7-1.7,1.3-2.7,1.5c-1,0.3-2,0.4-3.1,0.4h-9.7V13.2z M42.4,24.6h2.1c0.8,0,1.5-0.1,2-0.2c0.7-0.2,1.2-0.5,1.6-0.9c0.4-0.4,0.7-1,0.9-1.6c0.1-0.6,0.2-1.3,0.2-2c0-0.8-0.1-1.5-0.2-2.1 c-0.2-0.6-0.4-1.1-0.8-1.5s-0.9-0.7-1.5-0.9c-0.6-0.2-1.2-0.2-1.9-0.2h-2.3V24.6z" />
      <path fill="#B50000" d="M57.4,13.2H61v15.5h2.9V13.2h3.6v15.5h2.9V13.2H74v15.5c0,0.8-0.2,1.5-0.5,2.1c-0.3,0.6-0.8,1-1.4,1.3 c-0.6,0.3-1.3,0.4-2.1,0.4h-5.2c-0.8,0-1.5-0.1-2.1-0.4c-0.6-0.3-1.1-0.7-1.4-1.3c-0.3-0.6-0.5-1.3-0.5-2.1V13.2z" />
      <g>
          <path fill="#B50000" d="M63.8,40.1c-6.2,0-11.2,2.4-14.9,7.1c-3.7,4.8-5.6,10.9-5.6,18.2c0,7.4,2.2,13.5,6.5,18.4 c4.4,4.9,10.2,7.3,17.5,7.3c4.1,0,7.9-0.8,11.4-2.4c3.5-1.6,6.3-4.1,8.3-7.5c2-3.4,3-7.6,3-12.7c0-2.8-0.4-5.3-1.1-7.5 c-0.4-1.3-0.9-2.5-1.5-3.6c-0.6-1.1-1.2-2-1.7-2.7c-0.2-0.2-0.3-0.4-0.5-0.6c-0.2-0.2-0.4-0.4-0.6-0.5c-0.2-0.1-0.5-0.3-0.7-0.4 c-0.2-0.1-0.5-0.2-0.7-0.3c-1-0.4-2-0.6-3.1-0.6c-1.1,0-2.2,0.3-3.2,0.8c-1.1,0.5-2,1.2-2.9,2.1c-0.9,0.9-1.6,2-2.1,3.2 c-0.5,1.2-0.7,2.5-0.7,3.9c0,2.1,0.5,3.9,1.6,5.3c1.1,1.4,2.6,2.1,4.5,2.1c1.2,0,2.3-0.3,3.3-0.8c0.6-0.3,1.1-0.7,1.5-1.2 c0.4-0.5,0.7-1,0.9-1.6c0.2-0.6,0.3-1.2,0.3-1.8c0-1.1-0.3-2-0.8-2.8c-0.5-0.8-1.3-1.2-2.3-1.2c-0.6,0-1.1,0.1-1.5,0.4 c-0.4,0.3-0.8,0.6-1,1c-0.2,0.4-0.4,0.8-0.5,1.3c-0.1,0.5-0.2,1-0.2,1.5c0,1,0.2,1.9,0.7,2.6c0.5,0.7,1.1,1.1,1.9,1.1 c1.6,0,2.9-0.9,4-2.6c0.5-0.8,0.9-1.7,1.2-2.6c0.3-0.9,0.5-1.9,0.7-2.8c0.2-1,0.3-2,0.3-3c0-3.3-0.8-6.1-2.4-8.2 c-1.6-2.1-3.9-3.2-6.9-3.2c-3.1,0-5.5,1.2-7.1,3.6c-1.6,2.4-2.5,5.6-2.5,9.6c0,4.1,0.8,7.5,2.4,10.2c1.6,2.7,3.9,4,6.8,4 c2.1,0,3.9-0.6,5.3-1.7c1.4-1.2,2.1-2.8,2.1-4.9c0-1.1-0.2-2.1-0.5-3c-0.3-0.9-0.7-1.7-1.1-2.4c-0.4-0.7-0.9-1.3-1.5-1.7 c-0.6-0.4-1.2-0.6-1.9-0.6c-1.2,0-2.2,0.5-3.1,1.6c-0.8,1-1.2,2.4-1.2,4.1c0,2.1,0.5,3.8,1.6,5.1c1.1,1.3,2.5,2,4.3,2 c2.7,0,5-1.1,6.8-3.4c1.8-2.3,2.7-5.3,2.7-9c0-3.6-0.8-6.6-2.3-9.1C72.3,42.1,68.5,40.1,63.8,40.1z" />
      </g>
    </svg>
  );
  

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
                        <PdfIcon className="mr-1.5 h-4 w-4" />
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
