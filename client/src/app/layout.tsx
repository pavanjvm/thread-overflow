import type {Metadata} from 'next';
import './globals.css';
import AppClientLayout from '@/components/AppClientLayout';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Thread Overflow',
  description: 'A modern forum for discussion and knowledge sharing.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased")}>
        <AppClientLayout>
          {children}
        </AppClientLayout>
      </body>
    </html>
  );
}
