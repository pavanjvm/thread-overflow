'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Toaster } from "@/components/ui/toaster"
import Header from '@/components/Header';
import { cn } from '@/lib/utils';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { communities } from '@/lib/mock-data';
import { Newspaper, Plus, CircleDollarSign, BrainCircuit, Bug, Lightbulb, MessageSquare, FileText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';

export default function AppClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isLandingPage = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  
  useEffect(() => {
    if (isLandingPage) {
      document.body.classList.add('landing-theme');
    } else {
      document.body.classList.remove('landing-theme');
    }

    return () => {
      document.body.classList.remove('landing-theme');
    }
  }, [isLandingPage]);

  if (isLandingPage || isAuthPage) {
     const mainContainerClass = isLandingPage ? "container mx-auto px-4 py-8" : "";
     return (
      <>
        <div className="flex flex-col min-h-screen">
          <main className={cn("flex-grow", mainContainerClass)}>
            {children}
          </main>
        </div>
        <Toaster />
      </>
    );
  }

  const topics = [
    { name: 'Finance', slug: 'finance', icon: CircleDollarSign },
    { name: 'AI', slug: 'ai', icon: BrainCircuit },
    { name: 'Bug Fixes', slug: 'bug-fixes', icon: Bug },
    { name: 'Innovations', slug: 'innovations', icon: Lightbulb },
    { name: 'Ideas & Suggestions', slug: 'ideas-suggestions', icon: MessageSquare },
  ];

  return (
    <>
      <SidebarProvider>
        <Sidebar>
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel>Discover</SidebarGroupLabel>
              <SidebarMenu>
                  <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === '/feed'}>
                          <Link href="/feed"><Newspaper /> All Posts</Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
                  {topics.map((topic) => (
                      <SidebarMenuItem key={topic.slug}>
                          <SidebarMenuButton asChild isActive={pathname === '/search' && searchParams.get('q') === topic.slug}>
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
                          <Link href="/drafts"><FileText /> Drafts</Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Communities</SidebarGroupLabel>
              <SidebarMenu>
                  <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === '/c/new'}>
                          <Link href="/c/new"><Plus /> Create Community</Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
                  {communities.map((community) => (
                      <SidebarMenuItem key={community.id}>
                          <SidebarMenuButton asChild isActive={pathname === `/c/${community.slug}`}>
                              <Link href={`/c/${community.slug}`}>
                                  <Avatar className="size-5"><AvatarImage src={community.iconUrl} data-ai-hint="community icon" /><AvatarFallback>{community.name.charAt(0)}</AvatarFallback></Avatar>
                                  <span>{community.name}</span>
                              </Link>
                          </SidebarMenuButton>
                      </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <Header />
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </>
  );
}
