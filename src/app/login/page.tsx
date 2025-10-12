'use client';

import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Box,
  Heading,
  Input,
  Button,
  Text,
  VStack,
  Container,
  Card,
} from '@chakra-ui/react';
import { AuthContext } from '@/context/AuthContext';
import { UserRole } from '@/shared/constants/roles';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setLoginError('');
    if (touched.email) {
      setEmailError(validateEmail(value));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setLoginError('');
    if (touched.password) {
      setPasswordError(validatePassword(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ email: true, password: true });

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (emailErr || passwordErr) {
      return;
    }

    setLoginError('');
    setLoading(true);

    try {
      await login(email, password);

      // Get role from context after login
      let role: string | null = null;

      // Small delay to ensure context is updated
      setTimeout(() => {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('authToken')
            : null;
        if (token) {
          try {
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            role = decoded?.role || null;
          } catch {}
        }

        if (role === UserRole.ADMIN) {
          router.push('/admin/dashboard');
        } else if (role === UserRole.SALES) {
          router.push('/sales/dashboard');
        } else {
          router.push('/engineer/dashboard');
        }
      }, 100);
    } catch (err: unknown) {
      let errorMessage = 'Login failed. Please try again.';

      if (err && typeof err === 'object') {
        if ('response' in err) {
          const response = (
            err as {
              response?: { data?: { error?: string; message?: string } };
            }
          ).response;
          if (response?.data?.error) {
            errorMessage = response.data.error;
          } else if (response?.data?.message) {
            errorMessage = response.data.message;
          }
        } else if ('message' in err) {
          const msg = (err as { message?: unknown }).message;
          if (typeof msg === 'string') {
            errorMessage = msg;
          }
        }
      }

      setLoginError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bgGradient="to-br"
      gradientFrom="blue.400"
      gradientTo="blue.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Container maxW="md">
        <Card.Root bg="white" shadow="2xl" borderRadius="xl" p={8}>
          <VStack gap={6} align="stretch">
            {/* Logo - UPDATED */}
            <VStack gap={2}>
              <Box position="relative" w="80px" h="80px" mb={2}>
                <Image
                  src="/images/logo.png"
                  alt="ATF Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </Box>
              <Heading size="xl" textAlign="center" color="blue.600">
                Welcome Back
              </Heading>
              <Text color="gray.600" textAlign="center">
                Sign in to your account
              </Text>
            </VStack>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <VStack gap={4}>
                {/* Email Field */}
                <Box w="full">
                  <Text mb={2} fontWeight="medium" fontSize="sm">
                    Email Address
                  </Text>
                  <Box position="relative">
                    <Box
                      position="absolute"
                      left="12px"
                      top="50%"
                      transform="translateY(-50%)"
                      pointerEvents="none"
                      color="gray.400"
                      zIndex={1}
                    >
                      📧
                    </Box>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={() => {
                        setTouched({ ...touched, email: true });
                        setEmailError(validateEmail(email));
                      }}
                      pl="40px"
                      bg="gray.50"
                      borderColor={emailError ? 'red.500' : 'gray.300'}
                      _hover={{ borderColor: 'blue.400' }}
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                        outline: 'none',
                      }}
                      height="44px"
                    />
                  </Box>
                  {emailError && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {emailError}
                    </Text>
                  )}
                </Box>

                {/* Password Field */}
                <Box w="full">
                  <Text mb={2} fontWeight="medium" fontSize="sm">
                    Password
                  </Text>
                  <Box position="relative">
                    <Box
                      position="absolute"
                      left="12px"
                      top="50%"
                      transform="translateY(-50%)"
                      pointerEvents="none"
                      color="gray.400"
                      zIndex={1}
                    >
                      🔒
                    </Box>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={() => {
                        setTouched({ ...touched, password: true });
                        setPasswordError(validatePassword(password));
                      }}
                      pl="40px"
                      pr="45px"
                      bg="gray.50"
                      borderColor={passwordError ? 'red.500' : 'gray.300'}
                      _hover={{ borderColor: 'blue.400' }}
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                        outline: 'none',
                      }}
                      height="44px"
                    />
                    {/* FIXED PASSWORD TOGGLE */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: '#718096',
                        background: 'transparent',
                        border: 'none',
                        padding: '8px',
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#3182CE';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#718096';
                      }}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </Box>
                  {passwordError && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {passwordError}
                    </Text>
                  )}
                </Box>

                {/* Login Error Message */}
                {loginError && (
                  <Box
                    bg="red.50"
                    color="red.600"
                    p={3}
                    borderRadius="md"
                    w="full"
                    border="1px solid"
                    borderColor="red.200"
                  >
                    <Text fontSize="sm" fontWeight="medium">
                      ⚠️ {loginError}
                    </Text>
                  </Box>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  loading={loading}
                  disabled={loading}
                  mt={2}
                  height="44px"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </VStack>
            </form>

            {/* Footer */}
            <Text fontSize="xs" color="gray.500" textAlign="center" pt={4}>
              ATF Attendance & Billing Management System
            </Text>
          </VStack>
        </Card.Root>
      </Container>
    </Box>
  );
}
