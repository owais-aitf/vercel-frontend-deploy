'use client';

import React, { Component, ReactNode } from 'react';
import { Box, Button, Text, VStack, Alert } from '@chakra-ui/react';

interface Props {
    children: ReactNode;
    featureName: string;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class FeatureErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error(`${this.props.featureName} Error Boundary caught an error:`, error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Box p={6}>
                    <Alert.Root status="error">
                        <Alert.Indicator />
                        <Box>
                            <Alert.Title>
                                {this.props.featureName} Error
                            </Alert.Title>
                            <Alert.Description>
                                This section encountered an error and couldn&apos;t load properly.
                            </Alert.Description>
                        </Box>
                    </Alert.Root>

                    <VStack gap={4} mt={4} align="start">
                        <Button size="sm" onClick={this.handleRetry}>
                            Try Again
                        </Button>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <Box
                                bg="red.50"
                                border="1px solid"
                                borderColor="red.200"
                                borderRadius="md"
                                p={3}
                                fontSize="sm"
                                fontFamily="mono"
                                color="red.800"
                                maxW="full"
                                overflow="auto"
                            >
                                <Text fontWeight="bold" mb={1}>
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