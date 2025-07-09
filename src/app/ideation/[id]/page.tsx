
import { projects } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Wrench, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoteButtons from '@/components/VoteButtons';
import Image from 'next/image';
import Link from 'next/link';

const statusConfig = {
    Ideation: { icon: Lightbulb, color: 'bg-blue-500', label: 'Ideation' },
    Prototyping: { icon: Wrench, color: 'bg-yellow-500', label: 'Prototyping' },
    Completed: { icon: Wrench, color: 'bg-green-500', label: 'Completed' },
};

export default async function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const project = projects.find((p) => p.id === params.id);

  if (!project) {
    notFound();
  }

  const StatusIcon = statusConfig[project.status].icon;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Project Header */}
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
          <span>Requested by {project.author.name}</span>
          <span>•</span>
          <span>{project.createdAt}</span>
        </div>
      </header>
      
      {/* Project Details and Rewards */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Problem Statement</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{project.description}</p>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Rewards Pool</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-muted-foreground"><Lightbulb className="h-5 w-5 text-blue-500" /> Best Idea</span>
                        <span className="font-bold flex items-center gap-1">{project.rewards.ideation} <Star className="h-4 w-4 text-yellow-500 fill-current" /></span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-muted-foreground"><Wrench className="h-5 w-5 text-yellow-500" /> Best Prototype</span>
                        <span className="font-bold flex items-center gap-1">{project.rewards.prototype} <Star className="h-4 w-4 text-yellow-500 fill-current" /></span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      <Tabs defaultValue="ideas" className="w-full">
        <div className="flex justify-start border-b">
            <TabsList className="bg-transparent p-0 rounded-none">
              <TabsTrigger value="ideas" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Ideas ({project.ideas.length})</TabsTrigger>
              <TabsTrigger value="prototypes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Prototypes ({project.prototypes.length})</TabsTrigger>
            </TabsList>
        </div>
        <div className="py-6">
            <TabsContent value="ideas">
              <div className="space-y-6">
                <div className="flex justify-end">
                  <Button><Lightbulb className="mr-2 h-4 w-4" /> Submit Your Idea</Button>
                </div>
                {project.ideas.length > 0 ? (
                  project.ideas.map(idea => (
                      <Card key={idea.id} className="flex gap-4 p-4">
                          <VoteButtons initialVotes={idea.votes} />
                          <div className="flex-grow">
                              <p className="text-foreground">{idea.content}</p>
                               <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                  <Avatar className="h-5 w-5">
                                      <AvatarImage src={idea.author.avatarUrl} data-ai-hint="user avatar" />
                                      <AvatarFallback>{idea.author.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span>{idea.author.name}</span>
                                  <span>•</span>
                                  <span>{idea.createdAt}</span>
                              </div>
                          </div>
                      </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No ideas submitted yet. Be the first!</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="prototypes">
               <div className="space-y-6">
                  <div className="flex justify-end">
                    <Button><Wrench className="mr-2 h-4 w-4" /> Build a Prototype</Button>
                  </div>
                   <div className="grid md:grid-cols-2 gap-6">
                        {project.prototypes.length > 0 ? (
                          project.prototypes.map(proto => (
                              <Card key={proto.id}>
                                  <CardHeader>
                                      <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-4">
                                          <Image src={proto.imageUrl} alt={proto.title} fill className="object-cover" data-ai-hint="prototype screenshot" />
                                      </div>
                                      <CardTitle>{proto.title}</CardTitle>
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
                                      {proto.liveUrl && <Button asChild><Link href={proto.liveUrl} target="_blank">View Live</Link></Button>}
                                  </CardFooter>
                              </Card>
                          ))
                        ) : (
                          <p className="md:col-span-2 text-muted-foreground text-center py-8">No prototypes built yet. Be the first!</p>
                        )}
                   </div>
               </div>
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
