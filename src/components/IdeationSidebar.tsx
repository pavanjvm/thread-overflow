'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import type { User } from '@/lib/types';
import {
  MessageSquare,
  CircleDollarSign,
  BrainCircuit,
  Bug,
  Lightbulb,
  FileText,
  Trophy,
  Star,
  Rocket,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface IdeationSidebarProps {
  pathname: string;
  topUsers: User[];
}

const ideationTopics = [
  { name: 'Finance', slug: 'finance', icon: CircleDollarSign },
  { name: 'AI', slug: 'ai', icon: BrainCircuit },
  { name: 'Bug Fixes', slug: 'bug-fixes', icon: Bug },
  { name: 'Innovations', slug: 'innovations', icon: Lightbulb },
];

export default function IdeationSidebar({ pathname, topUsers }: IdeationSidebarProps) {
  const searchParams = useSearchParams();
  
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Navigate</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={false}>
              <Link href="/feed">
                <MessageSquare /> Community Forum
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/ideation'}>
              <Link href="/ideation">
                <Rocket /> All Projects
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Topics</SidebarGroupLabel>
        <SidebarMenu>
          {ideationTopics.map((topic) => (
            <SidebarMenuItem key={topic.slug}>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/search' && searchParams.get('q') === topic.slug}
              >
                <Link href={`/search?q=${topic.slug}`}>
                  <topic.icon />
                  <span>{topic.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>My Content</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/drafts'}>
              <Link href="/drafts">
                <FileText /> Drafts
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Leaderboard</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/leaderboard'}>
              <Link href="/leaderboard">
                <Trophy /> View All
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {topUsers.map((user) => (
            <SidebarMenuItem key={user.id}>
              <SidebarMenuButton asChild isActive={pathname === `/profile`}>
                <Link href={`/profile`}>
                  <Avatar className="size-5">
                    <AvatarImage src={user.avatarUrl} data-ai-hint="user avatar" />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="flex-grow">{user.name}</span>
                  <div className="flex items-center gap-1 text-xs text-yellow-500">
                    <span>{user.stars}</span>
                    <Star className="size-3 fill-current" />
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
