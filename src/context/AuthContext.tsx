
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { users } from '@/lib/mock-data';

interface AuthContextType {
  currentUser: User | null;
  login: (userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // For this prototype, we'll set the initial user to Alice (admin)
  const [currentUser, setCurrentUser] = useState<User | null>(users[0]);

  const login = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setCurrentUser(user || null);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
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
