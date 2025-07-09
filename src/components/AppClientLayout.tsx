
'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from "@/components/ui/toaster"
import Header from '@/components/Header';
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLandingPage = pathname === '/';
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(pathname);
  const isDashboardPage = pathname === '/dashboard';
  
  const isIdeationSection = pathname.startsWith('/ideation');
  const isHackathonSection = pathname.startsWith('/hackathons');

  const showAppShell = !isLandingPage && !isAuthPage && !isDashboardPage;
  const showSidebar = showAppShell && !isHackathonSection && !isIdeationSection;

  const topUsers = [...users].sort((a, b) => b.stars - a.stars).slice(0, 3);
  
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
            {(showAppShell || isDashboardPage) && <Header showSidebar={showSidebar} setIsChatOpen={setIsChatOpen} />}
            <main className={cn(
              "flex-grow",
              (showAppShell || isLandingPage || isDashboardPage) && "container mx-auto px-4 py-8"
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

        <ChatPanel open={isChatOpen} onOpenChange={setIsChatOpen} />
        {<Toaster />}
    </SidebarProvider>
  );
}
