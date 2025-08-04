'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lightbulb, Wrench } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import type { Idea } from '@/lib/types';
import { HoverEffect, Card, CardTitle, CardDescription } from '@/components/ui/card-hover-effect';

interface IdeationCardHoverProps {
  ideas: Idea[];
}

// Define a specific type for the configuration object keys
type IdeaType = 'IDEATION' | 'SOLUTION_REQUEST';

const typeConfig: Record<IdeaType, { variant: 'secondary'; className: string }> = {
  'IDEATION': { variant: 'secondary', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
  'SOLUTION_REQUEST': { variant: 'secondary', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
};

const defaultConfig = { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300' };

export default function IdeationCardHover({ ideas }: IdeationCardHoverProps) {
  // Convert ideas to the format expected by HoverEffect
  const hoverItems = ideas.map((idea) => {
    const config = typeConfig[idea.type] || defaultConfig;
    const authorName = idea.author?.name || 'Unknown Author';
    const authorAvatar = idea.author?.avatarUrl;

    return {
      title: idea.title,
      description: `${authorName} • ${timeAgo(idea.createdAt)} • ${idea.totalProposals || 0} Proposals • ${idea.totalPrototypes || 0} Prototypes`,
      link: `/ideation/${idea.id}`,
      // Additional data for custom rendering
      idea: idea,
      config: config,
      authorName: authorName,
      authorAvatar: authorAvatar
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4">
      <HoverEffect 
        items={hoverItems} 
        className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      />
    </div>
  );
}

// Custom card component that extends the hover effect
export function IdeationCard({ idea }: { idea: Idea }) {
  const config = typeConfig[idea.type] || defaultConfig;
  const authorName = idea.author?.name || 'Unknown Author';
  const authorAvatar = idea.author?.avatarUrl;

  return (
    <Link href={`/ideation/${idea.id}`} className="block h-full">
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 h-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start gap-2 mb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
              {idea.title}
            </CardTitle>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge
                variant={config.variant}
                className={cn('whitespace-nowrap text-xs', config.className)}
              >
                {idea.type.replace('_', ' ')}
              </Badge>
              <Badge 
                variant={idea.status === 'CLOSED' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {idea.status === 'CLOSED' ? 'Closed' : 'Open'}
              </Badge>
            </div>
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
            <Avatar className="h-5 w-5">
              <AvatarImage src={authorAvatar || ''} alt={`${authorName}'s avatar`} />
              <AvatarFallback>{authorName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span>{authorName}</span>
            <span>•</span>
            <span>{timeAgo(idea.createdAt)}</span>
          </div>

          {/* Description */}
          <CardDescription className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
            {idea.description}
          </CardDescription>

          {/* Footer - Stats */}
          <div className="flex justify-start items-center text-sm text-gray-500 dark:text-gray-400">
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
        </div>
      </Card>
    </Link>
  );
} 