

'use client';

import { ideas } from '@/lib/mock-data';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Wrench, FileText, Info, CircleDollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import SubIdeaCard from '@/components/SubIdeaCard';
import ProposalCard from '@/components/ProposalCard';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import VoteButtons from '@/components/VoteButtons';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const typeConfig = {
    'Ideation': { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
    'Solution Request': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
};


export default function IdeaDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const idea = ideas.find((p) => p.id === id);
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('ideas');

  if (!idea) {
    notFound();
  }
  
  const config = typeConfig[idea.type];

  const ideaSubmissions = idea.subIdeas || [];
  const proposals = idea.proposals || [];
  const prototypes = idea.prototypes || [];
  
  const hasAcceptedProposal = currentUser ? proposals.some(p => p.author.id === currentUser.id && p.status === 'Accepted') : false;

  const renderActionButton = () => {
    switch(activeTab) {
      case 'ideas':
        return (
          <Button asChild>
            <Link href={`/ideation/${idea.id}/submit-idea`}>
              <>
                <Lightbulb className="mr-2 h-4 w-4" /> Submit Your Idea
              </>
            </Link>
          </Button>
        );
      case 'proposals':
        return (
          <Button asChild>
            <Link href={`/ideation/${idea.id}/submit-proposal`}>
              <>
                <FileText className="mr-2 h-4 w-4" /> Submit Proposal
              </>
            </Link>
          </Button>
        );
      case 'prototypes':
        return hasAcceptedProposal ? (
          <Button asChild>
            <Link href={`/ideation/${idea.id}/build-prototype`}>
              <>
                <Wrench className="mr-2 h-4 w-4" /> Build a Prototype
              </>
            </Link>
          </Button>
        ) : null;
      default:
        return null;
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="space-y-4">
        <div>
          <Badge
            variant={config.variant}
            className={cn('mb-2', config.className)}
          >
            {idea.type}
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
        </div>
        <p className="text-lg text-muted-foreground">{idea.description}</p>
        {idea.potentialDollarValue && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CircleDollarSign className="h-5 w-5" />
              <span className="font-semibold text-lg">
                  ${idea.potentialDollarValue.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">Potential Value</span>
          </div>
        )}
      </header>
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="ideas">Ideas ({ideaSubmissions.length})</TabsTrigger>
              <TabsTrigger value="proposals">Proposals ({proposals.length})</TabsTrigger>
              <TabsTrigger value="prototypes">Prototypes ({prototypes.length})</TabsTrigger>
            </TabsList>
            {renderActionButton()}
        </div>
        <div className="py-6">
            <TabsContent value="ideas" className="space-y-6">
                <div className="space-y-6">
                    {ideaSubmissions.length > 0 ? (
                      ideaSubmissions.map((subIdea) => (
                        <Link
                          key={subIdea.id}
                          href={`/ideation/${idea.id}/ideas/${subIdea.id}`}
                          className="block">
                          <SubIdeaCard 
                              subIdea={subIdea}
                          />
                        </Link>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No ideas submitted yet. Be the first!</p>
                    )}
                </div>
            </TabsContent>
            <TabsContent value="proposals" className="space-y-6">
               <div className="space-y-6 mt-6">
                  {proposals.length > 0 ? (
                    proposals.map((proposal) => (
                      <ProposalCard 
                        key={proposal.id}
                        proposal={proposal}
                        isProjectOwner={currentUser?.id === idea.author.id}
                      />
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No proposals submitted yet.</p>
                  )}
              </div>
            </TabsContent>
            <TabsContent value="prototypes">
               <div className="space-y-6">
                  {activeTab !== 'prototypes' && hasAcceptedProposal ? (
                         <div className="flex justify-end">
                            <Button asChild>
                            <Link href={`/ideation/${idea.id}/build-prototype`}>
                              <>
                                <Wrench className="mr-2 h-4 w-4" /> Build a Prototype
                              </>
                            </Link>
                            </Button>
                         </div>
                     ) : null}

                    {activeTab === 'prototypes' && !hasAcceptedProposal ? (
                        <Card className="bg-muted/50 w-full">
                            <CardContent className="p-4 flex items-center gap-3">
                                <Info className="h-5 w-5 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    You must have an accepted proposal to build a prototype. <Link href={`/ideation/${idea.id}/submit-proposal`} className="text-primary hover:underline font-medium">Submit a proposal</Link> to get started.
                                </p>
                            </CardContent>
                        </Card>
                    ) : null }

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {prototypes.length > 0 ? (
                      prototypes.map((proto) => (
                        <Link
                          key={proto.id}
                          href={`/ideation/${idea.id}/prototypes/${proto.id}`}
                          className="block">
                          <Card className="h-full hover:border-primary/50 transition-colors">
                              <div className="relative aspect-video w-full rounded-t-lg overflow-hidden">
                                  <Image src={proto.imageUrl} alt={proto.title} fill className="object-cover" data-ai-hint="prototype screenshot" />
                              </div>
                              <CardHeader>
                                  <CardTitle className="text-lg">{proto.title}</CardTitle>
                                  <CardDescription>
                                    by {proto.author.name}
                                  </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2">{proto.description}</p>
                              </CardContent>
                              <CardFooter className="flex justify-between items-center">
                                <VoteButtons initialVotes={proto.votes} />
                                <div className="flex -space-x-2">
                                  <TooltipProvider>
                                    {proto.team.map(member => (
                                      <Tooltip key={member.id}>
                                        <TooltipTrigger>
                                          <Avatar className="h-8 w-8 border-2 border-card">
                                              <AvatarImage src={member.avatarUrl} data-ai-hint="user avatar" />
                                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                          </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          {member.name}
                                        </TooltipContent>
                                      </Tooltip>
                                    ))}
                                  </TooltipProvider>
                                </div>
                              </CardFooter>
                          </Card>
                        </Link>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-8 col-span-full">No prototypes submitted yet.</p>
                    )}
                  </div>
               </div>
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
