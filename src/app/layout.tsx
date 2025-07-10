
import type {Metadata} from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import AppClientLayout from '@/components/AppClientLayout';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';

const manrope = Manrope({
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
      <body className={cn("font-body antialiased", manrope.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppClientLayout>
              {children}
            </AppClientLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
