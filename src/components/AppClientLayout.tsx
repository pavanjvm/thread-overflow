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
import AIChatbot from './AIChatbot';
import { ThemeToggle } from './ThemeToggle';
import ForumSidebar from './ForumSidebar';
import IdeationSidebar from './IdeationSidebar';

export default function AppClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLandingPage = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isDashboardPage = pathname === '/dashboard';
  const showAppShell = !isLandingPage && !isAuthPage && !isDashboardPage;
  
  const topUsers = [...users].sort((a, b) => b.stars - a.stars).slice(0, 3);
  
  const isIdeationSection = pathname.startsWith('/ideation');

  return (
    <SidebarProvider mounted={mounted}>
        {showAppShell && (
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
