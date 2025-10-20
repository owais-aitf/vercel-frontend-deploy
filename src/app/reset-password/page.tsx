'use client';

import React, { useState, useEffect } from 'react';
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

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18,8h-1V6c0-2.76-2.24-5-5-5S7,3.24,7,6v2H6c-1.1,0-2,0.9-2,2v10c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V10C20,8.9,19.1,8,18,8z M12,17c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,17,12,17z M15.1,8H8.9V6c0-1.71,1.39-3.1,3.1-3.1s3.1,1.39,3.1,3.1V8z" />
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z" />
  </svg>
);

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    // Get email and OTP from session storage
    const storedEmail = sessionStorage.getItem('resetEmail');
    const storedOTP = sessionStorage.getItem('resetOTP');

    if (!storedEmail || !storedOTP) {
      toaster.create({
        title: 'Session Expired',
        description: 'Please start the password reset process again',
        type: 'error',
        duration: 3000,
      });
      router.push('/forgot-password');
      return;
    }

    setEmail(storedEmail);
    setOtp(storedOTP);
  }, [router]);

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password))
      return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password))
      return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password))
      return 'Password must contain at least one number';
    if (!/[!@#$%^&*]/.test(password))
      return 'Password must contain at least one special character';
    return '';
  };

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string
  ) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      setPasswordError(validatePassword(value));
    }
    if (confirmPassword && touched.confirmPassword) {
      setConfirmPasswordError(validateConfirmPassword(value, confirmPassword));
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      setConfirmPasswordError(validateConfirmPassword(password, value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ password: true, confirmPassword: true });

    const passwordErr = validatePassword(password);
    const confirmPasswordErr = validateConfirmPassword(
      password,
      confirmPassword
    );

    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmPasswordErr);

    if (passwordErr || confirmPasswordErr) return;

    setLoading(true);

    try {
      await authService.resetPassword(email, otp, password);

      // Clear session storage
      sessionStorage.removeItem('resetEmail');
      sessionStorage.removeItem('resetOTP');

      toaster.create({
        title: 'Password Reset Successful',
        description:
          'Your password has been changed. Please login with your new password.',
        type: 'success',
        duration: 5000,
      });

      // Redirect to login page
      router.push('/login');
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
      const finalMessage =
        errorMessage || 'Failed to reset password. Please try again.';

      toaster.create({
        title: 'Error',
        description: finalMessage,
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
            {/* Logo and Header */}
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
              <Heading
                size="xl"
                textAlign="center"
                color="blue.700"
                fontWeight="bold"
              >
                Reset Password
              </Heading>
              <Text color="gray.600" textAlign="center" fontSize="sm">
                Create a strong new password for your account
              </Text>
            </VStack>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <VStack gap={4}>
                {/* New Password Field */}
                <Box w="full">
                  <Text
                    mb={3}
                    fontWeight="semibold"
                    fontSize="sm"
                    color="gray.700"
                  >
                    New Password
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
                      <LockIcon />
                    </Box>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
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
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        color: '#A0AEC0',
                        background: 'transparent',
                        border: 'none',
                        padding: '8px',
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
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

                {/* Confirm Password Field */}
                <Box w="full">
                  <Text
                    mb={3}
                    fontWeight="semibold"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Confirm Password
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
                      <LockIcon />
                    </Box>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      onBlur={() => {
                        setTouched({ ...touched, confirmPassword: true });
                        setConfirmPasswordError(
                          validateConfirmPassword(password, confirmPassword)
                        );
                      }}
                      pl="40px"
                      pr="45px"
                      bg="gray.50"
                      border="2px solid"
                      borderColor={
                        confirmPasswordError ? 'red.500' : 'gray.200'
                      }
                      borderRadius="lg"
                      height="48px"
                      fontSize="md"
                      _hover={{
                        borderColor: confirmPasswordError
                          ? 'red.500'
                          : 'blue.300',
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
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        color: '#A0AEC0',
                        background: 'transparent',
                        border: 'none',
                        padding: '8px',
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </Box>
                  {confirmPasswordError && (
                    <Text
                      color="red.500"
                      fontSize="sm"
                      mt={1}
                      fontWeight="medium"
                    >
                      {confirmPasswordError}
                    </Text>
                  )}
                </Box>

                {/* Password Requirements */}
                <Box
                  w="full"
                  bg="blue.50"
                  p={4}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="blue.200"
                >
                  <Text fontSize="xs" fontWeight="bold" color="blue.700" mb={2}>
                    Password Requirements:
                  </Text>
                  <VStack gap={1} align="start">
                    <Text fontSize="xs" color="blue.600">
                      • At least 8 characters long
                    </Text>
                    <Text fontSize="xs" color="blue.600">
                      • Contains uppercase and lowercase letters
                    </Text>
                    <Text fontSize="xs" color="blue.600">
                      • Contains at least one number
                    </Text>
                    <Text fontSize="xs" color="blue.600">
                      • Contains at least one special character (!@#$%^&*)
                    </Text>
                  </VStack>
                </Box>

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
                  disabled={loading}
                  mt={2}
                >
                  {loading ? (
                    <HStack gap={2}>
                      <Spinner size="sm" color="white" />
                      <Text>Resetting Password...</Text>
                    </HStack>
                  ) : (
                    <Text>Reset Password</Text>
                  )}
                </Button>
              </VStack>
            </form>
          </VStack>
        </Card.Root>
      </Container>
    </Box>
  );
}
