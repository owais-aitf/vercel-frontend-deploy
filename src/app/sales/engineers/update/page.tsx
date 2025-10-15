'use client';

import { useState, useEffect, useContext } from 'react';
import {
  Box,
  Grid,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  Input,
  Badge,
} from '@chakra-ui/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { salesNavigation } from '@/shared/config/navigation';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { AuthContext } from '@/context/AuthContext';
import { engineerService, Engineer } from '@/shared/service/engineerService';
import { toaster } from '@/components/ui/toaster';

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

export default function UpdateEngineerPage() {
  const { user } = useContext(AuthContext);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    slackUserId: '',
    annualPaidLeaveAllowance: 10,
  });

  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    try {
      setLoading(true);
      const response = await engineerService.getAllEngineers();
      setEngineers(response.data || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toaster.create({
        title: 'Error',
        description: errorMessage || 'Failed to fetch engineers',
        type: 'error',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEngineer = (engineer: Engineer) => {
    setSelectedEngineer(engineer);
    setFormData({
      fullName: engineer.fullName,
      slackUserId: engineer.slackUserId || '',
      annualPaidLeaveAllowance: engineer.annualPaidLeaveAllowance,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEngineer) return;

    try {
      setUpdating(true);
      await engineerService.updateEngineer(selectedEngineer.id, {
        fullName: formData.fullName,
        slackUserId: formData.slackUserId || undefined,
        annualPaidLeaveAllowance: formData.annualPaidLeaveAllowance,
      });

      toaster.create({
        title: 'Engineer updated successfully!',
        description: `Updated ${formData.fullName}`,
        type: 'success',
        duration: 3000,
      });

      // Refresh engineers list
      await fetchEngineers();
      setSelectedEngineer(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toaster.create({
        title: 'Error',
        description: errorMessage || 'Failed to update engineer',
        type: 'error',
        duration: 4000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (engineerId: string, engineerName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete ${engineerName}? This will deactivate their account.`
      )
    ) {
      return;
    }

    try {
      await engineerService.deleteEngineer(engineerId);
      toaster.create({
        title: 'Engineer deleted successfully',
        description: `${engineerName} has been deactivated`,
        type: 'success',
        duration: 3000,
      });

      // Refresh list and clear selection
      await fetchEngineers();
      if (selectedEngineer?.id === engineerId) {
        setSelectedEngineer(null);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toaster.create({
        title: 'Error',
        description: errorMessage || 'Failed to delete engineer',
        type: 'error',
        duration: 4000,
      });
    }
  };

  const filteredEngineers = engineers.filter(
    (engineer) =>
      engineer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engineer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <FeatureErrorBoundary featureName="Update Engineer">
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

        <Grid
          templateColumns={{ base: '1fr', lg: '1fr 2fr' }}
          gap={{ base: 4, md: 6 }}
        >
          {/* Engineer Selection List */}
          <Card.Root
            p={6}
            bg="gradient.to-br"
            bgGradient="linear(to-br, blue.50, white)"
          >
            <VStack align="stretch" gap={4}>
              <HStack justify="space-between">
                <VStack align="start" gap={1}>
                  <HStack gap={2}>
                    <Box
                      w="10px"
                      h="10px"
                      borderRadius="full"
                      bg="blue.500"
                      animation="pulse 2s ease-in-out infinite"
                    />
                    <Text fontSize="lg" fontWeight="bold" color="gray.800">
                      Select Engineer
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    Choose an engineer to update
                  </Text>
                </VStack>
                {engineers.length > 0 && (
                  <Badge
                    colorScheme="blue"
                    fontSize="xs"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {engineers.length} Engineers
                  </Badge>
                )}
              </HStack>

              {/* Search */}
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Search engineers..."
                size="md"
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'blue.300' }}
                _focus={{
                  borderColor: 'blue.500',
                  boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                }}
              />

              {/* Engineers List */}
              <VStack
                align="stretch"
                gap={2}
                maxH={{ base: '400px', md: '600px' }}
                overflowY="auto"
                pr={2}
              >
                {loading && (
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    textAlign="center"
                    py={4}
                  >
                    Loading engineers...
                  </Text>
                )}

                {!loading && filteredEngineers.length === 0 && (
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    textAlign="center"
                    py={4}
                  >
                    No engineers found
                  </Text>
                )}

                {!loading &&
                  filteredEngineers.map((engineer) => (
                    <Card.Root
                      key={engineer.id}
                      p={{ base: 2, md: 3 }}
                      cursor="pointer"
                      onClick={() => handleSelectEngineer(engineer)}
                      bg={
                        selectedEngineer?.id === engineer.id
                          ? 'blue.50'
                          : 'white'
                      }
                      borderColor={
                        selectedEngineer?.id === engineer.id
                          ? 'blue.500'
                          : 'gray.200'
                      }
                      borderWidth={2}
                      _hover={{ bg: 'gray.50' }}
                      transition="all 0.2s"
                    >
                      <VStack align="stretch" gap={1}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" fontWeight="bold">
                            {engineer.fullName}
                          </Text>
                          <Badge
                            colorScheme={engineer.isActive ? 'green' : 'red'}
                            fontSize="xs"
                          >
                            {engineer.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </HStack>
                        <Text fontSize="xs" color="gray.600">
                          {engineer.email}
                        </Text>
                      </VStack>
                    </Card.Root>
                  ))}
              </VStack>
            </VStack>
          </Card.Root>

          {/* Update Form */}
          <Card.Root p={{ base: 4, md: 6 }}>
            {!selectedEngineer ? (
              <VStack gap={4} py={{ base: 10, md: 20 }}>
                <Text fontSize={{ base: '3xl', md: '4xl' }}>👈</Text>
                <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold">
                  Select an Engineer
                </Text>
                <Text
                  fontSize={{ base: 'xs', md: 'sm' }}
                  color="gray.600"
                  textAlign="center"
                >
                  Choose an engineer from the list to view and update their
                  information
                </Text>
              </VStack>
            ) : (
              <VStack align="stretch" gap={6}>
                <Box>
                  <HStack
                    justify="space-between"
                    mb={2}
                    flexWrap="wrap"
                    gap={2}
                  >
                    <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold">
                      ✏️ Update Engineer
                    </Text>
                    <Button
                      size={{ base: 'xs', md: 'sm' }}
                      variant="ghost"
                      onClick={() => setSelectedEngineer(null)}
                    >
                      ✕ Clear
                    </Button>
                  </HStack>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
                    Update engineer information below
                  </Text>
                </Box>

                {/* Current Info Display */}
                <Card.Root p={4} bg="gray.50">
                  <VStack align="stretch" gap={2}>
                    <HStack>
                      <Text fontSize="sm" fontWeight="bold" color="gray.700">
                        Email:
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {selectedEngineer.email}
                      </Text>
                    </HStack>
                    <HStack>
                      <Text fontSize="sm" fontWeight="bold" color="gray.700">
                        Status:
                      </Text>
                      <Badge
                        colorScheme={
                          selectedEngineer.isActive ? 'green' : 'red'
                        }
                      >
                        {selectedEngineer.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </HStack>
                    <HStack>
                      <Text fontSize="sm" fontWeight="bold" color="gray.700">
                        Leave Used:
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {selectedEngineer.paidLeaveUsedThisYear}/
                        {selectedEngineer.annualPaidLeaveAllowance} days
                      </Text>
                    </HStack>
                  </VStack>
                </Card.Root>

                <form onSubmit={handleUpdate}>
                  <VStack align="stretch" gap={5}>
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
                        Slack User ID
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
                    </Box>

                    {/* Annual Leave Allowance */}
                    <Box>
                      <Text
                        fontSize="sm"
                        mb={2}
                        fontWeight="medium"
                        color="gray.700"
                      >
                        Annual Paid Leave Allowance (days)
                      </Text>
                      <Input
                        type="number"
                        min={0}
                        value={formData.annualPaidLeaveAllowance}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            annualPaidLeaveAllowance: parseInt(e.target.value),
                          })
                        }
                        required
                        size="lg"
                      />
                    </Box>

                    {/* Action Buttons */}
                    <HStack
                      gap={{ base: 2, md: 3 }}
                      pt={2}
                      flexWrap={{ base: 'wrap', sm: 'nowrap' }}
                    >
                      <Button
                        type="submit"
                        colorScheme="blue"
                        size={{ base: 'md', md: 'lg' }}
                        fontSize={{ base: 'sm', md: 'md' }}
                        loading={updating}
                        loadingText="Updating..."
                        flex={1}
                        minW={{ base: 'full', sm: 'auto' }}
                      >
                        💾 Update Engineer
                      </Button>
                      <Button
                        type="button"
                        colorScheme="red"
                        variant="outline"
                        size={{ base: 'md', md: 'lg' }}
                        fontSize={{ base: 'sm', md: 'md' }}
                        onClick={() =>
                          handleDelete(
                            selectedEngineer.id,
                            selectedEngineer.fullName
                          )
                        }
                        minW={{ base: 'full', sm: 'auto' }}
                      >
                        🗑️ Delete
                      </Button>
                    </HStack>
                  </VStack>
                </form>

                {/* Warning */}
                <Card.Root
                  p={4}
                  bg="yellow.50"
                  borderColor="yellow.300"
                  borderWidth={1}
                >
                  <HStack gap={2}>
                    <Text fontSize="lg">⚠️</Text>
                    <VStack align="start" gap={1}>
                      <Text fontSize="sm" fontWeight="bold" color="yellow.900">
                        Note
                      </Text>
                      <Text fontSize="xs" color="yellow.800">
                        • Email cannot be changed after creation
                        <br />
                        • Delete will deactivate the account (soft delete)
                        <br />• Only ADMIN can change active status
                      </Text>
                    </VStack>
                  </HStack>
                </Card.Root>
              </VStack>
            )}
          </Card.Root>
        </Grid>
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
