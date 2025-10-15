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
  Badge,
  Input,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
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

export default function EngineersPage() {
  const { user } = useContext(AuthContext);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [filteredEngineers, setFilteredEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(
    null
  );

  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await engineerService.getAllEngineers();
      const engineersData = response.data || [];
      setEngineers(engineersData);
      setFilteredEngineers(engineersData);
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      setError(errorMessage || 'Failed to fetch engineers');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...engineers];

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((engineer) => engineer.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((engineer) => !engineer.isActive);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (engineer) =>
          engineer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          engineer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          engineer.slackUserId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEngineers(filtered);
  }, [searchTerm, statusFilter, engineers]);

  const handleSendReminder = async (
    engineerId: string,
    engineerName: string
  ) => {
    // TODO: Implement API call later
    // await engineerService.sendReminder(engineerId);
    toaster.create({
      title: 'Reminder feature',
      description: `Reminder functionality for ${engineerName} will be implemented soon`,
      type: 'info',
      duration: 3000,
    });
  };

  const openEngineerModal = (engineer: Engineer) => {
    setSelectedEngineer(engineer);
  };

  const closeEngineerModal = () => {
    setSelectedEngineer(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const activeCount = engineers.filter((e) => e.isActive).length;
  const inactiveCount = engineers.length - activeCount;
  const totalLeaveUsed = engineers.reduce(
    (sum, e) => sum + e.paidLeaveUsedThisYear,
    0
  );

  return (
    <FeatureErrorBoundary featureName="Engineers">
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

        {/* Stats Cards */}
        <Grid
          templateColumns={{
            base: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          }}
          gap={4}
          mb={6}
        >
          <Card.Root p={{ base: 3, md: 4 }} bg="blue.50">
            <VStack align="start" gap={2}>
              <Text
                fontSize={{ base: 'xs', md: 'sm' }}
                color="blue.700"
                fontWeight="medium"
              >
                Total Engineers
              </Text>
              <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
                color="blue.900"
              >
                {engineers.length}
              </Text>
            </VStack>
          </Card.Root>

          <Card.Root p={{ base: 3, md: 4 }} bg="green.50">
            <VStack align="start" gap={2}>
              <Text
                fontSize={{ base: 'xs', md: 'sm' }}
                color="green.700"
                fontWeight="medium"
              >
                Active Engineers
              </Text>
              <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
                color="green.900"
              >
                {activeCount}
              </Text>
            </VStack>
          </Card.Root>

          <Card.Root p={{ base: 3, md: 4 }} bg="red.50">
            <VStack align="start" gap={2}>
              <Text
                fontSize={{ base: 'xs', md: 'sm' }}
                color="red.700"
                fontWeight="medium"
              >
                Inactive Engineers
              </Text>
              <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
                color="red.900"
              >
                {inactiveCount}
              </Text>
            </VStack>
          </Card.Root>

          <Card.Root p={{ base: 3, md: 4 }} bg="purple.50">
            <VStack align="start" gap={2}>
              <Text
                fontSize={{ base: 'xs', md: 'sm' }}
                color="purple.700"
                fontWeight="medium"
              >
                Total Leave Used
              </Text>
              <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
                color="purple.900"
              >
                {totalLeaveUsed} days
              </Text>
            </VStack>
          </Card.Root>
        </Grid>

        {/* Filters */}
        <Card.Root p={{ base: 4, md: 6 }} mb={6}>
          <VStack align="stretch" gap={4}>
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold">
              🔍 Filters
            </Text>

            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
              gap={4}
            >
              {/* Search */}
              <Box>
                <Text fontSize="sm" mb={2} fontWeight="medium" color="gray.700">
                  Search
                </Text>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or Slack ID..."
                  bg="white"
                />
              </Box>

              {/* Status Filter */}
              <Box>
                <Text fontSize="sm" mb={2} fontWeight="medium" color="gray.700">
                  Status
                </Text>
                <Box position="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value as 'all' | 'active' | 'inactive'
                      )
                    }
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 40px 0 12px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: 'white',
                      fontSize: '14px',
                      cursor: 'pointer',
                      appearance: 'none',
                      outline: 'none',
                      fontWeight: '400',
                      color: '#374151',
                    }}
                  >
                    <option value="all">All Engineers</option>
                    <option value="active">✅ Active Only</option>
                    <option value="inactive">❌ Inactive Only</option>
                  </select>
                  <Box
                    position="absolute"
                    right="12px"
                    top="50%"
                    transform="translateY(-50%)"
                    pointerEvents="none"
                    color="gray.500"
                    fontSize="10px"
                  >
                    ▼
                  </Box>
                </Box>
              </Box>
            </Grid>

            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
                Showing <strong>{filteredEngineers.length}</strong> engineers
              </Text>
              <Button
                onClick={fetchEngineers}
                size={{ base: 'xs', md: 'sm' }}
                variant="ghost"
                colorScheme="blue"
              >
                🔄 Refresh
              </Button>
            </HStack>
          </VStack>
        </Card.Root>

        {/* Loading/Error/Empty States */}
        {loading && (
          <Card.Root p={8}>
            <VStack gap={4}>
              <Text fontSize="2xl">⏳</Text>
              <Text color="gray.600">Loading engineers...</Text>
            </VStack>
          </Card.Root>
        )}

        {error && !loading && (
          <Card.Root p={6} bg="red.50">
            <HStack gap={3}>
              <Text fontSize="2xl">⚠️</Text>
              <VStack align="start" gap={1}>
                <Text fontWeight="bold" color="red.700">
                  Error
                </Text>
                <Text fontSize="sm" color="red.600">
                  {error}
                </Text>
              </VStack>
            </HStack>
          </Card.Root>
        )}

        {!loading && !error && filteredEngineers.length === 0 && (
          <Card.Root p={8}>
            <VStack gap={4}>
              <Text fontSize="4xl">👨‍💼</Text>
              <Text fontSize="lg" fontWeight="bold">
                No Engineers Found
              </Text>
              <Text color="gray.600">
                {engineers.length === 0
                  ? 'No engineers have been added yet.'
                  : 'No engineers match your filters.'}
              </Text>
            </VStack>
          </Card.Root>
        )}

        {/* Engineers Grid */}
        {!loading && !error && filteredEngineers.length > 0 && (
          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            }}
            gap={6}
          >
            {filteredEngineers.map((engineer) => (
              <Card.Root
                key={engineer.id}
                p={5}
                _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                <VStack align="stretch" gap={3}>
                  <HStack justify="space-between" align="start">
                    <Text fontSize="lg" fontWeight="bold" flex={1}>
                      {engineer.fullName}
                    </Text>
                    <Badge
                      colorScheme={engineer.isActive ? 'green' : 'red'}
                      fontSize="xs"
                    >
                      {engineer.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </HStack>

                  <HStack gap={2}>
                    <Text fontSize="sm" color="gray.500">
                      📧
                    </Text>
                    <Text fontSize="sm" color="gray.700" wordBreak="break-all">
                      {engineer.email}
                    </Text>
                  </HStack>

                  {engineer.slackUserId && (
                    <HStack gap={2}>
                      <Text fontSize="sm" color="gray.500">
                        💬
                      </Text>
                      <Text fontSize="sm" color="gray.700">
                        {engineer.slackUserId}
                      </Text>
                    </HStack>
                  )}

                  <HStack gap={2}>
                    <Text fontSize="sm" color="gray.500">
                      🏖️
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                      Leave: {engineer.paidLeaveUsedThisYear}/
                      {engineer.annualPaidLeaveAllowance} days
                    </Text>
                  </HStack>

                  {engineer.lastLoginAt && (
                    <HStack gap={2}>
                      <Text fontSize="sm" color="gray.500">
                        🕐
                      </Text>
                      <Text fontSize="sm" color="gray.700">
                        Last login:{' '}
                        {new Date(engineer.lastLoginAt).toLocaleDateString()}
                      </Text>
                    </HStack>
                  )}

                  <HStack gap={2} mt={2}>
                    <Button
                      size={{ base: 'xs', md: 'sm' }}
                      colorScheme="blue"
                      variant="outline"
                      flex={1}
                      fontSize={{ base: 'xs', md: 'sm' }}
                      onClick={() => openEngineerModal(engineer)}
                    >
                      View Details
                    </Button>
                    <Button
                      size={{ base: 'xs', md: 'sm' }}
                      colorScheme="purple"
                      variant="ghost"
                      onClick={() =>
                        handleSendReminder(engineer.id, engineer.fullName)
                      }
                      title="Send Reminder"
                    >
                      🔔
                    </Button>
                  </HStack>
                </VStack>
              </Card.Root>
            ))}
          </Grid>
        )}

        {/* Engineer Details Modal */}
        {selectedEngineer && (
          <>
            {/* Backdrop */}
            <Box
              position="fixed"
              inset={0}
              bg="blackAlpha.600"
              zIndex={999}
              onClick={closeEngineerModal}
            />

            {/* Modal */}
            <Box
              position="fixed"
              top={{ base: '20px', md: '50%' }}
              left={{ base: '20px', md: '50%' }}
              right={{ base: '20px', md: 'auto' }}
              transform={{ base: 'none', md: 'translate(-50%, -50%)' }}
              bg="white"
              borderRadius="lg"
              shadow="2xl"
              zIndex={1000}
              w={{ base: 'auto', md: '600px' }}
              maxH={{ base: 'calc(100vh - 40px)', md: '80vh' }}
              overflowY="auto"
              p={{ base: 5, md: 6 }}
            >
              <VStack align="stretch" gap={4}>
                {/* Header */}
                <HStack
                  justify="space-between"
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  pb={4}
                >
                  <VStack align="start" gap={1}>
                    <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold">
                      Engineer Details
                    </Text>
                    <Badge
                      colorScheme={selectedEngineer.isActive ? 'green' : 'red'}
                      fontSize="sm"
                    >
                      {selectedEngineer.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </VStack>
                  <Box
                    as="button"
                    onClick={closeEngineerModal}
                    cursor="pointer"
                    fontSize="24px"
                    color="gray.500"
                    _hover={{ color: 'gray.700' }}
                  >
                    ✕
                  </Box>
                </HStack>

                {/* Content */}
                <VStack align="stretch" gap={4} pt={2}>
                  {/* Full Name */}
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Full Name
                    </Text>
                    <Text fontSize="md" fontWeight="medium">
                      {selectedEngineer.fullName}
                    </Text>
                  </Box>

                  {/* Email */}
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Email Address
                    </Text>
                    <HStack gap={2}>
                      <Text fontSize="sm">📧</Text>
                      <Text fontSize="md" wordBreak="break-all">
                        {selectedEngineer.email}
                      </Text>
                    </HStack>
                  </Box>

                  {/* Slack User ID */}
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Slack User ID
                    </Text>
                    <HStack gap={2}>
                      <Text fontSize="sm">💬</Text>
                      <Text fontSize="md">
                        {selectedEngineer.slackUserId || 'Not provided'}
                      </Text>
                    </HStack>
                  </Box>

                  {/* Leave Information */}
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Paid Leave Information
                    </Text>
                    <Box
                      p={3}
                      bg="purple.50"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="purple.200"
                    >
                      <VStack align="stretch" gap={2}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.700">
                            🏖️ Annual Allowance:
                          </Text>
                          <Text fontSize="sm" fontWeight="bold">
                            {selectedEngineer.annualPaidLeaveAllowance || 0}{' '}
                            days
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.700">
                            📅 Used This Year:
                          </Text>
                          <Text fontSize="sm" fontWeight="bold">
                            {selectedEngineer.paidLeaveUsedThisYear || 0} days
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.700">
                            ✅ Remaining:
                          </Text>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="green.600"
                          >
                            {(selectedEngineer.annualPaidLeaveAllowance || 0) -
                              (selectedEngineer.paidLeaveUsedThisYear ||
                                0)}{' '}
                            days
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>
                  </Box>

                  {/* Account Status */}
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Account Status
                    </Text>
                    <VStack align="stretch" gap={2}>
                      <HStack>
                        <Text fontSize="sm" color="gray.700">
                          First Login:
                        </Text>
                        <Badge
                          colorScheme={
                            selectedEngineer.isFirstLogin ? 'orange' : 'green'
                          }
                        >
                          {selectedEngineer.isFirstLogin
                            ? 'Pending'
                            : 'Completed'}
                        </Badge>
                      </HStack>
                      <HStack>
                        <Text fontSize="sm" color="gray.700">
                          Password Reset Required:
                        </Text>
                        <Badge
                          colorScheme={
                            selectedEngineer.mustResetPassword ? 'red' : 'green'
                          }
                        >
                          {selectedEngineer.mustResetPassword ? 'Yes' : 'No'}
                        </Badge>
                      </HStack>
                    </VStack>
                  </Box>

                  {/* Last Login */}
                  {selectedEngineer.lastLoginAt && (
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        Last Login
                      </Text>
                      <HStack gap={2}>
                        <Text fontSize="sm">🕐</Text>
                        <Text fontSize="sm">
                          {formatDate(selectedEngineer.lastLoginAt)}
                        </Text>
                      </HStack>
                    </Box>
                  )}

                  {/* Timestamps */}
                  <Box pt={4} borderTop="1px solid" borderColor="gray.200">
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          Created At
                        </Text>
                        <Text fontSize="sm">
                          {formatDate(selectedEngineer.createdAt)}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          Last Updated
                        </Text>
                        <Text fontSize="sm">
                          {formatDate(selectedEngineer.updatedAt)}
                        </Text>
                      </Box>
                    </Grid>
                  </Box>

                  {/* Engineer ID */}
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Engineer ID
                    </Text>
                    <Text fontSize="xs" fontFamily="mono" color="gray.600">
                      {selectedEngineer.id}
                    </Text>
                  </Box>
                </VStack>

                {/* Footer */}
                <HStack
                  justify="flex-end"
                  pt={4}
                  borderTop="1px solid"
                  borderColor="gray.200"
                >
                  <Button
                    onClick={closeEngineerModal}
                    colorScheme="blue"
                    size={{ base: 'md', md: 'lg' }}
                  >
                    Close
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </>
        )}
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
