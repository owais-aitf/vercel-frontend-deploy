'use client';

import React, { useState, useEffect, useRef } from 'react';
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

const CheckIcon = ({ color = '#10B981' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={color}>
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
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
  const [isCardVisible, setIsCardVisible] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Focus states for floating labels
  const [currentPasswordFocused, setCurrentPasswordFocused] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const currentPasswordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');

    if (!userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    setUserId(user.id);

    // Trigger card entrance animation
    const timer = setTimeout(() => {
      setIsCardVisible(true);
    }, 100);

    // Auto-focus first field after animations
    const focusTimer = setTimeout(() => {
      currentPasswordRef.current?.focus();
    }, 800);

    return () => {
      clearTimeout(timer);
      clearTimeout(focusTimer);
    };
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

  // Check if fields are valid for success tick
  const isCurrentPasswordValid = currentPassword && !errors.current;
  const isNewPasswordValid = newPassword && !validatePassword(newPassword);
  const isConfirmPasswordValid =
    confirmPassword && newPassword === confirmPassword && !errors.confirm;

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
      {/* Enhanced floating geometric shapes */}
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

      <Container maxW="md" position="relative" zIndex="1">
        <Card.Root
          className={`login-card ${isCardVisible ? 'visible' : ''}`}
          bg="rgba(255,255,255,0.95)"
          shadow="0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 60px rgba(66, 153, 225, 0.15)"
          borderRadius="2xl"
          p={10}
          border="1px solid"
          borderColor="rgba(255,255,255,0.2)"
          backdropFilter="blur(20px)"
          position="relative"
          transform={
            isCardVisible
              ? 'translateY(0) scale(1)'
              : 'translateY(50px) scale(0.95)'
          }
          opacity={isCardVisible ? 1 : 0}
          transition="all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
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
            {/* Header with Logo - Enhanced with animations */}
            <VStack gap={3} className="heading-container">
              <Box
                className="logo-container"
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
                transform={
                  isCardVisible
                    ? 'scale(1) rotate(0deg)'
                    : 'scale(0.8) rotate(-5deg)'
                }
                opacity={isCardVisible ? 1 : 0}
                transition="all 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s"
                _hover={{
                  transform: 'scale(1.05)',
                  shadow: '0 8px 25px rgba(66, 153, 225, 0.2)',
                }}
              >
                <Image
                  src="/images/logo.png"
                  alt="ATF Logo"
                  width={60}
                  height={60}
                  style={{ objectFit: 'contain' }}
                />
              </Box>
              <Heading
                size="xl"
                textAlign="center"
                color="blue.700"
                transform={isCardVisible ? 'translateY(0)' : 'translateY(20px)'}
                opacity={isCardVisible ? 1 : 0}
                transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.4s"
              >
                First Login - Reset Password
              </Heading>
              <Text
                color="gray.600"
                textAlign="center"
                fontSize="md"
                transform={isCardVisible ? 'translateY(0)' : 'translateY(20px)'}
                opacity={isCardVisible ? 1 : 0}
                transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.5s"
              >
                Please change your password to continue
              </Text>
            </VStack>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <VStack gap={4}>
                {/* Current Password - Enhanced with Floating Label & Success Tick */}
                <Box
                  w="full"
                  className="form-field"
                  transform={
                    isCardVisible ? 'translateX(0)' : 'translateX(-20px)'
                  }
                  opacity={isCardVisible ? 1 : 0}
                  transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.6s"
                >
                  <Box
                    position="relative"
                    mt={currentPasswordFocused || currentPassword ? 4 : 0}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  >
                    {/* Floating Label */}
                    <Text
                      position="absolute"
                      left={
                        currentPasswordFocused || currentPassword
                          ? '12px'
                          : '40px'
                      }
                      top={
                        currentPasswordFocused || currentPassword
                          ? '-10px'
                          : '50%'
                      }
                      transform={
                        currentPasswordFocused || currentPassword
                          ? 'translateY(0) scale(0.85)'
                          : 'translateY(-50%) scale(1)'
                      }
                      transformOrigin="left"
                      fontWeight="semibold"
                      fontSize="sm"
                      color={
                        currentPasswordFocused
                          ? 'blue.600'
                          : currentPassword && !errors.current
                            ? 'blue.600'
                            : 'gray.500'
                      }
                      bg={
                        currentPasswordFocused || currentPassword
                          ? 'white'
                          : 'transparent'
                      }
                      px={currentPasswordFocused || currentPassword ? 2 : 0}
                      zIndex={2}
                      pointerEvents="none"
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    >
                      Current Password
                    </Text>

                    {/* Left Icon */}
                    <Box
                      position="absolute"
                      left="12px"
                      top="50%"
                      transform="translateY(-50%)"
                      pointerEvents="none"
                      color={
                        currentPasswordFocused || currentPassword
                          ? 'blue.500'
                          : 'blue.400'
                      }
                      zIndex={1}
                      display="flex"
                      alignItems="center"
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      opacity={
                        currentPasswordFocused || currentPassword ? 0 : 1
                      }
                    >
                      <LockIcon />
                    </Box>

                    {/* Success Tick */}
                    {isCurrentPasswordValid && (
                      <Box
                        position="absolute"
                        right={showCurrentPassword ? '45px' : '12px'}
                        top="50%"
                        transform="translateY(-50%)"
                        zIndex={2}
                        opacity={1}
                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        animation="fadeInScale 0.3s ease-out"
                      >
                        <CheckIcon />
                      </Box>
                    )}

                    <Input
                      ref={currentPasswordRef}
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder=""
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      onFocus={() => setCurrentPasswordFocused(true)}
                      onBlur={() => setCurrentPasswordFocused(false)}
                      pl={
                        currentPasswordFocused || currentPassword
                          ? '12px'
                          : '40px'
                      }
                      pr={
                        isCurrentPasswordValid
                          ? showCurrentPassword
                            ? '75px'
                            : '45px'
                          : '45px'
                      }
                      bg="gray.50"
                      border="2px solid"
                      borderColor={
                        errors.current
                          ? 'red.500'
                          : isCurrentPasswordValid
                            ? 'green.300'
                            : 'gray.200'
                      }
                      borderRadius="lg"
                      height="48px"
                      fontSize="md"
                      transform="translateY(0)"
                      _hover={{
                        borderColor: errors.current
                          ? 'red.500'
                          : isCurrentPasswordValid
                            ? 'green.400'
                            : 'blue.300',
                        bg: 'white',
                        transform: 'translateY(-1px)',
                        shadow: '0 4px 12px rgba(66, 153, 225, 0.1)',
                      }}
                      _focus={{
                        borderColor: 'blue.500',
                        bg: 'white',
                        boxShadow: '0 8px 25px rgba(66, 153, 225, 0.15)',
                        outline: 'none',
                        transform: 'translateY(-2px)',
                      }}
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    />

                    {/* Enhanced Password Toggle */}
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
                      zIndex={3}
                      minW="auto"
                      h="auto"
                      p={2}
                      borderRadius="md"
                      _hover={{
                        color: 'blue.500',
                        bg: 'blue.50',
                        transform: 'translateY(-50%) scale(1.1)',
                      }}
                      _active={{
                        transform: 'translateY(-50%) scale(0.95)',
                      }}
                      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    >
                      <Box className="eye-icon">
                        {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </Box>
                    </Button>
                  </Box>
                  {errors.current && (
                    <Text
                      color="red.500"
                      fontSize="sm"
                      mt={1}
                      fontWeight="medium"
                      transform="translateX(0)"
                      opacity="1"
                      transition="all 0.2s ease"
                    >
                      ⚠️ {errors.current}
                    </Text>
                  )}
                </Box>

                {/* New Password - Enhanced with Floating Label & Success Tick */}
                <Box
                  w="full"
                  className="form-field"
                  transform={
                    isCardVisible ? 'translateX(0)' : 'translateX(-20px)'
                  }
                  opacity={isCardVisible ? 1 : 0}
                  transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.7s"
                >
                  <Box
                    position="relative"
                    mt={newPasswordFocused || newPassword ? 4 : 0}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  >
                    {/* Floating Label */}
                    <Text
                      position="absolute"
                      left={newPasswordFocused || newPassword ? '12px' : '40px'}
                      top={newPasswordFocused || newPassword ? '-10px' : '50%'}
                      transform={
                        newPasswordFocused || newPassword
                          ? 'translateY(0) scale(0.85)'
                          : 'translateY(-50%) scale(1)'
                      }
                      transformOrigin="left"
                      fontWeight="semibold"
                      fontSize="sm"
                      color={
                        newPasswordFocused
                          ? 'blue.600'
                          : newPassword && !errors.new
                            ? 'blue.600'
                            : 'gray.500'
                      }
                      bg={
                        newPasswordFocused || newPassword
                          ? 'white'
                          : 'transparent'
                      }
                      px={newPasswordFocused || newPassword ? 2 : 0}
                      zIndex={2}
                      pointerEvents="none"
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    >
                      New Password
                    </Text>

                    {/* Left Icon */}
                    <Box
                      position="absolute"
                      left="12px"
                      top="50%"
                      transform="translateY(-50%)"
                      pointerEvents="none"
                      color={
                        newPasswordFocused || newPassword
                          ? 'blue.500'
                          : 'blue.400'
                      }
                      zIndex={1}
                      display="flex"
                      alignItems="center"
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      opacity={newPasswordFocused || newPassword ? 0 : 1}
                    >
                      <LockIcon />
                    </Box>

                    {/* Success Tick */}
                    {isNewPasswordValid && (
                      <Box
                        position="absolute"
                        right={showNewPassword ? '45px' : '12px'}
                        top="50%"
                        transform="translateY(-50%)"
                        zIndex={2}
                        opacity={1}
                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        animation="fadeInScale 0.3s ease-out"
                      >
                        <CheckIcon />
                      </Box>
                    )}

                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder=""
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onFocus={() => setNewPasswordFocused(true)}
                      onBlur={() => setNewPasswordFocused(false)}
                      pl={newPasswordFocused || newPassword ? '12px' : '40px'}
                      pr={
                        isNewPasswordValid
                          ? showNewPassword
                            ? '75px'
                            : '45px'
                          : '45px'
                      }
                      bg="gray.50"
                      border="2px solid"
                      borderColor={
                        errors.new
                          ? 'red.500'
                          : isNewPasswordValid
                            ? 'green.300'
                            : 'gray.200'
                      }
                      borderRadius="lg"
                      height="48px"
                      fontSize="md"
                      transform="translateY(0)"
                      _hover={{
                        borderColor: errors.new
                          ? 'red.500'
                          : isNewPasswordValid
                            ? 'green.400'
                            : 'blue.300',
                        bg: 'white',
                        transform: 'translateY(-1px)',
                        shadow: '0 4px 12px rgba(66, 153, 225, 0.1)',
                      }}
                      _focus={{
                        borderColor: 'blue.500',
                        bg: 'white',
                        boxShadow: '0 8px 25px rgba(66, 153, 225, 0.15)',
                        outline: 'none',
                        transform: 'translateY(-2px)',
                      }}
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    />

                    {/* Enhanced Password Toggle */}
                    <Button
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      position="absolute"
                      right="8px"
                      top="50%"
                      transform="translateY(-50%)"
                      size="sm"
                      variant="ghost"
                      color="gray.400"
                      zIndex={3}
                      minW="auto"
                      h="auto"
                      p={2}
                      borderRadius="md"
                      _hover={{
                        color: 'blue.500',
                        bg: 'blue.50',
                        transform: 'translateY(-50%) scale(1.1)',
                      }}
                      _active={{
                        transform: 'translateY(-50%) scale(0.95)',
                      }}
                      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    >
                      <Box className="eye-icon">
                        {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </Box>
                    </Button>
                  </Box>
                  {errors.new && (
                    <Text
                      color="red.500"
                      fontSize="sm"
                      mt={1}
                      fontWeight="medium"
                      transform="translateX(0)"
                      opacity="1"
                      transition="all 0.2s ease"
                    >
                      ⚠️ {errors.new}
                    </Text>
                  )}
                </Box>

                {/* Confirm Password - Enhanced with Floating Label & Success Tick */}
                <Box
                  w="full"
                  className="form-field"
                  transform={
                    isCardVisible ? 'translateX(0)' : 'translateX(-20px)'
                  }
                  opacity={isCardVisible ? 1 : 0}
                  transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.8s"
                >
                  <Box
                    position="relative"
                    mt={confirmPasswordFocused || confirmPassword ? 4 : 0}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  >
                    {/* Floating Label */}
                    <Text
                      position="absolute"
                      left={
                        confirmPasswordFocused || confirmPassword
                          ? '12px'
                          : '40px'
                      }
                      top={
                        confirmPasswordFocused || confirmPassword
                          ? '-10px'
                          : '50%'
                      }
                      transform={
                        confirmPasswordFocused || confirmPassword
                          ? 'translateY(0) scale(0.85)'
                          : 'translateY(-50%) scale(1)'
                      }
                      transformOrigin="left"
                      fontWeight="semibold"
                      fontSize="sm"
                      color={
                        confirmPasswordFocused
                          ? 'blue.600'
                          : confirmPassword && !errors.confirm
                            ? 'blue.600'
                            : 'gray.500'
                      }
                      bg={
                        confirmPasswordFocused || confirmPassword
                          ? 'white'
                          : 'transparent'
                      }
                      px={confirmPasswordFocused || confirmPassword ? 2 : 0}
                      zIndex={2}
                      pointerEvents="none"
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    >
                      Confirm New Password
                    </Text>

                    {/* Left Icon */}
                    <Box
                      position="absolute"
                      left="12px"
                      top="50%"
                      transform="translateY(-50%)"
                      pointerEvents="none"
                      color={
                        confirmPasswordFocused || confirmPassword
                          ? 'blue.500'
                          : 'blue.400'
                      }
                      zIndex={1}
                      display="flex"
                      alignItems="center"
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      opacity={
                        confirmPasswordFocused || confirmPassword ? 0 : 1
                      }
                    >
                      <LockIcon />
                    </Box>

                    {/* Success Tick */}
                    {isConfirmPasswordValid && (
                      <Box
                        position="absolute"
                        right={showConfirmPassword ? '45px' : '12px'}
                        top="50%"
                        transform="translateY(-50%)"
                        zIndex={2}
                        opacity={1}
                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        animation="fadeInScale 0.3s ease-out"
                      >
                        <CheckIcon />
                      </Box>
                    )}

                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder=""
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setConfirmPasswordFocused(true)}
                      onBlur={() => setConfirmPasswordFocused(false)}
                      pl={
                        confirmPasswordFocused || confirmPassword
                          ? '12px'
                          : '40px'
                      }
                      pr={
                        isConfirmPasswordValid
                          ? showConfirmPassword
                            ? '75px'
                            : '45px'
                          : '45px'
                      }
                      bg="gray.50"
                      border="2px solid"
                      borderColor={
                        errors.confirm
                          ? 'red.500'
                          : isConfirmPasswordValid
                            ? 'green.300'
                            : 'gray.200'
                      }
                      borderRadius="lg"
                      height="48px"
                      fontSize="md"
                      transform="translateY(0)"
                      _hover={{
                        borderColor: errors.confirm
                          ? 'red.500'
                          : isConfirmPasswordValid
                            ? 'green.400'
                            : 'blue.300',
                        bg: 'white',
                        transform: 'translateY(-1px)',
                        shadow: '0 4px 12px rgba(66, 153, 225, 0.1)',
                      }}
                      _focus={{
                        borderColor: 'blue.500',
                        bg: 'white',
                        boxShadow: '0 8px 25px rgba(66, 153, 225, 0.15)',
                        outline: 'none',
                        transform: 'translateY(-2px)',
                      }}
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    />

                    {/* Enhanced Password Toggle */}
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
                      zIndex={3}
                      minW="auto"
                      h="auto"
                      p={2}
                      borderRadius="md"
                      _hover={{
                        color: 'blue.500',
                        bg: 'blue.50',
                        transform: 'translateY(-50%) scale(1.1)',
                      }}
                      _active={{
                        transform: 'translateY(-50%) scale(0.95)',
                      }}
                      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    >
                      <Box className="eye-icon">
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </Box>
                    </Button>
                  </Box>
                  {errors.confirm && (
                    <Text
                      color="red.500"
                      fontSize="sm"
                      mt={1}
                      fontWeight="medium"
                      transform="translateX(0)"
                      opacity="1"
                      transition="all 0.2s ease"
                    >
                      ⚠️ {errors.confirm}
                    </Text>
                  )}
                </Box>

                {/* Password Requirements Box - Enhanced */}
                <Box
                  w="full"
                  bg="blue.50"
                  p={4}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="blue.100"
                  transform={
                    isCardVisible ? 'translateY(0)' : 'translateY(20px)'
                  }
                  opacity={isCardVisible ? 1 : 0}
                  transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.9s"
                  _hover={{
                    transform: isCardVisible
                      ? 'translateY(-1px)'
                      : 'translateY(19px)',
                    shadow: 'md',
                  }}
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

                {/* Submit Button - Enhanced with Ripple Effect */}
                <Button
                  type="submit"
                  size="lg"
                  w="full"
                  height="48px"
                  bg="blue.600"
                  color="white"
                  fontWeight="semibold"
                  borderRadius="lg"
                  className="submit-button ripple-button"
                  position="relative"
                  overflow="hidden"
                  disabled={loading}
                  mt={2}
                  transform={
                    isCardVisible ? 'translateY(0)' : 'translateY(20px)'
                  }
                  opacity={isCardVisible ? 1 : 0}
                  transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 1s"
                  _hover={{
                    bg: loading ? 'blue.600' : 'blue.700',
                    transform: loading
                      ? isCardVisible
                        ? 'translateY(0)'
                        : 'translateY(20px)'
                      : isCardVisible
                        ? 'translateY(-2px) scale(1.02)'
                        : 'translateY(18px) scale(1.02)',
                    shadow: loading
                      ? 'md'
                      : '0 10px 30px rgba(66, 153, 225, 0.3)',
                  }}
                  _active={{
                    transform: loading
                      ? isCardVisible
                        ? 'translateY(0)'
                        : 'translateY(20px)'
                      : isCardVisible
                        ? 'translateY(0) scale(0.98)'
                        : 'translateY(20px) scale(0.98)',
                    shadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                  }}
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '0',
                    height: '0',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.3)',
                    transform: 'translate(-50%, -50%)',
                    transition: 'width 0.6s, height 0.6s',
                    pointerEvents: 'none',
                  }}
                >
                  <HStack gap={2} position="relative" zIndex={1}>
                    {loading && (
                      <Spinner
                        size="sm"
                        color="white"
                        css={{
                          animation: 'spin 1s linear infinite',
                        }}
                      />
                    )}
                    <Text>{loading ? 'Updating...' : 'Update Password'}</Text>
                  </HStack>
                </Button>
              </VStack>
            </form>
          </VStack>
        </Card.Root>
      </Container>
    </Box>
  );
}
