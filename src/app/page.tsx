'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import TextPressure from '@/components/TextPressure';
import IconCloudDisplay from '@/components/IconCloudDisplay';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a skeleton to avoid hydration mismatch and layout shift.
    // The actual components will render on the client after mounting.
    return (
      <div className="grid md:grid-cols-2 gap-12 items-center py-24">
        <div className="flex flex-col justify-center text-center md:text-left">
          <div className="h-24" />
          <p className="mt-12 text-2xl text-muted-foreground max-w-lg mx-auto md:mx-0">
            Where your silly thoughts, brilliant ideas, and random musings collide in a big, friendly internet explosion!
          </p>
          <div className="flex justify-center md:justify-start space-x-4 pt-8">
            <Button asChild size="lg">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/signup">Create Account</Link>
            </Button>
          </div>
        </div>
        <div className="flex justify-center items-center p-8 h-[500px]" />
      </div>
    );
  }

  const textColor =
    resolvedTheme === 'light'
      ? 'hsl(var(--foreground))'
      : 'hsl(var(--primary))';

  return (
    <div className="grid md:grid-cols-2 gap-12 items-center py-24">
      <div className="flex flex-col justify-center text-center md:text-left">
        <div className="h-24">
          <TextPressure
            text="Thread Overflow"
            textColor={textColor}
          />
        </div>
        <p className="mt-12 text-2xl text-muted-foreground max-w-lg mx-auto md:mx-0">
          Where your silly thoughts, brilliant ideas, and random musings collide in a big, friendly internet explosion!
        </p>
        <div className="flex justify-center md:justify-start space-x-4 pt-8">
          <Button asChild size="lg">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/signup">Create Account</Link>
          </Button>
        </div>
      </div>
      <div className="flex justify-center items-center p-8 h-[500px]">
        <IconCloudDisplay />
      </div>
    </div>
  );
}
