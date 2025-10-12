'use client';

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { AuthProvider } from '@/context/AuthContext';
import { AuthErrorBoundary } from '@/components/error-boundaries';
import { NavigationProvider } from '@/components/providers/NavigationProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={defaultSystem}>
      <NavigationProvider>
        <AuthErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </AuthErrorBoundary>
      </NavigationProvider>
    </ChakraProvider>
  );
}
