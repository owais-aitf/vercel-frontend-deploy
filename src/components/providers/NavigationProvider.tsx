'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  setNavigateFunction,
  clearNavigateFunction,
} from '@/shared/lib/navigation';

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Set the navigate function for use in non-React contexts
    setNavigateFunction((path: string) => {
      router.push(path);
    });

    // Cleanup on unmount
    return () => {
      clearNavigateFunction();
    };
  }, [router]);

  return <>{children}</>;
}
