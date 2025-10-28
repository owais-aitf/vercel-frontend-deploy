'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import { redirectByRole } from '@/shared/lib/auth-guard';
import { Spinner, Center } from '@chakra-ui/react';

export default function Home() {
  const { token, user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    // Add a small delay to ensure state is fully updated after logout
    const timeoutId = setTimeout(() => {
      // If token exists and user is authenticated, redirect to their dashboard
      if (token && user?.role) {
        const dashboardPath = redirectByRole(user.role);
        router.replace(dashboardPath);
      } else {
        // No token, redirect to login
        router.replace('/login');
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [token, user, router]);

  // Show loading spinner while checking authentication
  return (
    <Center h="100vh">
      <Spinner size="xl" color="blue.500" />
    </Center>
  );
}
