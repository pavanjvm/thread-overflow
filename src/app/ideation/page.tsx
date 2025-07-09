
import Link from 'next/link';
import { projects } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lightbulb, Wrench, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const typeConfig = {
  'Solution Request': { icon: HelpCircle, color: 'bg-blue-500', label: 'Solution Request' },
  'Idea': { icon: Lightbulb, color: 'bg-accent', label: 'Idea' },
};


export default function IdeationPortalPage() {
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Ideation Portal</h1>
            <p className="text-muted-foreground mt-1">Solve challenges, build prototypes, and earn rewards.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
                <Link href="/ideation/post-idea">Contribute an Idea</Link>
            </Button>
            <Button asChild>
                <Link href="/ideation/request-solution">Request a Solution</Link>
            </Button>
          </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const projectType = project.type || 'Solution Request';
          const TypeIcon = typeConfig[projectType].icon;
          return (
            <Link href={`/ideation/${project.id}`} key={project.id} className="block">
              <Card className="h-full flex flex-col hover:border-primary/50 transition-colors duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                       <Badge
                          className={cn(
                              typeConfig[projectType].color,
                              'text-primary-foreground',
                              'flex items-center gap-1 border-transparent'
                          )}
                          >
                          <TypeIcon className="h-3 w-3" />
                          {typeConfig[projectType].label}
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
                   <div className="w-full flex justify-start items-center text-sm text-muted-foreground">
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
