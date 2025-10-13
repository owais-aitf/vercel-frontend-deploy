'use client';

import React, { Component, ReactNode } from 'react';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { navigateTo } from '@/shared/lib/navigation';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo);

    // Clear potentially corrupted auth data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleGoToLogin = () => {
    navigateTo('/login');
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          minH="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="gray.50"
          p={8}
        >
          <VStack gap={6} textAlign="center" maxW="md">
            <Box fontSize="6xl">🔐</Box>
            <Heading size="lg" color="orange.600">
              Authentication Error
            </Heading>
            <Text color="gray.600">
              There was a problem with your authentication. Please try logging
              in again.
            </Text>
            <VStack gap={3}>
              <Button colorScheme="blue" onClick={this.handleGoToLogin}>
                Go to Login
              </Button>
              <Button variant="outline" onClick={this.handleRetry}>
                Try Again
              </Button>
            </VStack>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                bg="orange.50"
                border="1px solid"
                borderColor="orange.200"
                borderRadius="md"
                p={4}
                textAlign="left"
                fontSize="sm"
                fontFamily="mono"
                color="orange.800"
                maxW="full"
                overflow="auto"
              >
                <Text fontWeight="bold" mb={2}>
                  Error Details (Development Only):
                </Text>
                <Text>{this.state.error.message}</Text>
              </Box>
            )}
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}
