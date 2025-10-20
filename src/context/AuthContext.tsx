'use client';

import React, { createContext, useEffect, useState } from 'react';
import api from '@/shared/lib/api-client';
import jwtDecode from '@/utils/jwtDecode';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { clearAllCaches } from '@/shared/utils/cache';

type User = {
  id: string;
  email: string;
  role: string;
  fullName?: string;
  isFirstLogin?: boolean;  
  mustResetPassword?: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  setToken: (t: string | null) => void;
  setUser: (u: User | null) => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => ({ id: '', email: '', role: '' }),
  logout: () => {},
  setToken: () => {},
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const isHydrated = useIsHydrated();

  useEffect(() => {
    if (!isHydrated) return;

    try {
      const t = localStorage.getItem('authToken');
      const userDataString = localStorage.getItem('user');
      
      if (t && userDataString) {
        setTokenState(t);
        const userData = JSON.parse(userDataString);
        setUser(userData);
      } else if (t) {
        // Fallback to JWT decode if user data is missing
        setTokenState(t);
        const decoded = jwtDecode(t);
        if (decoded) {
          setUser(decoded);
        } else {
          localStorage.removeItem('authToken');
          setTokenState(null);
        }
      }
    } catch (error) {
      console.error('Error loading auth token:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user'); // ✅ ADDED
      setTokenState(null);
      setUser(null);
    }
  }, [isHydrated]);

  const setToken = (t: string | null) => {
    if (!isHydrated) return;
    if (t) {
      localStorage.setItem('authToken', t);
      setTokenState(t);
    } else {
      localStorage.removeItem('authToken');
      setTokenState(null);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login', { email, password });
    const tokenFromRes = res.data?.data?.token;
    const userFromRes = res.data?.data?.user;
    
    if (!tokenFromRes) throw new Error('Token missing from response');
    
    const userData = userFromRes || jwtDecode(tokenFromRes);
    
    // ✅ CRITICAL FIX - Save user data to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    setToken(tokenFromRes);
    setUser(userData);
    
    return userData;
  };

  const logout = () => {
    clearAllCaches();
    setToken(null);
    setUser(null);
    localStorage.removeItem('user'); // ✅ ADDED
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, setToken, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
