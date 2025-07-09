
'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarInset,
} from '@/components/ui/sidebar';
import { communities, users } from '@/lib/mock-data';
import { useState, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
import ForumSidebar from './ForumSidebar';
import IdeationSidebar from './IdeationSidebar';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const Header = dynamic(() => import('@/components/Header'), { 
    ssr: false,
    loading: () => (
        <header className="bg-card border-b sticky top-0 z-50">
            <div className="flex items-center justify-between h-16 gap-4 px-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-7" />
                    <Skeleton className="h-6 w-32 hidden sm:inline" />
                </div>
                <div className="flex-1 max-w-lg mx-4">
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </div>
        </header>
    )
});

const AIChatbot = dynamic(() => import('./AIChatbot'), { ssr: false });
const ChatPanel = dynamic(() => import('./ChatPanel'), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/50 z-50" />
});

export default function AppClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const topUsers = [...users].sort((a, b) => b.stars - a.stars).slice(0, 3);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLandingPage = pathname === '/';
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(pathname);
  
  // Render simple layout for landing and auth pages
  if (isLandingPage || isAuthPage) {
    return (
      <>
        {isLandingPage && (
          <div className="absolute top-4 right-4 z-50">
            <ThemeToggle />
          </div>
        )}
        <main className="container mx-auto px-4 py-8">{children}</main>
        <Toaster />
      </>
    );
  }

  // Determine if the full app shell should be used
  const isDashboardPage = pathname === '/dashboard';
  const isHackathonSection = pathname.startsWith('/hackathons');
  
  // Determine which sidebar to show
  const isIdeationSection = pathname.startsWith('/ideation') || pathname === '/leaderboard';
  const showSidebar = !isDashboardPage && !isHackathonSection;
  
  return (
    <SidebarProvider mounted={mounted}>
        {showSidebar && (
            <Sidebar>
                <SidebarContent className="p-2">
                    {isIdeationSection ? (
                        <IdeationSidebar pathname={pathname} topUsers={topUsers} />
                    ) : (
                        <ForumSidebar pathname={pathname} communities={communities} />
                    )}
                </SidebarContent>
            </Sidebar>
        )}
        
        <SidebarInset>
            <Header showSidebar={showSidebar} setIsChatOpen={setIsChatOpen} />
            <main className={cn("flex-grow", "container mx-auto px-4 py-8")}>
                {children}
            </main>
        </SidebarInset>
        
        {pathname === '/feed' && (
            <div className="fixed bottom-6 right-6 z-50">
                <AIChatbot />
            </div>
        )}

        <ChatPanel open={isChatOpen} onOpenChange={setIsChatOpen} />
        <Toaster />
    </SidebarProvider>
  );
}
