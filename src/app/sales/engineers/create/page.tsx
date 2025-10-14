'use client';

import { useState, useContext } from 'react';
import {
  Box,
  Grid,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  Input,
} from '@chakra-ui/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { salesNavigation } from '@/shared/config/navigation';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { AuthContext } from '@/context/AuthContext';
import { engineerService } from '@/shared/service/engineerService';
import { toaster } from '@/components/ui/toaster';
import { useRouter } from 'next/navigation';

const engineerTabs = [
  { label: 'View All Engineers', href: '/sales/engineers', icon: '👥' },
  { label: 'Create New Engineer', href: '/sales/engineers/create', icon: '➕' },
  { label: 'Update Engineer', href: '/sales/engineers/update', icon: '✏️' },
  {
    label: 'Manage Attendance',
    href: '/sales/engineers/attendance',
    icon: '📅',
  },
];

export default function CreateEngineerPage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    slackUserId: '',
  });
  const [createdPassword, setCreatedPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.fullName) {
      toaster.create({
        title: 'Validation Error',
        description: 'Email and Full Name are required',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await engineerService.createEngineer({
        email: formData.email,
        fullName: formData.fullName,
        role: 'ENGINEER',
        slackUserId: formData.slackUserId || undefined,
      });

      if (response.success) {
        setCreatedPassword(response.data.temporaryPassword);
        toaster.create({
          title: 'Engineer created successfully!',
          description: `Account created for ${formData.fullName}`,
          type: 'success',
          duration: 4000,
        });

        // Reset form
        setFormData({
          email: '',
          fullName: '',
          slackUserId: '',
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toaster.create({
        title: 'Error',
        description: errorMessage || 'Failed to create engineer',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(createdPassword);
    toaster.create({
      title: 'Password copied!',
      description: 'Temporary password copied to clipboard',
      type: 'success',
      duration: 2000,
    });
  };

  return (
    <FeatureErrorBoundary featureName="Create Engineer">
      <DashboardLayout
        navigation={salesNavigation}
        pageTitle="Engineer Management"
        pageSubtitle="Manage engineers and their attendance records"
        userName={user?.fullName || 'User'}
        userInitials={
          user?.fullName
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase() || 'U'
        }
        notificationCount={0}
      >
        {/* Tab Navigation */}
        <TabNavigation tabs={engineerTabs} />

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          {/* Create Form */}
          <Card.Root p={6}>
            <VStack align="stretch" gap={6}>
              <Box>
                <Text fontSize="xl" fontWeight="bold" mb={2}>
                  ➕ Create New Engineer Account
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Fill in the details to create a new engineer account. A
                  temporary password will be generated automatically.
                </Text>
              </Box>

              <form onSubmit={handleSubmit}>
                <VStack align="stretch" gap={5}>
                  {/* Email */}
                  <Box>
                    <Text
                      fontSize="sm"
                      mb={2}
                      fontWeight="medium"
                      color="gray.700"
                    >
                      Email Address{' '}
                      <Text as="span" color="red.500">
                        *
                      </Text>
                    </Text>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="engineer@example.com"
                      required
                      size="lg"
                    />
                  </Box>

                  {/* Full Name */}
                  <Box>
                    <Text
                      fontSize="sm"
                      mb={2}
                      fontWeight="medium"
                      color="gray.700"
                    >
                      Full Name{' '}
                      <Text as="span" color="red.500">
                        *
                      </Text>
                    </Text>
                    <Input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      placeholder="John Doe"
                      required
                      size="lg"
                    />
                  </Box>

                  {/* Slack User ID */}
                  <Box>
                    <Text
                      fontSize="sm"
                      mb={2}
                      fontWeight="medium"
                      color="gray.700"
                    >
                      Slack User ID (Optional)
                    </Text>
                    <Input
                      type="text"
                      value={formData.slackUserId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slackUserId: e.target.value,
                        })
                      }
                      placeholder="U123456789"
                      size="lg"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Used for Slack notifications and reminders
                    </Text>
                  </Box>

                  {/* Submit Button */}
                  <HStack gap={3} pt={2}>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      loading={loading}
                      loadingText="Creating..."
                      flex={1}
                    >
                      ➕ Create Engineer
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => router.push('/sales/engineers')}
                    >
                      Cancel
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </VStack>
          </Card.Root>

          {/* Info Panel */}
          <VStack align="stretch" gap={6}>
            {/* Instructions */}
            <Card.Root p={5} bg="blue.50">
              <VStack align="stretch" gap={3}>
                <HStack gap={2}>
                  <Text fontSize="lg">ℹ️</Text>
                  <Text fontSize="md" fontWeight="bold" color="blue.900">
                    Important Information
                  </Text>
                </HStack>
                <VStack align="stretch" gap={2} fontSize="sm" color="blue.800">
                  <Text>• A temporary password will be auto-generated</Text>
                  <Text>• Credentials will be emailed to the engineer</Text>
                  <Text>• Engineer must reset password on first login</Text>
                  <Text>• Default annual leave allowance: 10 days</Text>
                </VStack>
              </VStack>
            </Card.Root>

            {/* Password Display */}
            {createdPassword && (
              <Card.Root
                p={5}
                bg="green.50"
                borderColor="green.300"
                borderWidth={2}
              >
                <VStack align="stretch" gap={3}>
                  <HStack gap={2}>
                    <Text fontSize="lg">✅</Text>
                    <Text fontSize="md" fontWeight="bold" color="green.900">
                      Engineer Created!
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="green.800">
                    Temporary password generated:
                  </Text>
                  <Box
                    p={3}
                    bg="white"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="green.300"
                  >
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      fontFamily="mono"
                      color="green.900"
                      textAlign="center"
                    >
                      {createdPassword}
                    </Text>
                  </Box>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={handleCopyPassword}
                  >
                    📋 Copy Password
                  </Button>
                  <Text fontSize="xs" color="green.700">
                    ⚠️ Save this password! It won&apos;t be shown again. The
                    credentials have also been emailed to the engineer.
                  </Text>
                </VStack>
              </Card.Root>
            )}

            {/* Requirements */}
            <Card.Root p={5}>
              <VStack align="stretch" gap={3}>
                <Text fontSize="md" fontWeight="bold">
                  📋 Requirements
                </Text>
                <VStack align="stretch" gap={2} fontSize="sm" color="gray.700">
                  <Text>✓ Valid email address</Text>
                  <Text>✓ Full name (min 2 characters)</Text>
                  <Text>✓ Unique email (not already registered)</Text>
                </VStack>
              </VStack>
            </Card.Root>
          </VStack>
        </Grid>
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
