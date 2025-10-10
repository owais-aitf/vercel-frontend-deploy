'use client';

import { ReactNode } from 'react';
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
  return (
    <Flex h="100vh" overflow="hidden">
      {/* Fixed Sidebar */}
      <Sidebar
        navigation={navigation}
        userName={userName}
        userInitials={userInitials}
      />

      {/* Main Content Area */}
      <Box ml="240px" flex={1} display="flex" flexDirection="column">
        {/* Fixed Navbar */}
        <Navbar
          title={pageTitle}
          subtitle={pageSubtitle}
          userName={userName}
          userInitials={userInitials}
          notificationCount={notificationCount}
        />

        {/* Scrollable Content */}
        <Box mt="70px" flex={1} overflowY="auto" bg="gray.50" p={6}>
          {children}
        </Box>
      </Box>
    </Flex>
  );
};
