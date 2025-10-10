'use client';

import { Box, Text } from '@chakra-ui/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { engineerNavigation } from '@/shared/config/navigation';

export default function UpdateDailyReport() {
  return (
    <DashboardLayout
      navigation={engineerNavigation}
      pageTitle="Update Daily Report"
      pageSubtitle="Submit your daily work report"
      userName="John Doe"
      userInitials="JD"
    >
      <Box>
        <Text fontSize="2xl" fontWeight="bold">
          Update Daily Report
        </Text>
        <Text color="gray.600" mt={2}>
          Report submission form will go here...
        </Text>
      </Box>
    </DashboardLayout>
  );
}
