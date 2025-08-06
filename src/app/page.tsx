'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import TextPressure from '@/components/TextPressure';
import Aurora from '@/components/Aurora';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a simple placeholder on the server and before the client has mounted
  // to avoid hydration mismatch, as our Aurora and TextPressure components
  // depend on client-side theme information.
  if (!mounted) {
    return (
      <div className="relative h-screen w-screen flex items-center justify-center overflow-hidden bg-background">
        <div className="z-10 flex flex-col items-center text-center px-4">
          <div className="h-32 w-full max-w-5xl" />
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl">
            From community forums to ideation and hackathon portals, we connect brilliant minds with real-world challenges.
          </p>
          <div className="flex space-x-4 pt-8">
            <Button asChild size="lg">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const lightColors = ["#BEB2FF", "#D9F4FF", "#BEB2FF"];
  const darkColors = ['#8f908f', '#726e6f', '#8f908f'];
  const isLight = resolvedTheme === 'light';
  const auroraColors = isLight ? lightColors : darkColors;

  const textColor = resolvedTheme === 'dark' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))';

  return (
    <div className="relative h-screen w-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Aurora colorStops={auroraColors} isLight={isLight} blend={isLight ? 0.4 : 1.0} />
      </div>
      <div className="z-10 flex flex-col items-center text-center px-4">
        <div className="h-32 w-full max-w-4xl">
          <TextPressure
            text="Thread Overflow"
            textColor={textColor}
            flex={true}
            width={false}
            weight={false}
            italic={false}
            alpha={false}
            stroke={false}
            scale={false}
            defaultWidth={20}
            defaultWeight={300}
          />
        </div>
        <p className="mt-4 text-xl text-muted-foreground max-w-3xl">
          From community forums to ideation and hackathons, we connect brilliant minds with real-world challenges.
        </p>
        <div className="flex space-x-4 pt-8">
          <Button asChild size="lg">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/signup">Create Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
