'use client';

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api from '@/shared/lib/api-client';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { clearAllCaches } from '@/shared/utils/cache';

const LOGOUT_FLAG_KEY = 'justLoggedOut';
const PROFILE_ENDPOINT = '/auth/me';
const LOGOUT_ENDPOINT = '/auth/logout';

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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: (options?: {
    suppressLoading?: boolean;
  }) => Promise<User | null>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ id: '', email: '', role: '' }),
  logout: async () => {},
  refreshUser: async () => null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isHydrated = useIsHydrated();

  const refreshUser = useCallback(
    async (options?: { suppressLoading?: boolean }) => {
      if (!isHydrated) return null;
      if (!options?.suppressLoading) {
        setIsLoading(true);
      }
      try {
        const response = await api.get(PROFILE_ENDPOINT);
        const profile = response.data?.data || null;
        setUser(profile);
        return profile;
      } catch (error) {
        console.error('Failed to fetch current user profile:', error);
        setUser(null);
        return null;
      } finally {
        if (!options?.suppressLoading) {
          setIsLoading(false);
        }
      }
    },
    [isHydrated]
  );

  useEffect(() => {
    if (!isHydrated) return;
    void refreshUser();
  }, [isHydrated, refreshUser]);

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      const res = await api.post('/auth/login', { email, password });
      const responseData = res.data?.data;
      const userFromRes = res.data?.data?.user;

      const isFirstLogin = responseData?.isFirstLogin;
      const mustResetPassword = responseData?.mustResetPassword;

      const userData: User = {
        ...userFromRes,
        isFirstLogin: isFirstLogin ?? false,
        mustResetPassword: mustResetPassword ?? false,
      };

      // Clear logout flag on successful login
      sessionStorage.removeItem(LOGOUT_FLAG_KEY);

      setUser(userData);

      return userData;
    },
    []
  );

  const logout = useCallback(async () => {
    clearAllCaches();
    try {
      await api.post(LOGOUT_ENDPOINT);
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      sessionStorage.setItem(LOGOUT_FLAG_KEY, 'true');
      setUser(null);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, logout, refreshUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
