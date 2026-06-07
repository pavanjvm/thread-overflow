'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import type { User } from '@/lib/types';
import { establishSession, fetchCurrentUser, fetchSession, logoutFromSession } from '@/lib/auth';
import { isMsalConfigured, loginRequest, msalInstance } from '@/lib/msal';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  authConfigured: boolean;
  authError: string | null;
  login: (returnTo?: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const LOGIN_RETURN_TO_KEY = 'thread-overflow-login-return-to';

async function initializeMsal() {
  await msalInstance.initialize();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authConfigured, setAuthConfigured] = useState(isMsalConfigured);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshSession = async () => {
    try {
      const session = await fetchSession();

      if (!session.configured || !isMsalConfigured) {
        setCurrentUser(null);
        setAuthConfigured(false);
        setAuthError('Microsoft sign-in is not configured yet.');
        return;
      }

      setAuthConfigured(true);

      if (!session.user) {
        setCurrentUser(null);
        setAuthError(null);
        return;
      }

      try {
        const currentUserResponse = await fetchCurrentUser();
        setCurrentUser(currentUserResponse);
      } catch {
        setCurrentUser(session.user);
      }

      setAuthError(null);
    } catch {
      setCurrentUser(null);
      setAuthConfigured(isMsalConfigured);
      setAuthError('Unable to reach the authentication service.');
    }
  };

  const login = async (returnTo = '/hackathons') => {
    if (!isMsalConfigured) {
      setAuthConfigured(false);
      setAuthError('Microsoft sign-in is not configured yet.');
      return;
    }

    try {
      await initializeMsal();
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(LOGIN_RETURN_TO_KEY, returnTo);
      }
      await msalInstance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Failed to sign in with Microsoft.', error);
      setAuthError('Microsoft sign-in failed. Please try again.');
      throw error;
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      try {
        await initializeMsal();
        const redirectResult = await msalInstance.handleRedirectPromise();

        if (redirectResult?.account) {
          msalInstance.setActiveAccount(redirectResult.account);
        }

        if (redirectResult?.idToken) {
          await establishSession(redirectResult.idToken);
        }

        const [activeAccount] = msalInstance.getAllAccounts();
        if (activeAccount) {
          msalInstance.setActiveAccount(activeAccount);
        }

        await refreshSession();
      } finally {
        setLoading(false);
      }
    };

    void loadSession();
  }, []);

  const logout = async () => {
    try {
      await initializeMsal();
      const activeAccount = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0] ?? undefined;

      await logoutFromSession();
      setCurrentUser(null);
      setAuthError(null);

      await msalInstance.logoutRedirect({
        account: activeAccount,
      });
    } catch (error) {
      console.error('Failed to log out of Microsoft.', error);
      setAuthError('Unable to log out of the authentication service.');
      setCurrentUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, authConfigured, authError, login, refreshSession, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function consumeLoginReturnTo() {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.sessionStorage.getItem(LOGIN_RETURN_TO_KEY);
  if (value) {
    window.sessionStorage.removeItem(LOGIN_RETURN_TO_KEY);
  }

  return value;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
