
import Link from 'next/link';
import { projects } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Lightbulb, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import RequestSolutionDialog from './_components/RequestSolutionDialog';

const statusConfig = {
    Ideation: { icon: Lightbulb, color: 'bg-blue-500', label: 'Ideation' },
    Prototyping: { icon: Wrench, color: 'bg-yellow-500', label: 'Prototyping' },
    Completed: { icon: Wrench, color: 'bg-green-500', label: 'Completed' },
};


export default function IdeationPortalPage() {
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Ideation Portal</h1>
            <p className="text-muted-foreground mt-1">Solve challenges, build prototypes, and earn rewards.</p>
          </div>
          <RequestSolutionDialog />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const StatusIcon = statusConfig[project.status].icon;
          return (
            <Link href={`/ideation/${project.id}`} key={project.id} className="block">
              <Card className="h-full flex flex-col hover:border-primary/50 transition-colors duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                       <Badge
                          className={cn(
                              statusConfig[project.status].color,
                              'text-primary-foreground',
                              'flex items-center gap-1 border-transparent'
                          )}
                          >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[project.status].label}
                      </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2 text-xs pt-2">
                      <Avatar className="h-5 w-5">
                          <AvatarImage src={project.author.avatarUrl} data-ai-hint="user avatar" />
                          <AvatarFallback>{project.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{project.author.name}</span>
                      <span>•</span>
                      <span>{project.createdAt}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
                </CardContent>
                <CardFooter>
                   <div className="w-full flex justify-between items-center text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                              <Lightbulb className="h-4 w-4 text-blue-500" />
                              <span>{project.ideas.length} Ideas</span>
                          </div>
                          <div className="flex items-center gap-1">
                              <Wrench className="h-4 w-4 text-yellow-500" />
                              <span>{project.prototypes.length} Prototypes</span>
                          </div>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span>{project.rewards.ideation + project.rewards.prototype}</span>
                      </div>
                   </div>
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
