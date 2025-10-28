'use client';

import { ReactNode } from 'react';
import { RoleGuard } from '@/shared/lib/auth-guard';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RoleGuard allowed={['ADMIN']}>{children}</RoleGuard>;
}
