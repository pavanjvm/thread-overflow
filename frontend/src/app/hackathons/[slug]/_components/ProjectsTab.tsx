import type { Hackathon } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function ProjectsTab({ hackathon }: { hackathon: Hackathon }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Showcase</h2>
          <p className="text-sm text-muted-foreground">Finalists, mentor picks, and shortlist projects across the active stages.</p>
        </div>
        <Button>{hackathon.status === 'LIVE' ? 'Submit project' : 'Review showcase'}</Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {hackathon.projects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <div className="relative h-48 w-full">
              <Image src={project.thumbnailUrl} alt={`${project.name} thumbnail`} fill className="object-cover" data-ai-hint="project thumbnail" />
            </div>
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {project.stage && <Badge variant="outline">{project.stage}</Badge>}
                {project.status && <Badge>{project.status}</Badge>}
              </div>
              <div>
                <CardTitle>{project.name}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{project.tagline}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{project.summary}</p>
              {project.score && (
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Current score</p>
                  <p className="mt-1 text-2xl font-semibold">{project.score}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="flex -space-x-2">
                <TooltipProvider>
                  {project.team.map((member) => (
                    <Tooltip key={member.id}>
                      <TooltipTrigger>
                        <Avatar className="border-2 border-card">
                          <AvatarImage src={member.avatarUrl ?? undefined} data-ai-hint="user avatar" />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>{member.name}</TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
              <Button variant="outline">Open submission</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
