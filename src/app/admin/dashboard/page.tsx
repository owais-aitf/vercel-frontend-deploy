'use client';

import { Box, Text } from '@chakra-ui/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { adminNavigation } from '@/shared/config/navigation';

export default function AdminDashboard() {
  return (
    <DashboardLayout
      navigation={adminNavigation}
      pageTitle="Admin Dashboard"
      pageSubtitle="System administration"
      userName="Admin User"
      userInitials="AU"
      notificationCount={10}
    >
      <Box>
        <Text fontSize="2xl" fontWeight="bold">
          Admin Dashboard
        </Text>
        <Text color="gray.600" mt={2}>
          Admin content will go here...
        </Text>
      </Box>
    </DashboardLayout>
  );
}
