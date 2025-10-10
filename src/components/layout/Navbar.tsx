'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
} from '@chakra-ui/react';

interface NavbarProps {
  title: string;
  subtitle: string;
  userName: string;
  userInitials: string;
  notificationCount?: number;
}

export const Navbar = ({
  title,
  subtitle,
  userName,
  userInitials,
  notificationCount = 0,
}: NavbarProps) => {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  return (
    <Box
      position="fixed"
      top={0}
      right={0}
      left="240px"
      h="70px"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      zIndex={9}
      px={6}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      {/* Left Side - Title */}
      <VStack align="start" gap={0}>
        <Text fontSize="xl" fontWeight="bold" color="gray.800">
          {title}
        </Text>
        <Text fontSize="sm" color="gray.500">
          {subtitle}
        </Text>
      </VStack>

      {/* Right Side - Actions */}
      <HStack gap={4}>
        {/* Notification Icon */}
        <Box
          position="relative"
          cursor="pointer"
          _hover={{ transform: 'scale(1.1)' }}
          transition="all 0.2s"
        >
          <Text fontSize="24px">🔔</Text>
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

        {/* User Profile with Dropdown */}
        <Box position="relative">
          <HStack
            gap={2}
            cursor="pointer"
            onClick={() => setShowDropdown(!showDropdown)}
            p={2}
            borderRadius="md"
            _hover={{ bg: 'gray.100' }}
            transition="all 0.2s"
          >
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
            <Text fontSize="12px">{showDropdown ? '▲' : '▼'}</Text>
          </HStack>

          {/* Dropdown Menu */}
          {showDropdown && (
            <Box
              position="absolute"
              top="100%"
              right={0}
              mt={2}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              shadow="lg"
              minW="180px"
              zIndex={100}
            >
              <VStack align="stretch" gap={0}>
                {/* Profile Info */}
                <Box p={4} borderBottom="1px solid" borderColor="gray.200">
                  <Text fontSize="sm" fontWeight="bold">
                    {userName}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Engineer
                  </Text>
                </Box>

                {/* Menu Items */}
                <Box
                  as="button"
                  p={3}
                  textAlign="left"
                  _hover={{ bg: 'gray.50' }}
                  transition="all 0.2s"
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  onClick={() => {
                    router.push('/engineer/profile');
                    setShowDropdown(false);
                  }}
                  border="none"
                  bg="transparent"
                  w="full"
                  cursor="pointer"
                >
                  <HStack gap={2}>
                    <Text fontSize="16px">👤</Text>
                    <Text fontSize="sm">Profile</Text>
                  </HStack>
                </Box>

                <Box
                  as="button"
                  p={3}
                  textAlign="left"
                  _hover={{ bg: 'gray.50' }}
                  transition="all 0.2s"
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  onClick={() => {
                    router.push('/engineer/settings');
                    setShowDropdown(false);
                  }}
                  border="none"
                  bg="transparent"
                  w="full"
                  cursor="pointer"
                >
                  <HStack gap={2}>
                    <Text fontSize="16px">⚙️</Text>
                    <Text fontSize="sm">Settings</Text>
                  </HStack>
                </Box>

                <Box
                  as="button"
                  p={3}
                  textAlign="left"
                  _hover={{ bg: 'red.50' }}
                  transition="all 0.2s"
                  onClick={handleLogout}
                  border="none"
                  bg="transparent"
                  w="full"
                  cursor="pointer"
                  color="red.600"
                >
                  <HStack gap={2}>
                    <Text fontSize="16px">🚪</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      Logout
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            </Box>
          )}
        </Box>
      </HStack>
    </Box>
  );
};
