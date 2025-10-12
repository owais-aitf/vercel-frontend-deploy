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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (t: string | null) => void;
  setUser: (u: User | null) => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
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

    const t = localStorage.getItem('authToken');
    if (t) {
      setTokenState(t);
      const decoded = jwtDecode(t);
      if (decoded) setUser(decoded);
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

  const login = async (email: string, password: string): Promise<void> => {
    const res = await api.post('/auth/login', { email, password });
    const tokenFromRes = res.data?.data?.token;
    const userFromRes = res.data?.data?.user;
    if (!tokenFromRes) throw new Error('Token missing from response');
    setToken(tokenFromRes);
    setUser(userFromRes || jwtDecode(tokenFromRes));
    // do not return the raw response to avoid exposing 'any' in the type
    return;
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
