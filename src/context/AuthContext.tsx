
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User } from '@/lib/types';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  // login and logout are now handled by your backend's auth flow (e.g., cookies)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This effect runs once when the app loads
    const fetchCurrentUser = async () => {
      try {
        // The cookie is sent automatically by the browser
        const response = await axios.get(`${API_BASE_URL}/api/users/me`);
        if (response.data) {
          setCurrentUser(response.data);
        }
      } catch (error) {
        // This is expected if the user is not logged in
        console.log('Not logged in');
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
