'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Box, Text, VStack, HStack, Button } from '@chakra-ui/react';
import {
  LuActivity,
  LuCalendar,
  LuBriefcase,
  LuFileText,
  LuPenTool,
  LuFolderOpen,
  LuUsers,
  LuUserCheck,
  LuLink,
  LuTrendingUp,
  LuUser,
  LuSettings,
  LuLogOut,
} from 'react-icons/lu';
import { NavigationConfig } from '@/shared/config/navigation';

interface SidebarProps {
  navigation: NavigationConfig;
  userName: string;
  userInitials: string;
  isOpen: boolean;
  onClose: () => void;
}

// Define role type
type UserRole = 'ENGINEER' | 'ADMIN' | 'SALES' | 'MANAGER';

// Icon mapping
const iconMap: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  Activity: LuActivity,
  Calendar: LuCalendar,
  Briefcase: LuBriefcase,
  FileText: LuFileText,
  PenTool: LuPenTool,
  FolderOpen: LuFolderOpen,
  Users: LuUsers,
  UserCheck: LuUserCheck,
  Link: LuLink,
  TrendingUp: LuTrendingUp,
  User: LuUser,
  Settings: LuSettings,
};

export const Sidebar = ({
  navigation,
  userName,
  userInitials,
  isOpen,
  onClose,
}: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState('User');

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Get user role from localStorage
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);

        // Check if userData exists and has role property
        if (userData && userData.role) {
          const role = userData.role as UserRole;

          // Format role to display name
          const roleMap: Record<UserRole, string> = {
            ENGINEER: 'Engineer',
            ADMIN: 'Admin',
            SALES: 'Sales',
            MANAGER: 'Manager',
          };

          const roleDisplayName = roleMap[role] || 'User';
          setUserRole(roleDisplayName);
        } else {
          console.warn('User data exists but role is missing');
          setUserRole('User');
        }
      } catch (error) {
        console.error('Error parsing user role:', error);
        setUserRole('User');
      }
    } else {
      // No user data in localStorage
      setUserRole('User');
    }
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <Box
      w="240px"
      bg="white"
      borderRight="1px solid"
      borderColor="gray.200"
      position="fixed"
      left={{ base: isOpen ? 0 : '-240px', lg: 0 }}
      top={0}
      bottom={0}
      overflowY="auto"
      zIndex={10}
      transition="left 0.3s"
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
      <VStack gap={1} p={4} align="stretch" pb="180px">
        {navigation.items.map((item) => {
          // Check if current path matches or starts with the item path
          const isActive =
            pathname === item.path || pathname?.startsWith(`${item.path}/`);
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
                <Box fontSize="20px">
                  {(() => {
                    const IconComponent = iconMap[item.icon];
                    return IconComponent ? <IconComponent size={20} /> : null;
                  })()}
                </Box>
                <Text
                  fontWeight={isActive ? 'semibold' : 'normal'}
                  fontSize="sm"
                >
                  {item.label}
                </Text>
              </HStack>
            </Box>
          );
        })}
      </VStack>

      {/* Profile & Logout Section at Bottom */}
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
        <VStack gap={3} align="stretch">
          {/* User Profile Section */}
          <HStack gap={3} p={3} bg="gray.50" borderRadius="md">
            <Box
              w="40px"
              h="40px"
              borderRadius="full"
              bg="blue.500"
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="md"
              fontWeight="bold"
              flexShrink={0}
            >
              {userInitials}
            </Box>
            <VStack align="start" gap={0} flex={1} overflow="hidden">
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color="gray.800"
                truncate
              >
                {userName}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {userRole} Portal
              </Text>
            </VStack>
          </HStack>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            size="sm"
            colorScheme="red"
            variant="outline"
            w="full"
          >
            <HStack gap={2}>
              <LuLogOut size={16} />
              <Text>Logout</Text>
            </HStack>
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};
