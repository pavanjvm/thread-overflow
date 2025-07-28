
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lightbulb, Wrench } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import RequestSolutionDialog from './_components/RequestSolutionDialog';
import { useState, useEffect } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';
import type { Idea } from '@/lib/types'; // Import the corrected Idea type

// Define a specific type for the configuration object keys
type IdeaType = 'IDEATION' | 'SOLUTION_REQUEST';

const typeConfig: Record<IdeaType, { variant: 'secondary'; className: string }> = {
    'IDEATION': { variant: 'secondary', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
    'SOLUTION_REQUEST': { variant: 'secondary', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
};

const defaultConfig = { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300' };

export default function IdeationPortalPage() {
  const [filter, setFilter] = useState('open');
  const [ideas, setIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        let url = `${API_BASE_URL}/api/ideas`;
        // Append status filter if not 'all'
        if (filter !== 'all') {
          url = `${API_BASE_URL}/api/ideas?status=${filter.toUpperCase()}`;
        }
        
        // Use the corrected Idea type for the axios response
        const response = await axios.get<Idea[]>(url, { withCredentials: true });
        
        // Filter out any malformed idea objects from the API response
        if (Array.isArray(response.data)) {
            setIdeas(response.data.filter(idea => idea && idea.type && idea.id)); 
        } else {
            setIdeas([]);
        }
      } catch (error) {
        console.error('Error fetching ideas:', error);
        setIdeas([]); // Reset ideas on error to prevent crashes
      }
    };

    fetchIdeas();
  }, [filter]); // Re-run effect when filter changes

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Ideation Portal</h1>
            <p className="text-muted-foreground mt-1">Submit ideas or request solutions from the community.</p>
          </div>
          <div className="flex items-center gap-4">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">Filter Ideas: {filter.charAt(0).toUpperCase() + filter.slice(1)}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilter('open')}>Open Ideas</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('closed')}>Closed Ideas</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('all')}>All Ideas</DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
            <RequestSolutionDialog />
            <Button asChild>
                <Link href="/ideation/new">Submit an Idea</Link>
            </Button>
          </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map((idea) => {
          const config = typeConfig[idea.type] || defaultConfig;
          const authorName = idea.author?.name || 'Unknown Author';
          const authorAvatar = idea.author?.avatarUrl;

          return (
            <Link
              href={`/ideation/${idea.id}`}
              key={idea.id}
              className="block">
              <Card className="h-full flex flex-col hover:border-primary/50 transition-colors duration-300 hover:bg-card/50">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg line-clamp-2">{idea.title}</CardTitle>
                       <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge
                            variant={config.variant}
                            className={cn('whitespace-nowrap', config.className)}
                            >
                            {idea.type.replace('_', ' ')}
                        </Badge>
                        <Badge variant={idea.status === 'CLOSED' ? 'destructive' : 'secondary'}>
                            {idea.status === 'CLOSED' ? 'Closed' : 'Open'}
                        </Badge>
                       </div>
                  </div>
                  <CardDescription className="flex items-center gap-2 text-xs pt-2">
                      <Avatar className="h-5 w-5">
                          <AvatarImage src={authorAvatar || ''} alt={`${authorName}'s avatar`} />
                          <AvatarFallback>{authorName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>{authorName}</span>
                      <span>•</span>
                      <span>{timeAgo(idea.createdAt)}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">{idea.description}</p>
                </CardContent>
                <CardFooter>
                   <div className="w-full flex justify-start items-center text-sm text-muted-foreground">
                      <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-1.5">
                              <span>{idea.totalProposals || 0} Proposals</span>
                              <Lightbulb className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex items-center gap-1.5">
                               <span>{idea.totalPrototypes || 0} Prototypes</span>
                              <Wrench className="h-4 w-4 text-yellow-500" />
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
