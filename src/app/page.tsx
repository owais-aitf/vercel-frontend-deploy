'use client';

import {
  Box,
  Button,
  Heading,
  VStack,
  Text,
  Container,
} from '@chakra-ui/react';
import { toaster } from '@/components/ui/toaster';

export default function Home() {
  const handleClick = () => {
    console.log('Button clicked - creating toast'); // Debug log

    toaster.create({
      title: 'Success!',
      description: 'Frontend setup is complete! 🎉',
      type: 'success',
      duration: 3000,
    });
  };

  return (
    <Box
      minH="100vh"
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Container maxW="container.md">
        <Box
          bg="white"
          borderRadius="2xl"
          boxShadow="2xl"
          p={12}
          textAlign="center"
        >
          <VStack gap={6}>
            <Heading
              fontSize="4xl"
              fontWeight="bold"
              bgGradient="linear(to-r, #667eea, #764ba2)"
              bgClip="text"
            >
              Attendance Management System
            </Heading>

            <Text fontSize="lg" color="gray.600" maxW="md">
              SES Engineer Attendance & Billing Management Platform
            </Text>

            <Box mt={4}>
              <Button
                colorScheme="purple"
                size="lg"
                onClick={handleClick}
                px={8}
                py={6}
                fontSize="lg"
                borderRadius="xl"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'xl',
                }}
                transition="all 0.3s"
              >
                Test Chakra UI Toast
              </Button>
            </Box>

            <Box mt={6} pt={6} borderTop="1px" borderColor="gray.200" w="full">
              <VStack gap={2}>
                <Text fontSize="sm" color="gray.500" fontWeight="semibold">
                  Frontend Foundation Complete ✅
                </Text>
                <Text fontSize="xs" color="gray.400">
                  Next.js 14 • Chakra UI v3 • TypeScript • ESLint • Prettier
                </Text>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
