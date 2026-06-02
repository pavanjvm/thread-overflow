
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User } from '@/lib/types';
import { users } from '@/lib/mock-data';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_STORAGE_KEY = 'thread-overflow-current-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);

      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser) as User);
      } else {
        setCurrentUser(users[0] ?? null);
      }
    } catch {
      setCurrentUser(users[0] ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSetCurrentUser = (user: User | null) => {
    setCurrentUser(user);

    if (typeof window === 'undefined') {
      return;
    }

    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const logout = () => {
    handleSetCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser: handleSetCurrentUser, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
