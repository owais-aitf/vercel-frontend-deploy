'use client';

import { useContext } from 'react';
import { Text, VStack, Card, Button } from '@chakra-ui/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { salesNavigation } from '@/shared/config/navigation';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { AuthContext } from '@/context/AuthContext';

export default function ClientsPage() {
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
    <FeatureErrorBoundary featureName="Clients">
      <DashboardLayout
        navigation={salesNavigation}
        pageTitle="Clients"
        pageSubtitle="Manage client information and relationships"
        userName={user?.fullName || 'Sales User'}
        userInitials={getUserInitials()}
        notificationCount={0}
      >
        <Card.Root>
          <Card.Body p={8}>
            <VStack gap={4} align="center" justify="center" minH="400px">
              <Text fontSize="4xl">👥</Text>
              <Text fontSize="2xl" fontWeight="bold">
                Clients Management
              </Text>
              <Text color="gray.600" textAlign="center" maxW="500px">
                This page will contain client management features including:
              </Text>
              <VStack gap={2} align="start" color="gray.700">
                <Text>• View all clients</Text>
                <Text>• Add new clients</Text>
                <Text>• Edit client information</Text>
                <Text>• View client projects and statistics</Text>
                <Text>• Manage client contacts</Text>
              </VStack>
              <Button colorScheme="blue" mt={4}>
                + Add New Client
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
