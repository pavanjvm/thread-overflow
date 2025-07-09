import type { Hackathon } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function ProjectsTab({ hackathon }: { hackathon: Hackathon }) {
  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Projects ({hackathon.projects.length})</h2>
            <Button>Submit Your Project</Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathon.projects.map((project) => (
                <Card key={project.id} className="overflow-hidden">
                    <div className="relative h-48 w-full">
                        <Image src={project.thumbnailUrl} alt={`${project.name} thumbnail`} fill className="object-cover" data-ai-hint="project thumbnail" />
                    </div>
                    <CardHeader>
                        <CardTitle>{project.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{project.tagline}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                        <div className="flex -space-x-2">
                          <TooltipProvider>
                            {project.team.map(member => (
                              <Tooltip key={member.id}>
                                <TooltipTrigger>
                                  <Avatar className="border-2 border-card">
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
                        <Button variant="outline">View Project</Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    </div>
  );
}
