'use client';

import { ReactNode, useContext, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import { toaster } from '@/components/ui/toaster';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    //PUBLIC ROUTES - Allow access without redirecting
    const publicRoutes = ['/first-login-reset'];
    if (publicRoutes.includes(pathname)) {
      return; // Don't redirect, allow access
    }

    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    // If user has first login flag, redirect to reset password
    if (user?.isFirstLogin && pathname !== '/first-login-reset') {
      // console.log(' NO TOKEN - Redirecting to login');
      router.replace('/first-login-reset');
    }
  }, [user, router, pathname, isLoading]);

  //Allow public routes to render without token check
  const publicRoutes = ['/first-login-reset'];
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  if (isLoading) return null;
  if (!user) return null;
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
  const { user, isLoading } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const hasShownToast = useRef(false);

  useEffect(() => {
    // Allow first-login-reset page
    if (pathname === '/first-login-reset') {
      return;
    }

    // Wait for auth to finish loading before checking token
    if (isLoading) {
      return;
    }

    if (isLoading) {
      return;
    }

    if (!user) {
      // Check if this is an intentional logout (don't show toast)
      const justLoggedOut = sessionStorage.getItem('justLoggedOut');

      // Show toast only if NOT from logout and only once per mount
      if (!justLoggedOut && !hasShownToast.current) {
        toaster.create({
          title: '❌ Authentication Required',
          description:
            'Please login to access this page. Your session may have expired or you are not authenticated.',
          type: 'error',
          duration: 5000,
        });
        hasShownToast.current = true;
      }

      // Clear the logout flag after checking
      if (justLoggedOut) {
        sessionStorage.removeItem('justLoggedOut');
      }

      router.replace('/login');
      return;
    }
    const role = (user?.role || '') as Role;
    if (user && role && !allowed.includes(role)) {
      router.replace(redirectByRole(user.role));
    }
  }, [user, allowed, router, pathname, isLoading]);

  //Allow first-login-reset page  to render
  if (pathname === '/first-login-reset') {
    return <>{children}</>;
  }

  // Show nothing while loading to prevent flash of content
  if (isLoading) return null;

  if (isLoading) return null;
  if (!user) return null;
  const role = (user.role || '') as Role;
  if (user && role && !allowed.includes(role)) return null;
  return <>{children}</>;
}
