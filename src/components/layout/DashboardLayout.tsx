'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { NavigationConfig } from '@/shared/config/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
  navigation: NavigationConfig;
  pageTitle: string;
  pageSubtitle: string;
  userName: string;
  userInitials: string;
  notificationCount?: number;
}

export const DashboardLayout = ({
  children,
  navigation,
  pageTitle,
  pageSubtitle,
  userName,
  userInitials,
  notificationCount = 0,
}: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Flex h="100vh" overflow="hidden" suppressHydrationWarning>
      {/* Fixed Sidebar */}
      <Sidebar
        navigation={navigation}
        userName={userName}
        userInitials={userInitials}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Overlay for Mobile Sidebar - Only render after mount to avoid hydration mismatch */}
      {isMounted && isSidebarOpen && (
        <Box
          position="fixed"
          inset={0}
          bg="blackAlpha.600"
          zIndex={9}
          display={{ base: 'block', lg: 'none' }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <Box
        ml={{ base: 0, lg: '240px' }}
        flex={1}
        display="flex"
        flexDirection="column"
        w="full"
      >
        {/* Fixed Navbar */}
        <Navbar
          title={pageTitle}
          subtitle={pageSubtitle}
          userName={userName}
          userInitials={userInitials}
          notificationCount={notificationCount}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Scrollable Content */}
        <Box
          mt="70px"
          flex={1}
          overflowY="auto"
          bg="gray.50"
          p={{ base: 4, md: 6 }}
        >
          {children}
        </Box>
      </Box>
    </Flex>
  );
};
