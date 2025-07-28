
'use client';

import Link from 'next/link';
// import { ideas } from '@/lib/mock-data'; // Removed mock data import
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lightbulb, Wrench } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import RequestSolutionDialog from './_components/RequestSolutionDialog';
import { useState, useEffect } from 'react'; // Import useEffect
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import axios from 'axios'; // Import axios
import { API_BASE_URL } from '@/lib/constants'; // Import API_BASE_URL

const typeConfig = {
    'Ideation': { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
    'Solution Request': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
    'IDEATION': { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' }, // Added for backend data
    'SOLUTION REQUEST': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
};

export default function IdeationPortalPage() {
  const [filter, setFilter] = useState('open'); // 'open' or 'closed' or 'all'
  const [ideas, setIdeas] = useState([]); // State to hold fetched ideas

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        let url = `${API_BASE_URL}/api/ideas`;
        if (filter !== 'all') {
          url = `${API_BASE_URL}/api/ideas?status=${filter.toUpperCase()}`;
        }
        const response = await axios.get(url, { withCredentials: true });
        setIdeas(response.data); // Assuming the response data is the array of ideas
      } catch (error) {
        console.error('Error fetching ideas:', error);
      }
    };

    fetchIdeas();
  }, [filter]); // Refetch when filter changes

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
                    <Button variant="outline">Filter Ideas: {filter === 'open' ? 'Open' : filter === 'closed' ? 'Closed' : 'All'}</Button>
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
          const config = typeConfig[idea.type];
          return (
            <Link
              href={`/ideation/${idea.id}`}
              key={idea.id}
              className="block">
              <Card className="h-full flex flex-col hover:border-primary/50 transition-colors duration-300 hover:bg-card/50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{idea.title}</CardTitle>
                       <div className="flex items-center gap-2">
                        <Badge
                            variant={config.variant}
                            className={cn('whitespace-nowrap', config.className)}
                            >
                            {idea.type}
                        </Badge>
                        {/* Assuming your API response includes a status field like 'OPEN' or 'CLOSED' */}
                        <Badge variant={idea.status === 'CLOSED' ? 'destructive' : 'secondary'}>
                            {idea.status === 'CLOSED' ? 'Closed' : 'Open'}
                        </Badge>
                       </div>
                  </div>
                  <CardDescription className="flex items-center gap-2 text-xs pt-2">
                      <Avatar className="h-5 w-5">
                          <AvatarImage src={idea.author?.avatarUrl} data-ai-hint="user avatar" /> {/* Added optional chaining */}
                          <AvatarFallback>{idea.author?.name.charAt(0)}</AvatarFallback> {/* Added optional chaining */}
                      </Avatar>
                      <span>{idea.author?.name}</span> {/* Added optional chaining */}
                      <span>•</span>
                      <span>{timeAgo(idea.createdAt)}</span> {/* Use timeAgo function */}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">{idea.description}</p>
                </CardContent>
                <CardFooter>
                   <div className="w-full flex justify-start items-center text-sm text-muted-foreground">
                      <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-1.5">
                              {/* Assuming your API returns totalProposals and totalPrototypes */}
                              <span>{idea.totalProposals} Proposals</span>
                              <Lightbulb className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex items-center gap-1.5">
                               <span>{idea.totalPrototypes} Prototypes</span>
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
