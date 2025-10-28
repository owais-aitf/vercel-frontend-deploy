'use client';

import { ReactNode } from 'react';
import { RoleGuard } from '@/shared/lib/auth-guard';

export default function EngineerLayout({ children }: { children: ReactNode }) {
  return <RoleGuard allowed={['ENGINEER']}>{children}</RoleGuard>;
}
