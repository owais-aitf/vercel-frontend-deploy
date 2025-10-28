'use client';

import { ReactNode } from 'react';
import { RoleGuard } from '@/shared/lib/auth-guard';

export default function SalesLayout({ children }: { children: ReactNode }) {
  return <RoleGuard allowed={['SALES', 'ADMIN']}>{children}</RoleGuard>;
}
