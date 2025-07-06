'use client';

import { usePathname } from 'next/navigation';
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
import { Newspaper, Plus, Building2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AppClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  
  if (isLandingPage) {
     return (
      <body className={cn(
        "font-body antialiased",
        "landing-theme"
      )}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    );
  }

  return (
    <body className={cn("font-body antialiased")}>
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
                   <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname.startsWith('/c/') && !pathname.endsWith('/new')}>
                          <Link href={`/c/${communities[0].slug}`}><Building2 /> Communities</Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Your Communities</SidebarGroupLabel>
              <SidebarMenu>
                  <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === '/c/new'}>
                          <Link href="/c/new"><Plus /> Create Community</Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
                  {communities.slice(0, 2).map((community) => (
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
            <SidebarGroup>
              <SidebarGroupLabel>Recently Visited</SidebarGroupLabel>
              <SidebarMenu>
                  {communities.slice(1, 3).map((community) => (
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
    </body>
  );
}
