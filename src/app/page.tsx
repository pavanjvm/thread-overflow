'use client';

import { Button } from '@/components/ui/button';
import TextPressure from '@/components/TextPressure';
import Aurora from '@/components/Aurora';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { consumeLoginReturnTo, useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, authConfigured, authError, login } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const returnTo = searchParams.get('returnTo') || '/hackathons';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (currentUser) {
      router.replace(consumeLoginReturnTo() || returnTo);
    }
  }, [currentUser, returnTo, router]);

  const handleLogin = async () => {
    try {
      setIsSubmitting(true);
      await login(returnTo);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {authError && (
            <div className="mt-6 max-w-xl rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
              <div className="flex items-center justify-center gap-2 font-medium text-destructive">
                <AlertCircle className="h-4 w-4" />
                Sign-in is not ready
              </div>
              <p className="mt-2 text-muted-foreground">{authError}</p>
            </div>
          )}
          <div className="pt-8">
            <Button size="lg" disabled={!authConfigured || isSubmitting} onClick={() => void handleLogin()}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Signing in...' : 'Login'}
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
          From community forums to ideation and hackathon portals, we connect brilliant minds with real-world challenges.
        </p>
        {authError && (
          <div className="mt-6 max-w-xl rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <div className="flex items-center justify-center gap-2 font-medium text-destructive">
              <AlertCircle className="h-4 w-4" />
              Sign-in is not ready
            </div>
            <p className="mt-2 text-muted-foreground">{authError}</p>
          </div>
        )}
        <div className="pt-8">
          <Button size="lg" disabled={!authConfigured || isSubmitting} onClick={() => void handleLogin()}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Signing in...' : 'Login'}
          </Button>
        </div>
      </div>
    </div>
  );
}
