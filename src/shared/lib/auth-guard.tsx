'use client';

import { ReactNode, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace('/login');
    }
  }, [token, router]);

  if (!token) return null;
  return <>{children}</>;
}

export function redirectByRole(role?: string | null): string {
  if (role === 'ADMIN') return '/admin/dashboard';
  if (role === 'SALES') return '/sales/dashboard';
  return '/engineer/dashboard';
}

type Role = 'ADMIN' | 'SALES' | 'ENGINEER';
export function RoleGuard({
  children,
  allowed,
}: {
  children: ReactNode;
  allowed: Role[];
}) {
  const { user, token } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace('/login');
      return;
    }
    const role = (user?.role || '') as Role;
    if (user && role && !allowed.includes(role)) {
      router.replace(redirectByRole(user.role));
    }
  }, [token, user, allowed, router]);

  if (!token) return null;
  const role = (user?.role || '') as Role;
  if (user && role && !allowed.includes(role)) return null;
  return <>{children}</>;
}
