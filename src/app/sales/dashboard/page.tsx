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
import { AuthContext } from '@/context/AuthContext';
import {
  salesService,
  DashboardStats,
  RecentProject,
  RecentAssignment,
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
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);
  const [engineers, setEngineers] = useState<EngineerWithAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
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
      // Error already logged in service layer
      toaster.create({
        title: 'Error',
        description: 'Failed to load dashboard data',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (
    engineerId: string,
    engineerName: string
  ) => {
    // TODO: Implement reminder API endpoint in backend
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

  // Filter engineers based on search
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
        {/* Stats Cards - Top Section */}
        <Grid
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          }}
          gap={4}
          mb={5}
        >
          {/* Total Clients */}
          <Card.Root bg="white" borderWidth="1px" borderColor="gray.200">
            <Card.Body p={4}>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  Total Clients
                </Text>
                <Box color="purple.500">
                  <LuUsers size={20} />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold" mb={1}>
                {loading ? '...' : stats?.totalClients || 0}
              </Text>
              {stats?.newClientsThisMonth ? (
                <Text fontSize="xs" color="green.600" fontWeight="medium">
                  +{stats.newClientsThisMonth} this month
                </Text>
              ) : (
                <Text fontSize="xs" color="gray.400">
                  No new clients
                </Text>
              )}
            </Card.Body>
          </Card.Root>

          {/* Active Projects */}
          <Card.Root bg="white" borderWidth="1px" borderColor="gray.200">
            <Card.Body p={4}>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  Active Projects
                </Text>
                <Box color="orange.500">
                  <LuFolderOpen size={20} />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold" mb={1}>
                {loading ? '...' : stats?.activeProjects || 0}
              </Text>
              {stats?.projectsEndingSoon ? (
                <Text fontSize="xs" color="orange.600" fontWeight="medium">
                  {stats.projectsEndingSoon} ending soon
                </Text>
              ) : (
                <Text fontSize="xs" color="gray.400">
                  All stable
                </Text>
              )}
            </Card.Body>
          </Card.Root>

          {/* Total Engineers */}
          <Card.Root bg="white" borderWidth="1px" borderColor="gray.200">
            <Card.Body p={4}>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  Total Engineers
                </Text>
                <Box color="blue.500">
                  <LuUserCog size={20} />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold" mb={1}>
                {loading ? '...' : stats?.totalEngineers || 0}
              </Text>
              <Text fontSize="xs" color="blue.600" fontWeight="medium">
                {stats?.availableEngineers || 0} available
              </Text>
            </Card.Body>
          </Card.Root>

          {/* Pending Reports */}
          <Card.Root bg="white" borderWidth="1px" borderColor="gray.200">
            <Card.Body p={4}>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="xs" color="gray.600" fontWeight="medium">
                  Pending Reports
                </Text>
                <Box color="green.500">
                  <LuFileText size={20} />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold" mb={1}>
                {loading ? '...' : stats?.pendingReports || 0}
              </Text>
              <Text fontSize="xs" color="gray.500">
                awaiting approval
              </Text>
            </Card.Body>
          </Card.Root>
        </Grid>

        {/* Engineer Assignments Table - Main Focus */}
        <Card.Root>
          <Card.Body p={6}>
            <VStack align="start" gap={4} w="full">
              <HStack justify="space-between" w="full">
                <Text fontSize="lg" fontWeight="bold">
                  Manage engineer assignments and track attendance
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Showing {filteredEngineers.length} of {engineers.length}{' '}
                  engineers
                </Text>
              </HStack>

              {/* Search Bar */}
              <Input
                placeholder="Search engineers ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="md"
              />

              {/* Table */}
              {loading ? (
                <Text fontSize="sm" color="gray.500">
                  Loading engineers...
                </Text>
              ) : filteredEngineers.length === 0 ? (
                <Text fontSize="sm" color="gray.500">
                  No engineers found
                </Text>
              ) : (
                <Box w="full" overflowX="auto">
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
              )}

              {/* Legend */}
              <HStack
                gap={4}
                fontSize="xs"
                p={3}
                bg="gray.50"
                borderRadius="md"
              >
                <Text fontSize="xs" fontWeight="medium" color="gray.700">
                  Status Legend:
                </Text>
                <HStack gap={1}>
                  <Badge colorScheme="green" fontSize="xs" borderRadius="full">
                    Complete
                  </Badge>
                  <Text color="gray.600">
                    {engineers.filter((e) => e.status === 'Complete').length}
                  </Text>
                </HStack>
                <HStack gap={1}>
                  <Badge colorScheme="orange" fontSize="xs" borderRadius="full">
                    Partial
                  </Badge>
                  <Text color="gray.600">
                    {engineers.filter((e) => e.status === 'Partial').length}
                  </Text>
                </HStack>
                <HStack gap={1}>
                  <Badge colorScheme="red" fontSize="xs" borderRadius="full">
                    Missing
                  </Badge>
                  <Text color="gray.600">
                    {engineers.filter((e) => e.status === 'Missing').length}
                  </Text>
                </HStack>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Quick Actions */}
        <Card.Root>
          <Card.Body p={6}>
            <VStack align="start" gap={4}>
              <Text fontSize="lg" fontWeight="bold">
                Quick Actions
              </Text>
              <HStack gap={3} flexWrap="wrap">
                <Button colorScheme="blue" size="sm">
                  + New Client
                </Button>
                <Button colorScheme="blue" size="sm">
                  + New Project
                </Button>
                <Button colorScheme="blue" size="sm">
                  Assign Engineer
                </Button>
                <Button colorScheme="blue" size="sm">
                  Generate Report
                </Button>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
