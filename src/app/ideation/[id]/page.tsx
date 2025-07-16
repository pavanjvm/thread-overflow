
'use client';

import { ideas } from '@/lib/mock-data';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoteButtons from '@/components/VoteButtons';
import Image from 'next/image';
import Link from 'next/link';

const typeConfig = {
    'Ideation': { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
    'Solution Request': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
};


export default function IdeaDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const idea = ideas.find((p) => p.id === id);

  if (!idea) {
    notFound();
  }
  
  const config = typeConfig[idea.type];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
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
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle>The {idea.type === 'Ideation' ? 'Idea' : 'Problem'}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{idea.description}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="proposals" className="w-full">
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
                <p className="text-muted-foreground text-center py-8">Proposal submission is not yet implemented.</p>
              </div>
            </TabsContent>
            <TabsContent value="prototypes">
               <div className="space-y-6">
                  <div className="flex justify-end">
                    <Button asChild>
                      <Link href={`/ideation/${idea.id}/build-prototype`}>
                        <Wrench className="mr-2 h-4 w-4" /> Build a Prototype
                      </Link>
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-center py-8">Prototype submission is not yet implemented.</p>
               </div>
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
