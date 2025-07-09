import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppClientLayout from '@/components/AppClientLayout';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

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
      <head />
      <body className={cn("font-body antialiased", inter.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppClientLayout>
            {children}
          </AppClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
