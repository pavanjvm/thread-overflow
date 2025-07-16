
'use client';

import { projects } from '@/lib/mock-data';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Wrench, FileText, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoteButtons from '@/components/VoteButtons';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusConfig = {
    'Seeking Proposals': { icon: FileText, color: 'bg-blue-500', label: 'Seeking Proposals' },
    Prototyping: { icon: Wrench, color: 'bg-yellow-500', label: 'Prototyping' },
    Completed: { icon: CheckCircle, color: 'bg-green-500', label: 'Completed' },
};

export default function ProjectDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const project = projects.find((p) => p.id === id);
  const [selectedProposal, setSelectedProposal] = useState('all');
  const [activeTab, setActiveTab] = useState('proposals');
  const { toast } = useToast();

  if (!project) {
    notFound();
  }

  const filteredPrototypes = selectedProposal === 'all'
    ? project.prototypes
    : project.prototypes.filter(p => p.proposalId === selectedProposal);

  const StatusIcon = statusConfig[project.status].icon;

  const handleViewPrototypes = (proposalId: string) => {
    setActiveTab('prototypes');
    setSelectedProposal(proposalId);
    document.getElementById('prototypes')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleAcceptProposal = (proposalId: string) => {
    // This would be an API call in a real app
    console.log(`Accepting proposal ${proposalId} for project ${project.id}`);
    toast({
        title: "Proposal Accepted!",
        description: "The project is now in the prototyping phase."
    });
    // Here you would re-fetch project data or update state
    // For now, we'll just show the toast
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <Badge
          variant="secondary"
          className={cn(
            statusConfig[project.status].color,
            'text-white mb-2',
            'inline-flex items-center gap-1'
          )}
        >
          <StatusIcon className="h-3 w-3" />
          {statusConfig[project.status].label}
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">{project.title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={project.author.avatarUrl} data-ai-hint="user avatar" />
            <AvatarFallback>{project.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>Posted by {project.author.name}</span>
          <span>•</span>
          <span>{project.createdAt}</span>
        </div>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle>Problem Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{project.description}</p>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-start border-b">
            <TabsList className="bg-transparent p-0 rounded-none">
              <TabsTrigger value="proposals" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Proposals ({project.proposals.length})</TabsTrigger>
              <TabsTrigger value="prototypes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Prototypes ({project.prototypes.length})</TabsTrigger>
            </TabsList>
        </div>
        <div className="py-6">
            <TabsContent value="proposals">
              <div className="space-y-6">
                <div className="flex justify-end">
                  <Button asChild>
                    <Link href={`/ideation/${project.id}/submit-proposal`}>
                      <Lightbulb className="mr-2 h-4 w-4" /> Submit Proposal
                    </Link>
                  </Button>
                </div>
                {project.proposals.length > 0 ? (
                  project.proposals.map(proposal => {
                    const protoCount = project.prototypes.filter(p => p.proposalId === proposal.id).length;
                    return (
                      <Card key={proposal.id} id={`proposal-${proposal.id}`}>
                        <CardHeader>
                           <CardTitle className="flex items-baseline justify-between">
                            <span>{proposal.title}</span>
                            <Link href={`/ideation/${project.id}#proposal-${proposal.id}`} className={cn(badgeVariants({ variant: 'secondary' }), 'font-mono text-xs font-medium')}>
                                {proposal.id}
                            </Link>
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
                        </CardContent>
                        <CardFooter className="justify-between">
                            <VoteButtons initialVotes={proposal.votes} />
                             <div className="flex items-center gap-4">
                                {protoCount > 0 ? (
                                    <Button variant="link" onClick={() => handleViewPrototypes(proposal.id)} className="p-0 h-auto">
                                        {protoCount} Prototype{protoCount > 1 ? 's' : ''}
                                    </Button>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No prototypes yet</p>
                                )}
                                {project.status === 'Seeking Proposals' && (
                                    <Button size="sm" onClick={() => handleAcceptProposal(proposal.id)}>
                                        <CheckCircle className="mr-2 h-4 w-4" /> Accept Proposal
                                    </Button>
                                )}
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
                            {project.proposals.map(proposal => (
                                <SelectItem key={proposal.id} value={proposal.id}>{proposal.id} ({proposal.title})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    </div>
                    <Button asChild>
                      <Link href={`/ideation/${project.id}/build-prototype`}>
                        <Wrench className="mr-2 h-4 w-4" /> Build a Prototype
                      </Link>
                    </Button>
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
                                          <Link href={`/ideation/${project.id}#proposal-${proto.proposalId}`} className={cn(badgeVariants({ variant: 'secondary' }), 'font-mono text-xs font-medium')}>
                                              {proto.proposalId}
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
                                            <Link href={`/ideation/${project.id}/prototypes/${proto.id}`}>
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
