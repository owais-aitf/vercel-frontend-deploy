'use client';

import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { ProtectedRoute, RoleGuard } from '@/shared/lib/auth-guard';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const { logout } = useContext(AuthContext);
  const router = useRouter();
  return (
    <ProtectedRoute>
      <RoleGuard allowed={['ADMIN']}>
        <Box p={8}>
          <Heading size="lg">Admin Dashboard</Heading>
          <Text mt={2}>Welcome to the Admin Dashboard</Text>
          <Button
            mt={4}
            size="sm"
            colorScheme="red"
            onClick={() => {
              logout();
              router.push('/login');
            }}
          >
            Logout
          </Button>
        </Box>
      </RoleGuard>
    </ProtectedRoute>
  );
}
