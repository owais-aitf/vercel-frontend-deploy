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

const CheckIcon = ({ color = '#10B981' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={color}>
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [touched, setTouched] = useState(false);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);

  // Validation function - moved before it's used
  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format';
    return '';
  };

  // Check if email is valid for success tick
  const isEmailValid = email && !validateEmail(email);

  // Trigger card entrance animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCardVisible(true);
    }, 100);

    // Auto-focus email field after animations
    const focusTimer = setTimeout(() => {
      emailInputRef.current?.focus();
    }, 800);

    return () => {
      clearTimeout(timer);
      clearTimeout(focusTimer);
    };
  }, []);

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
        errorMessage || 'Failed to send OTP. Please try again.';

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
            {/* Header - Enhanced with animations */}
            <VStack gap={3} className="heading-container">
              <Box
                className="logo-container"
                position="relative"
                w="80px"
                h="80px"
                mb={2}
                p={2}
                bg="blue.50"
                borderRadius="full"
                border="2px solid"
                borderColor="blue.100"
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
                transform={isCardVisible ? 'translateY(0)' : 'translateY(20px)'}
                opacity={isCardVisible ? 1 : 0}
                transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.4s"
              >
                Forgot Password?
              </Heading>
              <Text
                color="gray.600"
                textAlign="center"
                fontSize="sm"
                transform={isCardVisible ? 'translateY(0)' : 'translateY(20px)'}
                opacity={isCardVisible ? 1 : 0}
                transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.5s"
              >
                Enter your email address and we&apos;ll send you an OTP to reset
                your password
              </Text>
            </VStack>

            <form onSubmit={handleSubmit}>
              <VStack gap={4}>
                {/* Email Field - Enhanced with Floating Label & Success Tick */}
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
                    mt={emailFocused || email ? 4 : 0}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  >
                    {/* Floating Label */}
                    <Text
                      position="absolute"
                      left={emailFocused || email ? '12px' : '40px'}
                      top={emailFocused || email ? '-10px' : '50%'}
                      transform={
                        emailFocused || email
                          ? 'translateY(0) scale(0.85)'
                          : 'translateY(-50%) scale(1)'
                      }
                      transformOrigin="left"
                      fontWeight="semibold"
                      fontSize="sm"
                      color={
                        emailFocused
                          ? 'blue.600'
                          : email && !emailError
                            ? 'blue.600'
                            : 'gray.500'
                      }
                      bg={emailFocused || email ? 'white' : 'transparent'}
                      px={emailFocused || email ? 2 : 0}
                      zIndex={2}
                      pointerEvents="none"
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    >
                      Email Address
                    </Text>

                    {/* Left Icon */}
                    <Box
                      position="absolute"
                      left="12px"
                      top="50%"
                      transform="translateY(-50%)"
                      pointerEvents="none"
                      color={emailFocused || email ? 'blue.500' : 'blue.400'}
                      zIndex={1}
                      display="flex"
                      alignItems="center"
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      opacity={emailFocused || email ? 0 : 1}
                    >
                      <EmailIcon />
                    </Box>

                    {/* Success Tick */}
                    {isEmailValid && (
                      <Box
                        position="absolute"
                        right="12px"
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
                      ref={emailInputRef}
                      type="email"
                      placeholder=""
                      value={email}
                      onChange={handleEmailChange}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => {
                        setEmailFocused(false);
                        setTouched(true);
                        setEmailError(validateEmail(email));
                      }}
                      required
                      size="lg"
                      bg="gray.50"
                      pl={emailFocused || email ? '12px' : '40px'}
                      pr={isEmailValid ? '40px' : '12px'}
                      border="2px solid"
                      borderColor={
                        emailError
                          ? 'red.500'
                          : isEmailValid
                            ? 'green.300'
                            : 'gray.200'
                      }
                      borderRadius="lg"
                      height="48px"
                      fontSize="md"
                      transform="translateY(0)"
                      _hover={{
                        borderColor: emailError
                          ? 'red.500'
                          : isEmailValid
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
                  </Box>
                  {emailError && (
                    <Text
                      color="red.500"
                      fontSize="sm"
                      mt={1}
                      fontWeight="medium"
                      transform="translateX(0)"
                      opacity="1"
                      transition="all 0.2s ease"
                    >
                      ⚠️ {emailError}
                    </Text>
                  )}
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
                  transform={
                    isCardVisible ? 'translateY(0)' : 'translateY(20px)'
                  }
                  opacity={isCardVisible ? 1 : 0}
                  transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.7s"
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
                  disabled={loading}
                  mt={2}
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
                    <Text>{loading ? 'Sending OTP...' : 'Send OTP'}</Text>
                  </HStack>
                </Button>

                {/* Back to Login Button - Enhanced */}
                <Button
                  variant="ghost"
                  size="md"
                  w="full"
                  onClick={() => router.push('/login')}
                  color="blue.600"
                  transform={
                    isCardVisible ? 'translateY(0)' : 'translateY(20px)'
                  }
                  opacity={isCardVisible ? 1 : 0}
                  transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.8s"
                  _hover={{
                    bg: 'blue.50',
                    transform: isCardVisible
                      ? 'translateY(-1px)'
                      : 'translateY(19px)',
                    color: 'blue.700',
                  }}
                  _active={{
                    transform: isCardVisible
                      ? 'translateY(0)'
                      : 'translateY(20px)',
                  }}
                >
                  <HStack gap={2}>
                    <Box
                      transition="transform 0.2s ease"
                      _groupHover={{ transform: 'translateX(-2px)' }}
                    >
                      <ArrowLeftIcon />
                    </Box>
                    <Text>Back to Login</Text>
                  </HStack>
                </Button>
              </VStack>
            </form>

            {/* Footer - Enhanced */}
            <VStack
              gap={2}
              pt={4}
              className="footer-content"
              transform={isCardVisible ? 'translateY(0)' : 'translateY(20px)'}
              opacity={isCardVisible ? 1 : 0}
              transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.9s"
            >
              <Text
                fontSize="xs"
                color="gray.400"
                textAlign="center"
                _hover={{
                  color: 'gray.500',
                }}
                transition="color 0.2s ease"
              >
                ATF Attendance & Billing Management System
              </Text>
              <Text
                fontSize="xs"
                color="gray.300"
                textAlign="center"
                _hover={{
                  color: 'gray.400',
                }}
                transition="color 0.2s ease"
              >
                Secure • Reliable • Professional
              </Text>
            </VStack>
          </VStack>
        </Card.Root>
      </Container>
    </Box>
  );
}
