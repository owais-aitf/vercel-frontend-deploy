'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
  </svg>
);

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90); // 1 minute 30 seconds
  const [isExpired, setIsExpired] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResendOTP = async () => {
    setResending(true);
    try {
      await authService.forgotPassword(email);
      toaster.create({
        title: 'OTP Resent',
        description: 'A new OTP has been sent to your email',
        type: 'success',
        duration: 3000,
      });
      setTimeLeft(90);
      setIsExpired(false);
      setOtp(['', '', '', '', '', '']);
    } catch {
      toaster.create({
        title: 'Error',
        description: 'Failed to resend OTP. Please try again.',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setResending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      toaster.create({
        title: 'Invalid OTP',
        description: 'Please enter all 6 digits',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    if (isExpired) {
      toaster.create({
        title: 'OTP Expired',
        description: 'Please request a new OTP',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      // VERIFY OTP WITH BACKEND FIRST
      await authService.verifyOTP(email, otpString);

      // If verification succeeds, store for password reset
      sessionStorage.setItem('resetEmail', email);
      sessionStorage.setItem('resetOTP', otpString);

      toaster.create({
        title: 'OTP Verified',
        description: 'Please enter your new password',
        type: 'success',
        duration: 3000,
      });

      // Navigate to reset password page
      router.push('/reset-password');
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (
              error as {
                response?: { data?: { error?: string; message?: string } };
              }
            ).response?.data?.error ||
            (
              error as {
                response?: { data?: { error?: string; message?: string } };
              }
            ).response?.data?.message
          : undefined;
      const finalMessage = errorMessage || 'Invalid OTP. Please try again.';

      toaster.create({
        title: 'Verification Failed',
        description: finalMessage,
        type: 'error',
        duration: 3000,
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
    >
      <Container maxW="md" position="relative" zIndex="1">
        <Card.Root
          bg="rgba(255,255,255,0.95)"
          shadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          borderRadius="2xl"
          p={10}
        >
          <VStack gap={6} align="stretch">
            {/* Header */}
            <VStack gap={3}>
              <Box
                w="80px"
                h="80px"
                mb={2}
                bg="blue.50"
                borderRadius="full"
                border="2px solid"
                borderColor="blue.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <ShieldIcon />
              </Box>
              <Heading size="xl" textAlign="center" color="blue.700">
                Verify OTP
              </Heading>
              <Text color="gray.600" textAlign="center" fontSize="sm">
                Enter the 6-digit code sent to
              </Text>
              <Text
                color="blue.600"
                textAlign="center"
                fontSize="sm"
                fontWeight="bold"
              >
                {email}
              </Text>
            </VStack>

            {/* Timer */}
            <Box
              bg={isExpired ? 'red.50' : 'blue.50'}
              p={4}
              borderRadius="lg"
              border="2px solid"
              borderColor={isExpired ? 'red.200' : 'blue.200'}
            >
              <VStack gap={2}>
                <Text
                  fontSize="sm"
                  color={isExpired ? 'red.700' : 'blue.700'}
                  fontWeight="semibold"
                >
                  {isExpired ? 'OTP Expired' : 'Time Remaining'}
                </Text>
                <Text
                  fontSize="3xl"
                  fontWeight="bold"
                  color={isExpired ? 'red.600' : 'blue.600'}
                >
                  {isExpired ? '0:00' : formatTime(timeLeft)}
                </Text>
              </VStack>
            </Box>

            {/* OTP Input - FIXED */}
            <VStack gap={4}>
              <Box w="full">
                <Text
                  mb={3}
                  fontWeight="semibold"
                  fontSize="sm"
                  color="gray.700"
                  textAlign="center"
                >
                  Enter OTP
                </Text>
                <HStack gap={2} justify="center">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <Input
                      key={index}
                      id={`otp-input-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[index]}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      disabled={isExpired}
                      w="48px"
                      h="56px"
                      fontSize="24px"
                      fontWeight="bold"
                      textAlign="center"
                      border="2px solid"
                      borderColor={isExpired ? 'red.200' : 'gray.200'}
                      borderRadius="lg"
                      bg={isExpired ? 'red.50' : 'white'}
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.1)',
                        outline: 'none',
                      }}
                    />
                  ))}
                </HStack>
              </Box>

              {/* Verify Button */}
              <Button
                onClick={handleVerifyOTP}
                size="lg"
                w="full"
                height="48px"
                bg="blue.600"
                color="white"
                disabled={loading || isExpired || otp.join('').length !== 6}
                _hover={{
                  bg: loading ? 'blue.600' : 'blue.700',
                }}
              >
                {loading ? (
                  <HStack gap={2}>
                    <Spinner size="sm" />
                    <Text>Verifying...</Text>
                  </HStack>
                ) : (
                  <Text>Verify OTP</Text>
                )}
              </Button>

              {/* Resend */}
              <VStack gap={2}>
                <Text fontSize="sm" color="gray.600">
                  Didn&apos;t receive the code?
                </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={resending || (!isExpired && timeLeft > 60)}
                  color="blue.600"
                >
                  {resending ? 'Resending...' : 'Resend OTP'}
                </Button>
              </VStack>

              {/* Back */}
              <Button
                variant="ghost"
                size="md"
                w="full"
                onClick={() => router.push('/login')}
                color="blue.600"
              >
                Back to Login
              </Button>
            </VStack>
          </VStack>
        </Card.Root>
      </Container>
    </Box>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <Box
          minH="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner size="lg" color="blue.500" />
        </Box>
      }
    >
      <VerifyOTPContent />
    </Suspense>
  );
}
