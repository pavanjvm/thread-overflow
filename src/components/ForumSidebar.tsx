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
import { communities } from '@/lib/mock-data';
import {
  Newspaper,
  Plus,
  Rocket,
  MessagesSquare,
  Code,
  Flame,
  FileText,
  Swords,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Community } from '@/lib/types';

interface ForumSidebarProps {
  pathname: string;
  communities: Community[];
}

const forumTopics = [
  { name: 'General', slug: 'general', icon: MessagesSquare },
  { name: 'Tech', slug: 'tech', icon: Code },
  { name: 'Trending', slug: 'trending', icon: Flame },
];

export default function ForumSidebar({ pathname, communities }: ForumSidebarProps) {
  const searchParams = useSearchParams();

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Navigate</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/ideation')}>
              <Link href="/ideation">
                <span className="flex items-center gap-2">
                  <Rocket /> Ideation Portal
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/hackathons')}>
              <Link href="/hackathons">
                <span className="flex items-center gap-2">
                  <Swords /> Hackathon Portal
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/feed'}>
              <Link href="/feed">
                <span className="flex items-center gap-2">
                  <Newspaper /> All Posts
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Topics</SidebarGroupLabel>
        <SidebarMenu>
          {forumTopics.map((topic) => (
            <SidebarMenuItem key={topic.slug}>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/search' && searchParams.get('q') === topic.slug}
              >
                <Link href={`/search?q=${topic.slug}`}>
                  <span className="flex items-center gap-2">
                    <topic.icon />
                    <span>{topic.name}</span>
                  </span>
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
                <span className="flex items-center gap-2">
                  <FileText /> Drafts
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Communities</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/c/new'}>
              <Link href="/c/new">
                <span className="flex items-center gap-2">
                  <Plus /> Create Community
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {communities.map((community) => (
            <SidebarMenuItem key={community.id}>
              <SidebarMenuButton asChild isActive={pathname === `/c/${community.slug}`}>
                <Link href={`/c/${community.slug}`}>
                  <span className="flex items-center gap-2">
                    <Avatar className="size-5">
                      <AvatarImage src={community.iconUrl} data-ai-hint="community icon" />
                      <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{community.name}</span>
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
