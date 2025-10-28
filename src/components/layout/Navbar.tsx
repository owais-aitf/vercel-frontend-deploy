'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import { Box, Text, VStack, HStack, Badge, Button } from '@chakra-ui/react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

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
  const { t } = useTranslation('common');

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
      h={{ base: '64px', md: '70px' }}
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      zIndex={9}
      px={{ base: 4, md: 6 }}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      boxShadow="sm"
    >
      {/* Left Side - Menu Button (Mobile) + Title */}
      <HStack gap={{ base: 2, md: 4 }} flex={1} minW={0}>
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
          flexShrink={0}
        >
          <VStack gap={1}>
            <Box w="24px" h="3px" bg="gray.700" borderRadius="full" />
            <Box w="24px" h="3px" bg="gray.700" borderRadius="full" />
            <Box w="24px" h="3px" bg="gray.700" borderRadius="full" />
          </VStack>
        </Box>

        {/* Title */}
        <VStack align="start" gap={0} minW={0} flex={1}>
          <Text
            fontSize={{ base: 'lg', sm: 'lg', md: 'xl' }}
            fontWeight="bold"
            color="gray.800"
            lineClamp={1}
            w="full"
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
      <HStack gap={{ base: 1.5, sm: 2, md: 3 }} flexShrink={0}>
        {/* Language Switcher */}
        <Box transform={{ base: 'scale(0.9)', md: 'scale(1)' }}>
          {' '}
          {/*Scale down slightly on mobile */}
          <LanguageSwitcher />
        </Box>

        {/* Notification Icon */}
        {/* <Box
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
        </Box> */}

        {/* User Profile - Hidden on Mobile */}
        <HStack gap={2} display={{ base: 'none', sm: 'flex' }}>
          <Box
            w={{ base: '28px', md: '32px' }}
            h={{ base: '28px', md: '32px' }}
            borderRadius="full"
            bg="blue.500"
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize={{ base: 'xs', md: 'sm' }}
            fontWeight="bold"
            flexShrink={0}
          >
            {userInitials}
          </Box>
        </HStack>

        {/* Logout Button - Mobile Only (since sidebar is hidden on mobile) */}
        <Button
          onClick={handleLogout}
          size={{ base: 'xs', sm: 'sm' }}
          colorScheme="red"
          variant="ghost"
          display={{ base: 'flex', lg: 'none' }}
          px={{ base: 2, sm: 3 }}
          fontSize={{ base: 'xs', sm: 'sm' }}
          flexShrink={0}
        >
          {t('logout')}
        </Button>
      </HStack>
    </Box>
  );
};
