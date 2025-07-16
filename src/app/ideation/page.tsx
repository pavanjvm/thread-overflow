
import Link from 'next/link';
import { ideas } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lightbulb, Wrench, FileText, CheckCircle, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const statusConfig = {
    'Open for prototyping': { icon: FileText, variant: 'secondary' as const, label: 'Open for Prototyping', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
    'Self-prototyping': { icon: UserCheck, variant: 'secondary' as const, label: 'Self-Prototyping', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' },
    'Prototyping': { icon: Wrench, variant: 'secondary' as const, label: 'Prototyping', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
    'Completed': { icon: CheckCircle, variant: 'secondary' as const, label: 'Completed', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
};


export default function IdeationPortalPage() {
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Ideation Portal</h1>
            <p className="text-muted-foreground mt-1">Submit ideas, build proposals, and create prototypes.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild>
                <Link href="/ideation/new">Submit an Idea</Link>
            </Button>
          </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map((idea) => {
          const config = statusConfig[idea.status];
          const StatusIcon = config.icon;
          return (
            <Link href={`/ideation/${idea.id}`} key={idea.id} className="block">
              <Card className="h-full flex flex-col hover:border-primary/50 transition-colors duration-300 hover:bg-card/50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{idea.title}</CardTitle>
                       <Badge
                          variant={config.variant}
                          className={cn('flex items-center gap-1.5 whitespace-nowrap', config.className)}
                          >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {config.label}
                      </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2 text-xs pt-2">
                      <Avatar className="h-5 w-5">
                          <AvatarImage src={idea.author.avatarUrl} data-ai-hint="user avatar" />
                          <AvatarFallback>{idea.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{idea.author.name}</span>
                      <span>•</span>
                      <span>{idea.createdAt}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">{idea.description}</p>
                </CardContent>
                <CardFooter>
                   <div className="w-full flex justify-start items-center text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                              <Lightbulb className="h-4 w-4 text-primary" />
                              <span>{idea.proposals.length} Proposals</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                              <Wrench className="h-4 w-4 text-yellow-500" />
                              <span>{idea.prototypes.length} Prototypes</span>
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
