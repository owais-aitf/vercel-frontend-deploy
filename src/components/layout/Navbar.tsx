'use client';

import { useRouter } from 'next/navigation';
import { Box, Text, VStack, HStack, Badge, Button } from '@chakra-ui/react';

interface NavbarProps {
  title: string;
  subtitle: string;
  userName: string;
  userInitials: string;
  notificationCount?: number;
  onMenuClick: () => void;
}

export const Navbar = ({
  title,
  subtitle,
  userInitials,
  notificationCount = 0,
  onMenuClick,
}: NavbarProps) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  return (
    <Box
      position="fixed"
      top={0}
      right={0}
      left={{ base: 0, lg: '240px' }}
      h="70px"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      zIndex={9}
      px={{ base: 4, md: 6 }}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      {/* Left Side - Menu Button (Mobile) + Title */}
      <HStack gap={4}>
        {/* Hamburger Menu - Mobile Only */}
        <Box
          as="button"
          display={{ base: 'block', lg: 'none' }}
          onClick={onMenuClick}
          p={2}
          border="none"
          bg="transparent"
          cursor="pointer"
          _hover={{ bg: 'gray.100' }}
          borderRadius="md"
        >
          <VStack gap={1}>
            <Box w="24px" h="3px" bg="gray.700" borderRadius="full" />
            <Box w="24px" h="3px" bg="gray.700" borderRadius="full" />
            <Box w="24px" h="3px" bg="gray.700" borderRadius="full" />
          </VStack>
        </Box>

        {/* Title */}
        <VStack align="start" gap={0}>
          <Text
            fontSize={{ base: 'lg', md: 'xl' }}
            fontWeight="bold"
            color="gray.800"
          >
            {title}
          </Text>
          <Text
            fontSize="sm"
            color="gray.500"
            display={{ base: 'none', md: 'block' }}
          >
            {subtitle}
          </Text>
        </VStack>
      </HStack>

      {/* Right Side - Actions */}
      <HStack gap={{ base: 2, md: 4 }}>
        {/* Notification Icon */}
        <Box
          position="relative"
          cursor="pointer"
          _hover={{ transform: 'scale(1.1)' }}
          transition="all 0.2s"
        >
          <Text fontSize={{ base: '20px', md: '24px' }}>🔔</Text>
          {notificationCount > 0 && (
            <Badge
              position="absolute"
              top="-4px"
              right="-4px"
              bg="red.500"
              color="white"
              borderRadius="full"
              fontSize="10px"
              w="18px"
              h="18px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {notificationCount}
            </Badge>
          )}
        </Box>

        {/* User Profile - Hidden on Mobile */}
        <HStack gap={2} display={{ base: 'none', sm: 'flex' }}>
          <Text fontSize="sm" fontWeight="medium">
            {userInitials}
          </Text>
          <Box
            w="32px"
            h="32px"
            borderRadius="full"
            bg="blue.500"
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="sm"
            fontWeight="bold"
          >
            {userInitials}
          </Box>
        </HStack>

        {/* Logout Button - Mobile Only (since sidebar is hidden on mobile) */}
        <Button
          onClick={handleLogout}
          size="sm"
          colorScheme="red"
          variant="ghost"
          display={{ base: 'flex', lg: 'none' }}
        >
          Logout
        </Button>
      </HStack>
    </Box>
  );
};
