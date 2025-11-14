import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import jwtDecode from '@/utils/jwtDecode';

const PUBLIC_PATHS = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/verify-otp',
  '/first-login-reset',
];
const PROTECTED_PATH_PREFIXES = ['/admin', '/sales', '/engineer'];

const DASHBOARD_BY_ROLE: Record<string, string> = {
  ADMIN: '/admin/dashboard',
  SALES: '/sales/dashboard',
  ENGINEER: '/engineer/dashboard',
};

function getDashboardPath(role: string | undefined) {
  if (!role) return '/login';
  return DASHBOARD_BY_ROLE[role.toUpperCase()] || DASHBOARD_BY_ROLE.ENGINEER;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isProtectedRoute =
    pathname === '/' ||
    PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isProtectedRoute || isPublicRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get('authToken')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const decoded = jwtDecode(token);
  const role = decoded?.role?.toUpperCase();

  if (!role) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
  }

  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
  }

  if (pathname.startsWith('/sales') && role !== 'SALES' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
  }

  if (
    pathname.startsWith('/engineer') &&
    role !== 'ENGINEER' &&
    role !== 'ADMIN' &&
    role !== 'SALES'
  ) {
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/sales/:path*', '/engineer/:path*'],
};
