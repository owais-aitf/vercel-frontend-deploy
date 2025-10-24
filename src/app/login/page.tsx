'use client';

import React, { useState, useContext, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
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
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// SVG Icon Components
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

const CheckIcon = ({ color = '#10B981' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={color}>
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { login } = useContext(AuthContext);
  const { t } = useTranslation('auth');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCardVisible, setIsCardVisible] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  const emailInputRef = useRef<HTMLInputElement>(null);

  // Validation functions
  const validateEmail = (email: string) => {
    if (!email) return t('validation.email_required');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return t('validation.email_invalid');
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return t('validation.password_required');
    if (password.length < 8) return t('validation.password_min_length');
    return '';
  };

  // Check if fields are valid
  const isEmailValid = email && !validateEmail(email);
  const isPasswordValid = password && !validatePassword(password);

  // Trigger card entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCardVisible(true);
    }, 100);

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

      if (userData) {
        const tokenFromStorage = localStorage.getItem('token');
        if (!tokenFromStorage) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
      }

      if (userData?.isFirstLogin) {
        router.push('/first-login-reset');
        return;
      }

      const role = userData?.role || null;

      if (role === UserRole.ADMIN) {
        router.push('/admin/dashboard');
      } else if (role === UserRole.SALES) {
        router.push('/sales/dashboard');
      } else {
        router.push('/engineer/dashboard');
      }
    } catch (err: unknown) {
      let errorMessage = t('errors.login_failed');

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
    <>
      {/* Global CSS for Autofill Fix */}
      <style jsx global>{`
        /* Remove autofill background and text color */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #f7fafc inset !important;
          -webkit-text-fill-color: #1a202c !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        /* Dark autofill */
        input:-webkit-autofill {
          -webkit-background-clip: text;
        }
      `}</style>

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

        <HStack position="absolute" top={4} right={4} zIndex={10}>
          <LanguageSwitcher />
        </HStack>

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
              {/* Logo */}
              <VStack gap={3} className="heading-container">
                <Box
                  className="logo-container"
                  position="relative"
                  w="100px"
                  h="100px"
                  mb={3}
                  p={3}
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
                  size="2xl"
                  textAlign="center"
                  color="blue.700"
                  fontWeight="bold"
                  transform={
                    isCardVisible ? 'translateY(0)' : 'translateY(20px)'
                  }
                  opacity={isCardVisible ? 1 : 0}
                  transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.4s"
                >
                  {t('welcome_back')}
                </Heading>
                <Text
                  color="gray.500"
                  textAlign="center"
                  fontSize="lg"
                  transform={
                    isCardVisible ? 'translateY(0)' : 'translateY(20px)'
                  }
                  opacity={isCardVisible ? 1 : 0}
                  transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.5s"
                >
                  {t('sign_in_description')}
                </Text>
              </VStack>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <VStack gap={4}>
                  {/* Email Field */}
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
                      mt={4}
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    >
                      {/* Floating Label */}
                      <Text
                        position="absolute"
                        left="12px"
                        top="-10px"
                        transform="translateY(0) scale(0.85)"
                        transformOrigin="left"
                        fontWeight="semibold"
                        fontSize="sm"
                        color="blue.600"
                        bg="white"
                        px={2}
                        zIndex={2}
                        pointerEvents="none"
                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      >
                        {t('email_label')}
                      </Text>

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
                        >
                          <CheckIcon />
                        </Box>
                      )}

                      <Input
                        ref={emailInputRef}
                        type="email"
                        name="email"
                        id="email"
                        placeholder={t('email_placeholder')}
                        value={email}
                        onChange={handleEmailChange}
                        onBlur={() => {
                          setTouched({ ...touched, email: true });
                          setEmailError(validateEmail(email));
                        }}
                        pl="12px"
                        pr={isEmailValid ? '40px' : '12px'}
                        bg="gray.50"
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
                        autoComplete="email"
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
                      >
                        ⚠️ {emailError}
                      </Text>
                    )}
                  </Box>

                  {/* Password Field - FIXED FOR AUTOFILL */}
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
                      mt={4}
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    >
                      {/* Floating Label */}
                      <Text
                        position="absolute"
                        left="12px"
                        top="-10px"
                        transform="translateY(0) scale(0.85)"
                        transformOrigin="left"
                        fontWeight="semibold"
                        fontSize="sm"
                        color="blue.600"
                        bg="white"
                        px={2}
                        zIndex={2}
                        pointerEvents="none"
                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      >
                        {t('password_label')}
                      </Text>

                      {/* Success Tick */}
                      {isPasswordValid && (
                        <Box
                          position="absolute"
                          right="45px"
                          top="50%"
                          transform="translateY(-50%)"
                          zIndex={2}
                          opacity={1}
                          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        >
                          <CheckIcon />
                        </Box>
                      )}

                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        id="password"
                        placeholder={t('password_placeholder')}
                        value={password}
                        onChange={handlePasswordChange}
                        onBlur={() => {
                          setTouched({ ...touched, password: true });
                          setPasswordError(validatePassword(password));
                        }}
                        pl="12px"
                        pr="45px"
                        bg="gray.50"
                        border="2px solid"
                        borderColor={
                          passwordError
                            ? 'red.500'
                            : isPasswordValid
                              ? 'green.300'
                              : 'gray.200'
                        }
                        borderRadius="lg"
                        height="48px"
                        fontSize="md"
                        autoComplete="current-password"
                        transform="translateY(0)"
                        _hover={{
                          borderColor: passwordError
                            ? 'red.500'
                            : isPasswordValid
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

                      {/* Password Toggle */}
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowPassword(!showPassword);
                        }}
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
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </Button>
                    </Box>
                    {passwordError && (
                      <Text
                        color="red.500"
                        fontSize="sm"
                        mt={1}
                        fontWeight="medium"
                      >
                        ⚠️ {passwordError}
                      </Text>
                    )}
                  </Box>

                  {/* Login Error */}
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
                        <Text>⚠️</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {loginError}
                        </Text>
                      </HStack>
                    </Box>
                  )}

                  {/* Forgot Password */}
                  <HStack justify="flex-end" w="full">
                    <Button
                      variant="ghost"
                      size="sm"
                      color="blue.600"
                      onClick={() => router.push('/forgot-password')}
                      _hover={{
                        textDecoration: 'underline',
                        color: 'blue.700',
                      }}
                    >
                      {t('forgot_password')}
                    </Button>
                  </HStack>

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
                    position="relative"
                    overflow="hidden"
                    transform={
                      isCardVisible ? 'translateY(0)' : 'translateY(20px)'
                    }
                    opacity={isCardVisible ? 1 : 0}
                    transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.9s"
                    _hover={{
                      bg: loading ? 'blue.600' : 'blue.700',
                      transform: loading
                        ? 'translateY(0)'
                        : 'translateY(-2px) scale(1.02)',
                      shadow: loading
                        ? 'md'
                        : '0 10px 30px rgba(66, 153, 225, 0.3)',
                    }}
                    loading={loading}
                    disabled={loading}
                    mt={2}
                  >
                    <HStack gap={2}>
                      {loading && <Spinner size="sm" color="white" />}
                      <Text>
                        {loading ? t('common:loading') : t('sign_in_button')}
                      </Text>
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
    </>
  );
}
