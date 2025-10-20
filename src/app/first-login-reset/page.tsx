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
  Container,
  Card,
  Spinner,
  HStack,
} from '@chakra-ui/react';
import authService from '@/shared/service/authService';
import { toaster } from '@/components/ui/toaster';

// SVG Icons
const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
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

export default function FirstLoginResetPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ current: '', new: '', confirm: '' });
  const [userId, setUserId] = useState('');

  // ✅ FIXED - Separate state for each password field
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');

    if (!userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    setUserId(user.id);
  }, [router]);

  const validatePassword = (password: string): string => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password))
      return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(password))
      return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain a number';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({ current: '', new: '', confirm: '' });

    let hasError = false;

    if (!currentPassword) {
      setErrors((prev) => ({
        ...prev,
        current: 'Current password is required',
      }));
      hasError = true;
    }

    const newPasswordError = validatePassword(newPassword);
    if (newPasswordError) {
      setErrors((prev) => ({ ...prev, new: newPasswordError }));
      hasError = true;
    }

    if (newPassword !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirm: 'Passwords do not match' }));
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      await authService.firstLoginPasswordReset(
        userId,
        currentPassword,
        newPassword
      );

      toaster.create({
        title: 'Password Updated',
        description: 'Your password has been successfully updated',
        type: 'success',
        duration: 3000,
      });

      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        user.isFirstLogin = false;
        localStorage.setItem('user', JSON.stringify(user));
      }

      const userData2 = localStorage.getItem('user');
      const user = JSON.parse(userData2 || '{}');
      const dashboards: Record<string, string> = {
        ADMIN: '/admin/dashboard',
        SALES: '/sales/dashboard',
        ENGINEER: '/engineer/dashboard',
      };

      setTimeout(() => {
        router.push(dashboards[user.role] || '/');
      }, 1000);
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
      const finalMessage = errorMessage || 'Failed to update password';

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
    >
      <Container maxW="md">
        <Card.Root bg="white" shadow="2xl" borderRadius="2xl" p={10}>
          <VStack gap={6} align="stretch">
            {/* Header with Logo */}
            <VStack gap={3}>
              <Box
                w="80px"
                h="80px"
                bg="blue.50"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="2px solid"
                borderColor="blue.100"
                mb={2}
              >
                <Image
                  src="/images/logo.png"
                  alt="ATF Logo"
                  width={60}
                  height={60}
                  style={{ objectFit: 'contain' }}
                />
              </Box>
              <Heading size="xl" textAlign="center" color="blue.700">
                First Login - Reset Password
              </Heading>
              <Text color="gray.600" textAlign="center" fontSize="md">
                Please change your password to continue
              </Text>
            </VStack>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <VStack gap={4}>
                {/* Current Password */}
                <Box w="full">
                  <Text
                    mb={2}
                    fontWeight="semibold"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Current Password
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
                    >
                      <LockIcon />
                    </Box>
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      pl="40px"
                      pr="45px"
                      borderColor={errors.current ? 'red.500' : 'gray.200'}
                      height="48px"
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.6)',
                      }}
                    />
                    <Button
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      position="absolute"
                      right="8px"
                      top="50%"
                      transform="translateY(-50%)"
                      size="sm"
                      variant="ghost"
                      color="gray.400"
                      minW="auto"
                      h="auto"
                      p={2}
                      _hover={{ color: 'blue.500', bg: 'blue.50' }}
                    >
                      {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </Button>
                  </Box>
                  {errors.current && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.current}
                    </Text>
                  )}
                </Box>

                {/* New Password */}
                <Box w="full">
                  <Text
                    mb={2}
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
                    >
                      <LockIcon />
                    </Box>
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      pl="40px"
                      pr="45px"
                      borderColor={errors.new ? 'red.500' : 'gray.200'}
                      height="48px"
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.6)',
                      }}
                    />
                    <Button
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      position="absolute"
                      right="8px"
                      top="50%"
                      transform="translateY(-50%)"
                      size="sm"
                      variant="ghost"
                      color="gray.400"
                      minW="auto"
                      h="auto"
                      p={2}
                      _hover={{ color: 'blue.500', bg: 'blue.50' }}
                    >
                      {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </Button>
                  </Box>
                  {errors.new && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.new}
                    </Text>
                  )}
                </Box>

                {/* Confirm Password */}
                <Box w="full">
                  <Text
                    mb={2}
                    fontWeight="semibold"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Confirm New Password
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
                    >
                      <LockIcon />
                    </Box>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      pl="40px"
                      pr="45px"
                      borderColor={errors.confirm ? 'red.500' : 'gray.200'}
                      height="48px"
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.6)',
                      }}
                    />
                    <Button
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      position="absolute"
                      right="8px"
                      top="50%"
                      transform="translateY(-50%)"
                      size="sm"
                      variant="ghost"
                      color="gray.400"
                      minW="auto"
                      h="auto"
                      p={2}
                      _hover={{ color: 'blue.500', bg: 'blue.50' }}
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </Button>
                  </Box>
                  {errors.confirm && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.confirm}
                    </Text>
                  )}
                </Box>

                {/* Password Requirements Box */}
                <Box
                  w="full"
                  bg="blue.50"
                  p={4}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="blue.100"
                >
                  <Text
                    fontWeight="semibold"
                    fontSize="sm"
                    color="blue.700"
                    mb={2}
                  >
                    Password Requirements:
                  </Text>
                  <VStack align="start" gap={1}>
                    <Text fontSize="sm" color="blue.600">
                      • At least 8 characters long
                    </Text>
                    <Text fontSize="sm" color="blue.600">
                      • Contains uppercase and lowercase letters
                    </Text>
                    <Text fontSize="sm" color="blue.600">
                      • Contains at least one number
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
                  disabled={loading}
                  _hover={{ bg: 'blue.700' }}
                  mt={2}
                >
                  {loading ? (
                    <HStack gap={2}>
                      <Spinner size="sm" />
                      <Text>Updating...</Text>
                    </HStack>
                  ) : (
                    <Text>Update Password</Text>
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
