'use client';

import React, { createContext, useEffect, useState } from 'react';
import api from '@/shared/lib/api-client';
import jwtDecode from '@/utils/jwtDecode';
import { useIsHydrated } from '@/hooks/useIsHydrated';

type User = {
  id: string;
  email: string;
  role: string;
  fullName?: string;
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
  logout: () => { },
  setToken: () => { },
  setUser: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const isHydrated = useIsHydrated();

  useEffect(() => {
    if (!isHydrated) return;

    try {
      const t = localStorage.getItem('authToken');
      if (t) {
        setTokenState(t);
        const decoded = jwtDecode(t);
        if (decoded) {
          setUser(decoded);
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('authToken');
          setTokenState(null);
        }
      }
    } catch (error) {
      console.error('Error loading auth token:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('authToken');
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
    setToken(tokenFromRes);
    setUser(userData);
    // Return user data so caller can use it immediately
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    // optionally call backend logout endpoint if available
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, setToken, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
