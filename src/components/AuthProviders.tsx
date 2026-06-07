'use client';

import { MsalProvider } from '@azure/msal-react';

import { AuthProvider } from '@/context/AuthContext';
import { msalInstance } from '@/lib/msal';

export default function AuthProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthProvider>{children}</AuthProvider>
    </MsalProvider>
  );
}
