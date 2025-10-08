'use client';

import { Toaster as ChakraToaster, createToaster } from '@chakra-ui/react';
import { Box, HStack, Text } from '@chakra-ui/react';

export const toaster = createToaster({
  placement: 'top-end',
  pauseOnPageIdle: true,
});

export function Toaster() {
  return (
    <ChakraToaster toaster={toaster}>
      {(toast) => (
        <Box
          bg={
            toast.type === 'success'
              ? 'green.500'
              : toast.type === 'error'
                ? 'red.500'
                : toast.type === 'warning'
                  ? 'orange.500'
                  : 'blue.500'
          }
          color="white"
          p={4}
          borderRadius="lg"
          boxShadow="xl"
          minW="300px"
          maxW="500px"
        >
          <HStack gap={3} alignItems="flex-start">
            <Box fontSize="2xl">
              {toast.type === 'success' && '✅'}
              {toast.type === 'error' && '❌'}
              {toast.type === 'warning' && '⚠️'}
              {toast.type === 'info' && 'ℹ️'}
            </Box>
            <Box flex="1">
              <Text fontWeight="bold" fontSize="lg" mb={1}>
                {toast.title}
              </Text>
              {toast.description && (
                <Text fontSize="sm" opacity={0.9}>
                  {toast.description}
                </Text>
              )}
            </Box>
          </HStack>
        </Box>
      )}
    </ChakraToaster>
  );
}
