'use client';

import { Box, Text } from '@chakra-ui/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { salesNavigation } from '@/shared/config/navigation';

export default function SalesDashboard() {
  return (
    <DashboardLayout
      navigation={salesNavigation}
      pageTitle="Sales Dashboard"
      pageSubtitle="Manage projects and clients"
      userName="Sales User"
      userInitials="SU"
      notificationCount={5}
    >
      <Box>
        <Text fontSize="2xl" fontWeight="bold">
          Sales Dashboard
        </Text>
        <Text color="gray.600" mt={2}>
          Sales content will go here...
        </Text>
      </Box>
    </DashboardLayout>
  );
}
