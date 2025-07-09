
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
import { communities, users } from '@/lib/mock-data';
import { Newspaper, Plus, CircleDollarSign, BrainCircuit, Bug, Lightbulb, MessageSquare, FileText, Trophy, Star, Rocket, MessagesSquare, Code, Flame } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import AIChatbot from './AIChatbot';
import Loading from '@/app/loading';
import { ThemeToggle } from './ThemeToggle';

export default function AppClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLandingPage = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isDashboardPage = pathname === '/dashboard';
  const showAppShell = !isLandingPage && !isAuthPage && !isDashboardPage;
  
  const topUsers = [...users].sort((a, b) => b.stars - a.stars).slice(0, 3);

  if (!mounted) {
    return <Loading />;
  }
  
  const isIdeationSection = pathname.startsWith('/ideation');

  const forumTopics = [
    { name: 'General', slug: 'general', icon: MessagesSquare },
    { name: 'Tech', slug: 'tech', icon: Code },
    { name: 'Trending', slug: 'trending', icon: Flame },
  ];

  const ideationTopics = [
    { name: 'Finance', slug: 'finance', icon: CircleDollarSign },
    { name: 'AI', slug: 'ai', icon: BrainCircuit },
    { name: 'Bug Fixes', slug: 'bug-fixes', icon: Bug },
    { name: 'Innovations', slug: 'innovations', icon: Lightbulb },
  ];

  const currentTopics = isIdeationSection ? ideationTopics : forumTopics;

  return (
    <SidebarProvider>
        {showAppShell && (
            <Sidebar>
                <SidebarContent className="p-2">
                  <SidebarGroup>
                      <SidebarGroupLabel>Navigate</SidebarGroupLabel>
                      <SidebarMenu>
                          {isIdeationSection ? (
                            <>
                              <SidebarMenuItem>
                                  <SidebarMenuButton asChild isActive={false}>
                                      <Link href="/feed"><MessageSquare /> Community Forum</Link>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                              <SidebarMenuItem>
                                  <SidebarMenuButton asChild isActive={pathname === '/ideation'}>
                                      <Link href="/ideation"><Rocket /> All Projects</Link>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                            </>
                          ) : (
                            <>
                              <SidebarMenuItem>
                                  <SidebarMenuButton asChild isActive={pathname.startsWith('/ideation')}>
                                      <Link href="/ideation"><Rocket /> Ideation Portal</Link>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                              <SidebarMenuItem>
                                  <SidebarMenuButton asChild isActive={pathname === '/feed'}>
                                      <Link href="/feed"><Newspaper /> All Posts</Link>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                            </>
                          )}
                      </SidebarMenu>
                  </SidebarGroup>

                  <SidebarGroup>
                      <SidebarGroupLabel>Topics</SidebarGroupLabel>
                      <SidebarMenu>
                          {currentTopics.map((topic) => (
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
                  {isIdeationSection && (
                    <SidebarGroup>
                      <SidebarGroupLabel>Leaderboard</SidebarGroupLabel>
                      <SidebarMenu>
                          <SidebarMenuItem>
                              <SidebarMenuButton asChild isActive={pathname === '/leaderboard'}>
                                  <Link href="/leaderboard"><Trophy /> View All</Link>
                              </SidebarMenuButton>
                          </SidebarMenuItem>
                          {topUsers.map((user) => (
                              <SidebarMenuItem key={user.id}>
                                  <SidebarMenuButton asChild isActive={pathname === `/profile`}>
                                      <Link href={`/profile`}>
                                          <Avatar className="size-5"><AvatarImage src={user.avatarUrl} data-ai-hint="user avatar" /><AvatarFallback>{user.name.charAt(0)}</AvatarFallback></Avatar>
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
                  )}
                  {!isIdeationSection && (
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
                  )}
                </SidebarContent>
            </Sidebar>
        )}
        <SidebarInset>
            {(showAppShell || isDashboardPage) && <Header />}
            <main className={cn(
              "flex-grow",
              (showAppShell || isLandingPage || isDashboardPage) && "container mx-auto px-4 py-8",
              isAuthPage && "flex items-center justify-center w-full py-12"
            )}>
                {isLandingPage && (
                    <div className="absolute top-4 right-4 z-50">
                        <ThemeToggle />
                    </div>
                )}
                {children}
            </main>
        </SidebarInset>
        
        {pathname === '/feed' && (
            <div className="fixed bottom-6 right-6 z-50">
                <AIChatbot />
            </div>
        )}

        {<Toaster />}
    </SidebarProvider>
  );
}
