'use client';

import { ReactNode, useContext, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, user } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    //PUBLIC ROUTES - Allow access without redirecting
    const publicRoutes = ['/first-login-reset'];
    if (publicRoutes.includes(pathname)) {
      return; // Don't redirect, allow access
    }

    if (!token) {
      router.replace('/login');
      return;
    }

    // If user has first login flag, redirect to reset password
    if (user?.isFirstLogin && pathname !== '/first-login-reset') {
      // console.log(' NO TOKEN - Redirecting to login');
      router.replace('/first-login-reset');
    }
  }, [token, router, user, pathname]);

  //Allow public routes to render without token check
  const publicRoutes = ['/first-login-reset'];
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

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
  const pathname = usePathname();

  useEffect(() => {
    // Allow first-login-reset page
    if (pathname === '/first-login-reset') {
      return;
    }

    if (!token) {
      router.replace('/login');
      return;
    }
    const role = (user?.role || '') as Role;
    if (user && role && !allowed.includes(role)) {
      router.replace(redirectByRole(user.role));
    }
  }, [token, user, allowed, router, pathname]);

  //Allow first-login-reset page  to render
  if (pathname === '/first-login-reset') {
    return <>{children}</>;
  }

  if (!token) return null;
  const role = (user?.role || '') as Role;
  if (user && role && !allowed.includes(role)) return null;
  return <>{children}</>;
}
