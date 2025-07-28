
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User } from '@/lib/types';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Updated to use the correct API endpoint
        const response = await axios.get(`${API_BASE_URL}/api/profile/me`, { withCredentials: true });
        if (response.data) {
          setCurrentUser(response.data);
        }
      } catch (error) {
        console.log('User is not logged in');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);


  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
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
