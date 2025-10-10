'use client';

import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Box,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { NavigationConfig } from '@/shared/config/navigation';

interface SidebarProps {
  navigation: NavigationConfig;
  userName: string;
  userInitials: string;
}

export const Sidebar = ({ navigation, userName, userInitials }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <Box
      w="240px"
      bg="white"
      borderRight="1px solid"
      borderColor="gray.200"
      position="fixed"
      left={0}
      top={0}
      bottom={0}
      overflowY="auto"
      zIndex={10}
    >
      {/* Logo Section */}
      <Box p={6} borderBottom="1px solid" borderColor="gray.200">
        <HStack gap={3}>
          <Box position="relative" w="40px" h="40px">
            <Image
              src="/images/logo.png"
              alt="ATF Logo"
              fill
              style={{ objectFit: 'contain' }}
            />
          </Box>
          <VStack align="start" gap={0}>
            <Text fontWeight="bold" fontSize="lg" color="blue.600">
              ATF System
            </Text>
            <Text fontSize="xs" color="gray.500">
              {navigation.portalName}
            </Text>
          </VStack>
        </HStack>
      </Box>

      {/* Navigation Items */}
      <VStack gap={1} p={4} align="stretch">
        {navigation.items.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Box
              key={item.path}
              as="button"
              onClick={() => handleNavigation(item.path)}
              p={3}
              borderRadius="md"
              bg={isActive ? 'blue.500' : 'transparent'}
              color={isActive ? 'white' : 'gray.700'}
              _hover={{
                bg: isActive ? 'blue.600' : 'gray.100',
              }}
              transition="all 0.2s"
              cursor="pointer"
              textAlign="left"
              w="full"
              border="none"
            >
              <HStack gap={3}>
                <Text fontSize="20px">{item.icon}</Text>
                <Text fontWeight={isActive ? 'semibold' : 'normal'} fontSize="sm">
                  {item.label}
                </Text>
              </HStack>
            </Box>
          );
        })}
      </VStack>

      {/* Profile Section at Bottom - FIXED */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        p={4}
        borderTop="1px solid"
        borderColor="gray.200"
        bg="white"
      >
        <HStack gap={3}>
          {/* Simple Circle Avatar */}
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
          <Text fontSize="sm" fontWeight="medium">
            {userName}
          </Text>
        </HStack>
      </Box>
    </Box>
  );
};
