'use client';

import { Box, Text, VStack } from '@chakra-ui/react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  variant?: 'default' | 'dots' | 'pulse' | 'skeleton';
}

export const LoadingSpinner = ({
  size = 'md',
  text,
  variant = 'default',
}: LoadingSpinnerProps) => {
  const sizeMap = {
    sm: { spinner: '20px', text: 'sm' },
    md: { spinner: '32px', text: 'md' },
    lg: { spinner: '48px', text: 'lg' },
  };

  if (variant === 'dots') {
    return (
      <VStack gap={3} align="center">
        <Box display="flex" gap={1} align="center">
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              w="8px"
              h="8px"
              bg="blue.500"
              borderRadius="full"
              animation={`dotPulse 1.4s ease-in-out ${i * 0.2}s infinite`}
            />
          ))}
        </Box>
        {text && (
          <Text fontSize={sizeMap[size].text} color="gray.600">
            {text}
          </Text>
        )}
      </VStack>
    );
  }

  if (variant === 'pulse') {
    return (
      <VStack gap={3} align="center">
        <Box
          w={sizeMap[size].spinner}
          h={sizeMap[size].spinner}
          bg="blue.500"
          borderRadius="full"
          animation="pulse 2s ease-in-out infinite"
        />
        {text && (
          <Text fontSize={sizeMap[size].text} color="gray.600">
            {text}
          </Text>
        )}
      </VStack>
    );
  }

  if (variant === 'skeleton') {
    return (
      <VStack gap={2} align="stretch" w="full">
        <Box
          h="20px"
          bg="gray.200"
          borderRadius="md"
          animation="shimmer 2s ease-in-out infinite"
        />
        <Box
          h="20px"
          bg="gray.200"
          borderRadius="md"
          animation="shimmer 2s ease-in-out infinite"
          w="80%"
        />
        <Box
          h="20px"
          bg="gray.200"
          borderRadius="md"
          animation="shimmer 2s ease-in-out infinite"
          w="60%"
        />
      </VStack>
    );
  }

  return (
    <VStack gap={3} align="center">
      <Box
        w={sizeMap[size].spinner}
        h={sizeMap[size].spinner}
        border="3px solid"
        borderColor="gray.200"
        borderTopColor="blue.500"
        borderRadius="full"
        animation="spin 1s linear infinite"
      />
      {text && (
        <Text fontSize={sizeMap[size].text} color="gray.600">
          {text}
        </Text>
      )}

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes dotPulse {
          0%,
          80%,
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
      `}</style>
    </VStack>
  );
};
