'use client';

import React, { Component, ReactNode } from 'react';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Global Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleRefresh = () => {
    // For global errors, page reload is appropriate as last resort
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

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
            <Box fontSize="6xl">😵</Box>
            <Heading size="lg" color="red.600">
              Something went wrong
            </Heading>
            <Text color="gray.600">
              The application encountered an unexpected error. This has been
              logged and will be investigated.
            </Text>
            <VStack gap={3}>
              <Button colorScheme="blue" onClick={this.handleRetry}>
                Try Again
              </Button>
              <Button variant="outline" onClick={this.handleRefresh}>
                Refresh Page
              </Button>
            </VStack>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                bg="red.50"
                border="1px solid"
                borderColor="red.200"
                borderRadius="md"
                p={4}
                textAlign="left"
                fontSize="sm"
                fontFamily="mono"
                color="red.800"
                maxW="full"
                overflow="auto"
              >
                <Text fontWeight="bold" mb={2}>
                  Error Details (Development Only):
                </Text>
                <Text>{this.state.error.message}</Text>
                {this.state.error.stack && (
                  <Text mt={2} fontSize="xs" opacity={0.8}>
                    {this.state.error.stack}
                  </Text>
                )}
              </Box>
            )}
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}
