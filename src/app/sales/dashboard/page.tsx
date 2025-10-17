'use client';

import { useState, useEffect, useContext, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { AuthContext } from '@/context/AuthContext';
import {
  salesService,
  DashboardStats,
  PendingReport,
  EngineerWithAssignment,
} from '@/shared/service/salesService';
import { toaster } from '@/components/ui/toaster';
import {
  LuUsers,
  LuFolderOpen,
  LuUserCog,
  LuFileText,
  LuBell,
} from 'react-icons/lu';

export default function SalesDashboard() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);
  const [engineers, setEngineers] = useState<EngineerWithAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const isFetching = useRef(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (user && !hasFetched.current) {
      hasFetched.current = true;
      fetchDashboardData();
    }
  }, [user]);

  const handleNewClient = () => router.push('/sales/clients');
  const handleNewProject = () => router.push('/sales/projects');
  const handleAssignEngineer = () => router.push('/sales/assignments');
  const handleGenerateReport = () => router.push('/sales/reports');

  const fetchDashboardData = async () => {
    if (isFetching.current) return;

    try {
      isFetching.current = true;
      setLoading(true);

      const [statsRes, reportsRes, engineersRes] = await Promise.allSettled([
        salesService.getDashboardStats(),
        salesService.getPendingReports(),
        salesService.getEngineersWithAssignments(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setStats(statsRes.value.data);
      }

      if (reportsRes.status === 'fulfilled' && reportsRes.value.success) {
        setPendingReports(reportsRes.value.data || []);
      }

      if (engineersRes.status === 'fulfilled' && engineersRes.value.success) {
        setEngineers(engineersRes.value.data || []);
      }
    } catch {
      toaster.create({
        title: 'Error',
        description: 'Failed to load dashboard data',
        type: 'error',
      });
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  const handleSendReminder = async (
    engineerId: string,
    engineerName: string
  ) => {
    console.log('Send reminder to:', engineerId, engineerName);
    toaster.create({
      title: 'Coming Soon',
      description: 'Reminder feature will be available soon',
      type: 'info',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'green';
      case 'Partial':
        return 'orange';
      case 'Missing':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getUserInitials = () => {
    if (!user?.fullName) return 'SU';
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.fullName.slice(0, 2).toUpperCase();
  };

  const filteredEngineers = engineers.filter(
    (eng) =>
      eng.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eng.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eng.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <FeatureErrorBoundary featureName="Sales Dashboard">
      <DashboardLayout
        navigation={salesNavigation}
        pageTitle="Sales Dashboard"
        pageSubtitle="Manage engineer assignments and track attendance"
        userName={user?.fullName || 'Sales User'}
        userInitials={getUserInitials()}
        notificationCount={pendingReports.length}
      >
        {/* Stats Cards - Responsive Grid */}
        <Grid
          templateColumns={{
            base: '1fr', // Mobile: 1 column
            sm: 'repeat(2, 1fr)', // Small: 2 columns
            lg: 'repeat(4, 1fr)', // Large: 4 columns
          }}
          gap={{ base: 3, md: 4 }}
          mb={{ base: 4, md: 5 }}
        >
          {/* Total Clients */}
          <Card.Root bg="white" borderWidth="1px" borderColor="gray.200">
            <Card.Body p={{ base: 3, md: 4 }}>
              <HStack justify="space-between" mb={2}>
                <Text
                  fontSize={{ base: '2xs', md: 'xs' }}
                  color="gray.600"
                  fontWeight="medium"
                >
                  Total Clients
                </Text>
                <Box color="purple.500">
                  <LuUsers size={18} />
                </Box>
              </HStack>
              <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
                mb={1}
              >
                {loading ? '...' : stats?.totalClients || 0}
              </Text>
              {stats?.newClientsThisMonth ? (
                <Text
                  fontSize={{ base: '2xs', md: 'xs' }}
                  color="green.600"
                  fontWeight="medium"
                >
                  +{stats.newClientsThisMonth} this month
                </Text>
              ) : (
                <Text fontSize={{ base: '2xs', md: 'xs' }} color="gray.400">
                  No new clients
                </Text>
              )}
            </Card.Body>
          </Card.Root>

          {/* Active Projects */}
          <Card.Root bg="white" borderWidth="1px" borderColor="gray.200">
            <Card.Body p={{ base: 3, md: 4 }}>
              <HStack justify="space-between" mb={2}>
                <Text
                  fontSize={{ base: '2xs', md: 'xs' }}
                  color="gray.600"
                  fontWeight="medium"
                >
                  Active Projects
                </Text>
                <Box color="orange.500">
                  <LuFolderOpen size={18} />
                </Box>
              </HStack>
              <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
                mb={1}
              >
                {loading ? '...' : stats?.activeProjects || 0}
              </Text>
              {stats?.projectsEndingSoon ? (
                <Text
                  fontSize={{ base: '2xs', md: 'xs' }}
                  color="orange.600"
                  fontWeight="medium"
                >
                  {stats.projectsEndingSoon} ending soon
                </Text>
              ) : (
                <Text fontSize={{ base: '2xs', md: 'xs' }} color="gray.400">
                  All stable
                </Text>
              )}
            </Card.Body>
          </Card.Root>

          {/* Total Engineers */}
          <Card.Root bg="white" borderWidth="1px" borderColor="gray.200">
            <Card.Body p={{ base: 3, md: 4 }}>
              <HStack justify="space-between" mb={2}>
                <Text
                  fontSize={{ base: '2xs', md: 'xs' }}
                  color="gray.600"
                  fontWeight="medium"
                >
                  Total Engineers
                </Text>
                <Box color="blue.500">
                  <LuUserCog size={18} />
                </Box>
              </HStack>
              <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
                mb={1}
              >
                {loading ? '...' : stats?.totalEngineers || 0}
              </Text>
              <Text
                fontSize={{ base: '2xs', md: 'xs' }}
                color="blue.600"
                fontWeight="medium"
              >
                {stats?.availableEngineers || 0} available
              </Text>
            </Card.Body>
          </Card.Root>

          {/* Pending Reports */}
          <Card.Root bg="white" borderWidth="1px" borderColor="gray.200">
            <Card.Body p={{ base: 3, md: 4 }}>
              <HStack justify="space-between" mb={2}>
                <Text
                  fontSize={{ base: '2xs', md: 'xs' }}
                  color="gray.600"
                  fontWeight="medium"
                >
                  Pending Reports
                </Text>
                <Box color="green.500">
                  <LuFileText size={18} />
                </Box>
              </HStack>
              <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
                mb={1}
              >
                {loading ? '...' : stats?.pendingReports || 0}
              </Text>
              <Text fontSize={{ base: '2xs', md: 'xs' }} color="gray.500">
                awaiting approval
              </Text>
            </Card.Body>
          </Card.Root>
        </Grid>

        {/* Engineer Assignments - Responsive */}
        <Card.Root>
          <Card.Body p={{ base: 3, md: 6 }}>
            <VStack align="start" gap={4} w="full">
              {/* Header - Stack on Mobile */}
              <VStack
                align="start"
                justify="space-between"
                w="full"
                gap={{ base: 2, md: 0 }}
              >
                <Text
                  fontSize={{ base: 'md', md: 'lg' }}
                  fontWeight="bold"
                  w="full"
                >
                  Manage engineer assignments and track attendance
                </Text>
                <Text
                  fontSize={{ base: '2xs', md: 'sm' }}
                  color="gray.500"
                  w="full"
                >
                  Showing {filteredEngineers.length} of {engineers.length}{' '}
                  engineers
                </Text>
              </VStack>

              {/* Search Bar */}
              <Input
                placeholder="Search engineers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size={{ base: 'sm', md: 'md' }}
                fontSize={{ base: 'xs', md: 'sm' }}
              />

              {/* Table/Cards - Desktop Table, Mobile Cards */}
              {loading ? (
                <Text fontSize="sm" color="gray.500" py={4}>
                  Loading engineers...
                </Text>
              ) : filteredEngineers.length === 0 ? (
                <Text fontSize="sm" color="gray.500" py={4}>
                  No engineers found
                </Text>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <Box
                    w="full"
                    overflowX="auto"
                    display={{ base: 'none', md: 'block' }}
                  >
                    <VStack gap={2} w="full">
                      {/* Header */}
                      <Grid
                        templateColumns="2fr 2fr 1.5fr 1fr 1fr"
                        gap={4}
                        w="full"
                        p={3}
                        bg="gray.100"
                        borderRadius="md"
                        fontWeight="medium"
                        fontSize="sm"
                        color="gray.700"
                      >
                        <Text>Name</Text>
                        <Text>Project</Text>
                        <Text>Hours (Month)</Text>
                        <Text>Status</Text>
                        <Text>Actions</Text>
                      </Grid>

                      {/* Rows */}
                      {filteredEngineers.map((engineer) => (
                        <Grid
                          key={engineer.id}
                          templateColumns="2fr 2fr 1.5fr 1fr 1fr"
                          gap={4}
                          w="full"
                          p={3}
                          borderRadius="md"
                          bg="white"
                          border="1px solid"
                          borderColor="gray.200"
                          _hover={{ bg: 'gray.50' }}
                          transition="all 0.2s"
                          alignItems="center"
                        >
                          <VStack align="start" gap={0}>
                            <Text fontWeight="medium" fontSize="sm">
                              {engineer.fullName}
                            </Text>
                            <Text
                              fontSize="xs"
                              color="gray.600"
                              textDecoration="underline"
                            >
                              {engineer.email}
                            </Text>
                          </VStack>

                          <Text fontSize="sm">{engineer.projectName}</Text>

                          <Text fontSize="sm" fontWeight="medium">
                            {engineer.hoursThisMonth.toFixed(1)}h
                          </Text>

                          <Badge
                            colorScheme={getStatusColor(engineer.status)}
                            fontSize="xs"
                            w="fit-content"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            fontWeight="semibold"
                          >
                            {engineer.status}
                          </Badge>

                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() =>
                              handleSendReminder(engineer.id, engineer.fullName)
                            }
                            _hover={{ bg: 'blue.50', color: 'blue.600' }}
                            borderRadius="md"
                            color="gray.600"
                          >
                            <LuBell size={16} />
                          </Button>
                        </Grid>
                      ))}
                    </VStack>
                  </Box>

                  {/* Mobile Card View */}
                  <VStack
                    gap={3}
                    w="full"
                    display={{ base: 'flex', md: 'none' }}
                  >
                    {filteredEngineers.map((engineer) => (
                      <Card.Root
                        key={engineer.id}
                        w="full"
                        borderWidth="1px"
                        borderColor="gray.200"
                      >
                        <Card.Body p={3}>
                          <VStack align="stretch" gap={2}>
                            {/* Name and Status */}
                            <HStack justify="space-between" align="start">
                              <VStack align="start" gap={0} flex={1}>
                                <Text fontSize="sm" fontWeight="bold">
                                  {engineer.fullName}
                                </Text>
                                <Text fontSize="2xs" color="gray.600">
                                  {engineer.email}
                                </Text>
                              </VStack>
                              <Badge
                                colorScheme={getStatusColor(engineer.status)}
                                fontSize="2xs"
                              >
                                {engineer.status}
                              </Badge>
                            </HStack>

                            {/* Project */}
                            <HStack justify="space-between">
                              <Text fontSize="2xs" color="gray.500">
                                Project
                              </Text>
                              <Text fontSize="xs" fontWeight="medium">
                                {engineer.projectName}
                              </Text>
                            </HStack>

                            {/* Hours */}
                            <HStack justify="space-between">
                              <Text fontSize="2xs" color="gray.500">
                                Hours (Month)
                              </Text>
                              <Text fontSize="xs" fontWeight="bold">
                                {engineer.hoursThisMonth.toFixed(1)}h
                              </Text>
                            </HStack>

                            {/* Actions */}
                            <Button
                              size="xs"
                              variant="outline"
                              colorScheme="blue"
                              w="full"
                              mt={1}
                              onClick={() =>
                                handleSendReminder(
                                  engineer.id,
                                  engineer.fullName
                                )
                              }
                            >
                              <LuBell size={14} />
                              <Text ml={1} fontSize="2xs">
                                Send Reminder
                              </Text>
                            </Button>
                          </VStack>
                        </Card.Body>
                      </Card.Root>
                    ))}
                  </VStack>
                </>
              )}

              {/* Legend - Responsive */}
              <HStack
                gap={{ base: 2, md: 4 }}
                fontSize="xs"
                p={3}
                bg="gray.50"
                borderRadius="md"
                flexWrap="wrap"
              >
                <Text
                  fontSize={{ base: '2xs', md: 'xs' }}
                  fontWeight="medium"
                  color="gray.700"
                >
                  Status:
                </Text>
                <HStack gap={1}>
                  <Badge colorScheme="green" fontSize="2xs" borderRadius="full">
                    Complete
                  </Badge>
                  <Text fontSize="2xs" color="gray.600">
                    {engineers.filter((e) => e.status === 'Complete').length}
                  </Text>
                </HStack>
                <HStack gap={1}>
                  <Badge
                    colorScheme="orange"
                    fontSize="2xs"
                    borderRadius="full"
                  >
                    Partial
                  </Badge>
                  <Text fontSize="2xs" color="gray.600">
                    {engineers.filter((e) => e.status === 'Partial').length}
                  </Text>
                </HStack>
                <HStack gap={1}>
                  <Badge colorScheme="red" fontSize="2xs" borderRadius="full">
                    Missing
                  </Badge>
                  <Text fontSize="2xs" color="gray.600">
                    {engineers.filter((e) => e.status === 'Missing').length}
                  </Text>
                </HStack>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Quick Actions - Responsive */}
        <Card.Root mt={{ base: 3, md: 5 }}>
          <Card.Body p={{ base: 3, md: 6 }}>
            <VStack alignItems="start" gap={{ base: 2, md: 4 }}>
              <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold">
                Quick Actions
              </Text>
              <Grid
                templateColumns={{
                  base: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                }}
                gap={2}
                w="full"
              >
                <Button
                  colorScheme="blue"
                  size={{ base: 'sm', md: 'md' }}
                  onClick={handleNewClient}
                  fontSize={{ base: '2xs', md: 'sm' }}
                >
                  New Client
                </Button>
                <Button
                  colorScheme="blue"
                  size={{ base: 'sm', md: 'md' }}
                  onClick={handleNewProject}
                  fontSize={{ base: '2xs', md: 'sm' }}
                >
                  New Project
                </Button>
                <Button
                  colorScheme="blue"
                  size={{ base: 'sm', md: 'md' }}
                  onClick={handleAssignEngineer}
                  fontSize={{ base: '2xs', md: 'sm' }}
                >
                  Assign Engineer
                </Button>
                <Button
                  colorScheme="blue"
                  size={{ base: 'sm', md: 'md' }}
                  onClick={handleGenerateReport}
                  fontSize={{ base: '2xs', md: 'sm' }}
                >
                  Generate Report
                </Button>
              </Grid>
            </VStack>
          </Card.Body>
        </Card.Root>
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
