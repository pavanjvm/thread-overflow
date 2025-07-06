'use client';

import { Toaster } from "@/components/ui/toaster"
import Header from '@/components/Header';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function AppClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  
  return (
    <body className={cn(
      "font-body antialiased",
      isLandingPage && "landing-theme"
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
