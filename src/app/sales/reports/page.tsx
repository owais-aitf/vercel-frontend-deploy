'use client';

import { useContext } from 'react';
import { Text, VStack, Card, Button, HStack } from '@chakra-ui/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { salesNavigation } from '@/shared/config/navigation';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { AuthContext } from '@/context/AuthContext';

export default function ReportsPage() {
  const { user } = useContext(AuthContext);

  const getUserInitials = () => {
    if (!user?.fullName) return 'SU';
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.fullName.slice(0, 2).toUpperCase();
  };

  return (
    <FeatureErrorBoundary featureName="Reports">
      <DashboardLayout
        navigation={salesNavigation}
        pageTitle="Reports"
        pageSubtitle="Generate and manage monthly billing reports"
        userName={user?.fullName || 'Sales User'}
        userInitials={getUserInitials()}
        notificationCount={0}
      >
        <Card.Root>
          <Card.Body p={8}>
            <VStack gap={4} align="center" justify="center" minH="400px">
              <Text fontSize="4xl">📈</Text>
              <Text fontSize="2xl" fontWeight="bold">
                Monthly Reports Management
              </Text>
              <Text color="gray.600" textAlign="center" maxW="500px">
                This page will contain monthly report features including:
              </Text>
              <VStack gap={2} align="start" color="gray.700">
                <Text>• View all monthly reports</Text>
                <Text>• Generate reports for project assignments</Text>
                <Text>• Review and approve submitted reports</Text>
                <Text>• View billing amounts and settlements</Text>
                <Text>• Track excess/shortage hours</Text>
                <Text>• Download reports (Excel/PDF)</Text>
                <Text>• Filter by engineer, project, status, or date</Text>
              </VStack>
              <HStack gap={3} mt={4}>
                <Button colorScheme="blue">Generate Report</Button>
                <Button variant="outline">View All Reports</Button>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
