
'use client';

import { ideas } from '@/lib/mock-data';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Lightbulb, Wrench, FileText, CheckCircle, UserCheck, ThumbsUp, ThumbsDown, UserCheck, Check, X, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoteButtons from '@/components/VoteButtons';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Proposal } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from '@/components/ui/textarea';

const statusConfig = {
    'Open for prototyping': { icon: FileText, color: 'bg-blue-500', label: 'Open for Prototyping' },
    'Self-prototyping': { icon: UserCheck, color: 'bg-purple-500', label: 'Self-Prototyping' },
    'Prototyping': { icon: Wrench, color: 'bg-yellow-500', label: 'Prototyping' },
    'Completed': { icon: CheckCircle, color: 'bg-green-500', label: 'Completed' },
};

const proposalStatusConfig = {
  'Pending': { color: 'bg-yellow-500', icon: Lightbulb },
  'Accepted': { color: 'bg-green-500', icon: Check },
  'Rejected': { color: 'bg-red-500', icon: X },
}

const ProposalActionButtons = ({ ideaAuthorId, proposal, onAction }: { ideaAuthorId: string; proposal: Proposal; onAction: (proposalId: string, action: 'Accepted' | 'Rejected', comment?: string) => void }) => {
  const { currentUser } = useAuth();
  const [comment, setComment] = useState('');
  
  if (currentUser?.id !== ideaAuthorId || proposal.status !== 'Pending') {
    return null;
  }

  return (
    <div className="flex gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline"><ThumbsDown className="mr-2 h-4 w-4" /> Reject</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Proposal?</AlertDialogTitle>
            <AlertDialogDescription>
              You can provide an optional comment explaining why you're rejecting this proposal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea placeholder="Optional rejection comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onAction(proposal.id, 'Rejected', comment)} className={cn(buttonVariants({variant: "destructive"}))}>
              Confirm Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
       <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm"><ThumbsUp className="mr-2 h-4 w-4" /> Accept</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Proposal?</AlertDialogTitle>
            <AlertDialogDescription>
              Accepting this proposal will change the idea's status to "Prototyping" and notify the author.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onAction(proposal.id, 'Accepted')}>Confirm Accept</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};


export default function IdeaDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const idea = ideas.find((p) => p.id === id);
  const { currentUser } = useAuth();
  
  const [selectedProposal, setSelectedProposal] = useState('all');
  const [activeTab, setActiveTab] = useState('proposals');
  const { toast } = useToast();

  if (!idea) {
    notFound();
  }
  
  const userProposal = currentUser ? idea.proposals.find(p => p.author.id === currentUser.id) : null;
  const canBuildPrototype = userProposal?.status === 'Accepted';

  const filteredPrototypes = selectedProposal === 'all'
    ? idea.prototypes
    : idea.prototypes.filter(p => p.proposalId === selectedProposal);

  const StatusIcon = statusConfig[idea.status].icon;

  const handleViewPrototypes = (proposalId: string) => {
    setActiveTab('prototypes');
    setSelectedProposal(proposalId);
    document.getElementById('prototypes')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleProposalAction = (proposalId: string, action: 'Accepted' | 'Rejected', comment?: string) => {
    // This would be an API call in a real app
    console.log(`Setting proposal ${proposalId} to ${action} for idea ${idea.id}. Comment: ${comment}`);
    toast({
        title: `Proposal ${action}!`,
        description: `The proposal has been successfully ${action.toLowerCase()}.`
    });
    // Here you would re-fetch project data or update state
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <Badge
          variant="secondary"
          className={cn(
            statusConfig[idea.status].color,
            'text-white mb-2',
            'inline-flex items-center gap-1'
          )}
        >
          <StatusIcon className="h-3 w-3" />
          {statusConfig[idea.status].label}
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">{idea.title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={idea.author.avatarUrl} data-ai-hint="user avatar" />
            <AvatarFallback>{idea.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>Posted by {idea.author.name}</span>
          <span>•</span>
          <span>{idea.createdAt}</span>
        </div>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle>The Idea</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{idea.description}</p>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-start border-b">
            <TabsList className="bg-transparent p-0 rounded-none">
              <TabsTrigger value="proposals" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Proposals ({idea.proposals.length})</TabsTrigger>
              <TabsTrigger value="prototypes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Prototypes ({idea.prototypes.length})</TabsTrigger>
            </TabsList>
        </div>
        <div className="py-6">
            <TabsContent value="proposals">
              <div className="space-y-6">
                <div className="flex justify-end">
                  <Button asChild>
                    <Link href={`/ideation/${idea.id}/submit-proposal`}>
                      <Lightbulb className="mr-2 h-4 w-4" /> Submit Proposal
                    </Link>
                  </Button>
                </div>
                {idea.proposals.length > 0 ? (
                  idea.proposals.map(proposal => {
                    const protoCount = idea.prototypes.filter(p => p.proposalId === proposal.id).length;
                    const StatusIcon = proposalStatusConfig[proposal.status].icon;
                    return (
                      <Card key={proposal.id} id={`proposal-${proposal.id}`}>
                        <CardHeader>
                           <CardTitle className="flex items-start justify-between">
                            <span>{proposal.title}</span>
                             <Badge variant="secondary" className={cn('gap-1.5', proposalStatusConfig[proposal.status].color, 'text-primary-foreground')}>
                                <StatusIcon className="h-3.5 w-3.5" />
                                {proposal.status}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            <div className="flex items-center gap-2 text-xs pt-1">
                                <Avatar className="h-5 w-5">
                                    <AvatarImage src={proposal.author.avatarUrl} data-ai-hint="user avatar" />
                                    <AvatarFallback>{proposal.author.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{proposal.author.name}</span>
                                <span>•</span>
                                <span>{proposal.createdAt}</span>
                            </div>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground line-clamp-3">{proposal.description}</p>
                          {proposal.status === 'Rejected' && proposal.comments && (
                              <div className="mt-2 text-sm text-red-900 dark:text-red-300/90 bg-red-500/10 p-2 rounded-md flex gap-2">
                                <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />
                                <p><span className="font-semibold">{idea.author.name} commented:</span> {proposal.comments}</p>
                              </div>
                          )}
                        </CardContent>
                        <CardFooter className="justify-between">
                            <VoteButtons initialVotes={proposal.votes} />
                             <div className="flex items-center gap-4">
                                {protoCount > 0 ? (
                                    <Button variant="link" onClick={() => handleViewPrototypes(proposal.id)} className="p-0 h-auto">
                                        {protoCount} Prototype{protoCount > 1 ? 's' : ''}
                                    </Button>
                                ) : (
                                    proposal.status === 'Accepted' && <p className="text-sm text-muted-foreground">Prototype not submitted yet.</p>
                                )}
                                <ProposalActionButtons ideaAuthorId={idea.author.id} proposal={proposal} onAction={handleProposalAction} />
                            </div>
                        </CardFooter>
                      </Card>
                    )
                  })
                ) : (
                  <p className="text-muted-foreground text-center py-8">No proposals submitted yet. Be the first!</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="prototypes" id="prototypes">
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="w-full max-w-xs">
                       <Select value={selectedProposal} onValueChange={setSelectedProposal}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by proposal..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Proposals</SelectItem>
                            {idea.proposals.map(proposal => (
                                <SelectItem key={proposal.id} value={proposal.id}>{proposal.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    </div>
                    {canBuildPrototype ? (
                      <Button asChild>
                        <Link href={`/ideation/${idea.id}/build-prototype`}>
                          <Wrench className="mr-2 h-4 w-4" /> Build a Prototype
                        </Link>
                      </Button>
                    ) : (
                       <div className="text-right">
                         <Button asChild>
                            <Link href={`/ideation/${idea.id}/submit-proposal`}>
                              <Lightbulb className="mr-2 h-4 w-4" /> Submit a Proposal
                            </Link>
                         </Button>
                         <p className="text-xs text-muted-foreground mt-1">to start building a prototype.</p>
                       </div>
                    )}
                  </div>
                   <div className="grid md:grid-cols-2 gap-6">
                        {filteredPrototypes.length > 0 ? (
                          filteredPrototypes.map(proto => (
                              <Card key={proto.id}>
                                  <CardHeader>
                                      <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-4">
                                          <Image src={proto.imageUrl} alt={proto.title} fill className="object-cover" data-ai-hint="prototype screenshot" />
                                      </div>
                                      <CardTitle className="flex items-baseline justify-between">
                                        <span>{proto.title}</span>
                                        {proto.proposalId && (
                                          <Link href={`/ideation/${idea.id}#proposal-${proto.proposalId}`} className={cn(badgeVariants({ variant: 'secondary' }), 'font-mono text-xs font-medium')}>
                                              {idea.proposals.find(p => p.id === proto.proposalId)?.title || 'Proposal'}
                                          </Link>
                                        )}
                                      </CardTitle>
                                       <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <Avatar className="h-5 w-5">
                                              <AvatarImage src={proto.author.avatarUrl} data-ai-hint="user avatar" />
                                              <AvatarFallback>{proto.author.name.charAt(0)}</AvatarFallback>
                                          </Avatar>
                                          <span>{proto.author.name}</span>
                                          <span>•</span>
                                          <span>{proto.createdAt}</span>
                                      </div>
                                  </CardHeader>
                                  <CardContent>
                                      <p className="text-sm text-muted-foreground line-clamp-2">{proto.description}</p>
                                  </CardContent>
                                  <CardFooter className="justify-between">
                                      <VoteButtons initialVotes={proto.votes} />
                                      <div className="flex items-center gap-2">
                                        {proto.liveUrl && <Button asChild variant="outline"><Link href={proto.liveUrl} target="_blank">View Live</Link></Button>}
                                        <Button asChild>
                                            <Link href={`/ideation/${idea.id}/prototypes/${proto.id}`}>
                                            View Details
                                            </Link>
                                        </Button>
                                      </div>
                                  </CardFooter>
                              </Card>
                          ))
                        ) : (
                          <p className="md:col-span-2 text-muted-foreground text-center py-8">
                            {selectedProposal === 'all'
                              ? 'No prototypes built yet. Be the first!'
                              : 'No prototypes found for this proposal.'}
                          </p>
                        )}
                   </div>
               </div>
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
