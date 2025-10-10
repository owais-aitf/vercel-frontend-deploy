'use client';

import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Heading, Input, Button, Text } from '@chakra-ui/react';
import { AuthContext } from '@/context/AuthContext';
import { UserRole } from '@/shared/constants/roles';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('engineer12345@test.com');
  const [password, setPassword] = useState('Test@12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      // After login, check the decoded user from localStorage/AuthContext for role-based redirect
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('authToken')
          : null;
      let role: string | null = null;
      try {
        if (token) {
          const payload = token.split('.')[1];
          const decoded = JSON.parse(atob(payload));
          role = decoded?.role || null;
        }
      } catch {}

      if (role === UserRole.ADMIN) {
        router.push('/admin/dashboard');
      } else if (role === UserRole.SALES) {
        router.push('/sales/dashboard');
      } else {
        // default to engineer
        router.push('/engineer/dashboard');
      }
    } catch (err: unknown) {
      let msg = 'Login failed';
      if (err && typeof err === 'object' && 'message' in err) {
        msg = ((err as { message?: unknown }).message as string) || msg;
      }
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      maxW="420px"
      mx="auto"
      mt={12}
      p={6}
      borderWidth="1px"
      borderRadius="md"
    >
      <Heading size="md" mb={4}>
        Sign in
      </Heading>
      <form onSubmit={handleSubmit}>
        <Box mb={3}>
          <label>Email</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
        </Box>

        <Box mb={4}>
          <label>Password</label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
        </Box>

        {error && (
          <Text color="red.500" mb={3}>
            {error}
          </Text>
        )}

        <Button type="submit" colorScheme="blue" w="full" loading={loading}>
          Sign in
        </Button>
      </form>
    </Box>
  );
}
