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
  HStack,
  Container,
  Card,
  Spinner,
} from '@chakra-ui/react';
import { AuthContext } from '@/context/AuthContext';
import { UserRole } from '@/shared/constants/roles';

// SVG Icon Components
const EmailIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

const LockIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
    <path d="M18,8h-1V6c0-2.76-2.24-5-5-5S7,3.24,7,6v2H6c-1.1,0-2,0.9-2,2v10c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V10C20,8.9,19.1,8,18,8z M12,17c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,17,12,17z M15.1,8H8.9V6c0-1.71,1.39-3.1,3.1-3.1s3.1,1.39,3.1,3.1V8z" />
  </svg>
);

const EyeIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
    <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
  </svg>
);

const EyeOffIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
    <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z" />
  </svg>
);

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
      const userData = await login(email, password);

      // Get role from returned user data (available immediately)
      const role = userData?.role || null;

      // Redirect based on role
      if (role === UserRole.ADMIN) {
        router.push('/admin/dashboard');
      } else if (role === UserRole.SALES) {
        router.push('/sales/dashboard');
      } else {
        router.push('/engineer/dashboard');
      }
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
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%),
          radial-gradient(circle at 50% 10%, rgba(255,255,255,0.08) 0%, transparent 40%)
        `,
        pointerEvents: 'none',
      }}
      _after={{
        content: '""',
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        backgroundImage: `
          linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.03) 50%, transparent 70%),
          linear-gradient(-45deg, transparent 30%, rgba(255,255,255,0.02) 50%, transparent 70%)
        `,
        animation: 'float 20s ease-in-out infinite',
        pointerEvents: 'none',
      }}
    >
      {/* Floating geometric shapes */}
      <Box
        position="absolute"
        top="10%"
        left="10%"
        width="120px"
        height="120px"
        borderRadius="full"
        bg="rgba(255,255,255,0.08)"
        filter="blur(1px)"
      />
      <Box
        position="absolute"
        top="20%"
        right="15%"
        width="80px"
        height="80px"
        borderRadius="lg"
        bg="rgba(255,255,255,0.06)"
        filter="blur(0.5px)"
      />
      <Box
        position="absolute"
        bottom="15%"
        left="20%"
        width="100px"
        height="100px"
        borderRadius="md"
        bg="rgba(255,255,255,0.05)"
        filter="blur(1px)"
      />
      <Box
        position="absolute"
        bottom="25%"
        right="10%"
        width="60px"
        height="60px"
        borderRadius="full"
        bg="rgba(255,255,255,0.1)"
        filter="blur(0.5px)"
      />
      <Box
        position="absolute"
        top="50%"
        left="5%"
        width="40px"
        height="40px"
        borderRadius="sm"
        bg="rgba(255,255,255,0.04)"
        transform="rotate(45deg)"
      />
      <Box
        position="absolute"
        top="30%"
        right="5%"
        width="30px"
        height="30px"
        borderRadius="full"
        bg="rgba(255,255,255,0.07)"
      />

      {/* Subtle grid pattern */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        backgroundImage="linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)"
        backgroundSize="60px 60px"
        pointerEvents="none"
        opacity="0.4"
      />

      {/* Additional depth layers */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        backgroundImage="radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)"
        pointerEvents="none"
      />

      <Container maxW="md" position="relative" zIndex="1">
        <Card.Root
          bg="rgba(255,255,255,0.95)"
          shadow="0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 60px rgba(66, 153, 225, 0.15)"
          borderRadius="2xl"
          p={10}
          border="1px solid"
          borderColor="rgba(255,255,255,0.2)"
          backdropFilter="blur(20px)"
          position="relative"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '2xl',
            padding: '1px',
            background:
              'linear-gradient(135deg, rgba(66,153,225,0.3), rgba(255,255,255,0.1), rgba(66,153,225,0.3))',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'xor',
            pointerEvents: 'none',
          }}
        >
          <VStack gap={6} align="stretch">
            {/* Logo - UPDATED */}
            <VStack gap={3}>
              <Box
                position="relative"
                w="100px"
                h="100px"
                mb={3}
                p={3}
                bg="blue.50"
                borderRadius="full"
                border="2px solid"
                borderColor="blue.100"
              >
                <Image
                  src="/images/logo.png"
                  alt="ATF Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </Box>
              <Heading
                size="2xl"
                textAlign="center"
                color="blue.700"
                fontWeight="bold"
              >
                Welcome Back
              </Heading>
              <Text color="gray.500" textAlign="center" fontSize="lg">
                Sign in to your account
              </Text>
            </VStack>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <VStack gap={4}>
                {/* Email Field */}
                <Box w="full">
                  <Text
                    mb={3}
                    fontWeight="semibold"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Email Address
                  </Text>
                  <Box position="relative">
                    <Box
                      position="absolute"
                      left="12px"
                      top="50%"
                      transform="translateY(-50%)"
                      pointerEvents="none"
                      color="blue.400"
                      zIndex={1}
                      display="flex"
                      alignItems="center"
                      transition="all 0.2s ease"
                    >
                      <EmailIcon />
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
                      border="2px solid"
                      borderColor={emailError ? 'red.500' : 'gray.200'}
                      borderRadius="lg"
                      height="48px"
                      fontSize="md"
                      _hover={{
                        borderColor: emailError ? 'red.500' : 'blue.300',
                        bg: 'white',
                      }}
                      _focus={{
                        borderColor: 'blue.500',
                        bg: 'white',
                        boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.1)',
                        outline: 'none',
                      }}
                      transition="all 0.2s"
                    />
                  </Box>
                  {emailError && (
                    <Text
                      color="red.500"
                      fontSize="sm"
                      mt={1}
                      fontWeight="medium"
                    >
                      {emailError}
                    </Text>
                  )}
                </Box>

                {/* Password Field */}
                <Box w="full">
                  <Text
                    mb={3}
                    fontWeight="semibold"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Password
                  </Text>
                  <Box position="relative">
                    <Box
                      position="absolute"
                      left="12px"
                      top="50%"
                      transform="translateY(-50%)"
                      pointerEvents="none"
                      color="blue.400"
                      zIndex={1}
                      display="flex"
                      alignItems="center"
                      transition="all 0.2s ease"
                    >
                      <LockIcon />
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
                      border="2px solid"
                      borderColor={passwordError ? 'red.500' : 'gray.200'}
                      borderRadius="lg"
                      height="48px"
                      fontSize="md"
                      _hover={{
                        borderColor: passwordError ? 'red.500' : 'blue.300',
                        bg: 'white',
                      }}
                      _focus={{
                        borderColor: 'blue.500',
                        bg: 'white',
                        boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.1)',
                        outline: 'none',
                      }}
                      transition="all 0.2s"
                    />
                    {/* FIXED PASSWORD TOGGLE */}
                    <Box
                      as="button"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      position="absolute"
                      right="12px"
                      top="50%"
                      transform="translateY(-50%)"
                      cursor="pointer"
                      color="gray.400"
                      bg="transparent"
                      border="none"
                      p={2}
                      zIndex={2}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderRadius="md"
                      transition="all 0.2s ease"
                      _hover={{
                        color: 'blue.500',
                        bg: 'blue.50',
                      }}
                      _active={{
                        transform: 'translateY(-50%) scale(0.95)',
                      }}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </Box>
                  </Box>
                  {passwordError && (
                    <Text
                      color="red.500"
                      fontSize="sm"
                      mt={1}
                      fontWeight="medium"
                    >
                      {passwordError}
                    </Text>
                  )}
                </Box>

                {/* Login Error Message */}
                {loginError && (
                  <Box
                    bg="red.50"
                    color="red.700"
                    p={4}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="red.200"
                    w="full"
                  >
                    <HStack>
                      <Box color="red.500">⚠️</Box>
                      <Text fontSize="sm" fontWeight="medium">
                        {loginError}
                      </Text>
                    </HStack>
                  </Box>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  w="full"
                  height="48px"
                  bg="blue.600"
                  color="white"
                  fontWeight="semibold"
                  borderRadius="lg"
                  _hover={{
                    bg: loading ? 'blue.600' : 'blue.700',
                    transform: loading ? 'none' : 'translateY(-1px)',
                    shadow: loading ? 'md' : 'lg',
                  }}
                  _active={{
                    transform: loading ? 'none' : 'translateY(0)',
                    shadow: 'md',
                  }}
                  _loading={{
                    bg: 'blue.600',
                    _hover: { bg: 'blue.600' },
                    cursor: 'not-allowed',
                  }}
                  transition="all 0.2s"
                  loading={loading}
                  loadingText="Signing in..."
                  disabled={loading}
                  mt={2}
                >
                  <HStack gap={2}>
                    {loading && <Spinner size="sm" color="white" />}
                    <Text>{loading ? 'Signing in...' : 'Sign In'}</Text>
                  </HStack>
                </Button>
              </VStack>
            </form>

            {/* Footer */}
            <VStack gap={2} pt={6}>
              <Text fontSize="xs" color="gray.400" textAlign="center">
                ATF Attendance & Billing Management System
              </Text>
              <Text fontSize="xs" color="gray.300" textAlign="center">
                Secure • Reliable • Professional
              </Text>
            </VStack>
          </VStack>
        </Card.Root>
      </Container>
    </Box>
  );
}
