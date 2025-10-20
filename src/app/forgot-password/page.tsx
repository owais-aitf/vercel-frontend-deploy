'use client';

import React, { useState } from 'react';
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
import authService from '@/shared/service/authService';
import { toaster } from '@/components/ui/toaster';

const EmailIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </svg>
);

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [touched, setTouched] = useState(false);

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format';
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (touched) {
      setEmailError(validateEmail(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const emailErr = validateEmail(email);
    setEmailError(emailErr);

    if (emailErr) return;

    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);

      toaster.create({
        title: 'OTP Sent Successfully',
        description: response.message || 'Please check your email for the OTP',
        type: 'success',
        duration: 5000,
      });

      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Failed to send OTP. Please try again.';

      toaster.create({
        title: 'Error',
        description: errorMessage,
        type: 'error',
        duration: 5000,
      });
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
    >
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
        bottom="15%"
        right="10%"
        width="100px"
        height="100px"
        borderRadius="md"
        bg="rgba(255,255,255,0.05)"
        filter="blur(1px)"
      />

      <Container maxW="md" position="relative" zIndex="1">
        <Card.Root
          bg="rgba(255,255,255,0.95)"
          shadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          borderRadius="2xl"
          p={10}
          border="1px solid"
          borderColor="rgba(255,255,255,0.2)"
          backdropFilter="blur(20px)"
        >
          <VStack gap={6} align="stretch">
            <VStack gap={3}>
              <Box
                position="relative"
                w="80px"
                h="80px"
                mb={2}
                p={2}
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
              <Heading size="xl" textAlign="center" color="blue.700" fontWeight="bold">
                Forgot Password?
              </Heading>
              <Text color="gray.600" textAlign="center" fontSize="sm">
                Enter your email address and we'll send you an OTP to reset your password
              </Text>
            </VStack>

            <form onSubmit={handleSubmit}>
              <VStack gap={4}>
                <Box w="full">
                  <Text mb={3} fontWeight="semibold" fontSize="sm" color="gray.700">
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
                    >
                      <EmailIcon />
                    </Box>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={() => {
                        setTouched(true);
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
                    <Text color="red.500" fontSize="sm" mt={1} fontWeight="medium">
                      {emailError}
                    </Text>
                  )}
                </Box>

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
                  disabled={loading}
                  mt={2}
                >
                  {loading ? (
                    <HStack gap={2}>
                      <Spinner size="sm" color="white" />
                      <Text>Sending OTP...</Text>
                    </HStack>
                  ) : (
                    <Text>Send OTP</Text>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="md"
                  w="full"
                  onClick={() => router.push('/login')}
                  color="blue.600"
                  _hover={{ bg: 'blue.50' }}
                >
                  <HStack gap={2}>
                    <ArrowLeftIcon />
                    <Text>Back to Login</Text>
                  </HStack>
                </Button>
              </VStack>
            </form>

            <VStack gap={2} pt={4}>
              <Text fontSize="xs" color="gray.400" textAlign="center">
                ATF Attendance & Billing Management System
              </Text>
            </VStack>
          </VStack>
        </Card.Root>
      </Container>
    </Box>
  );
}
