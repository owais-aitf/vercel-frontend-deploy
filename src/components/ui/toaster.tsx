'use client';

import { Toaster as ChakraToaster, createToaster } from '@chakra-ui/react';
import { Box, Text } from '@chakra-ui/react';

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
          position="relative"
        >
          <Box pr={8}>
            <Text fontWeight="bold" fontSize="md">
              {toast.title}
            </Text>
            {toast.description && (
              <Text fontSize="sm" opacity={0.9} mt={1}>
                {toast.description}
              </Text>
            )}
          </Box>

          {/* Close Button */}
          <Box
            position="absolute"
            top={3}
            right={3}
            as="button"
            onClick={() => toaster.remove(toast.id)}
            cursor="pointer"
            fontSize="20px"
            fontWeight="bold"
            color="white"
            opacity={0.8}
            _hover={{ opacity: 1 }}
            transition="opacity 0.2s"
            bg="transparent"
            border="none"
            p={1}
            lineHeight={1}
          >
            ✕
          </Box>
        </Box>
      )}
    </ChakraToaster>
  );
}
