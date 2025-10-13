'use client';

import { useState, useEffect, useContext, useRef } from 'react';
import { Box, Grid, Text, VStack, HStack, Card } from '@chakra-ui/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { engineerNavigation } from '@/shared/config/navigation';
import { AuthContext } from '@/context/AuthContext';
import {
  dashboardService,
  DashboardStats,
  RecentActivity,
} from '@/shared/service/dashboardService';

// Cache duration: 2 minutes
const CACHE_DURATION = 2 * 60 * 1000;

export default function EngineerDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const lastFetchTime = useRef<number>(0);
  const isFetching = useRef<boolean>(false);

  // Get current month in YYYY-MM format
  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    // Try to load cached data from localStorage first
    const cachedData = localStorage.getItem('dashboardCache');
    const cachedTime = localStorage.getItem('dashboardCacheTime');

    if (cachedData && cachedTime) {
      const timeSinceCache = Date.now() - parseInt(cachedTime);

      if (timeSinceCache < CACHE_DURATION) {
        // Use cached data
        const parsed = JSON.parse(cachedData);
        setStats(parsed.stats);
        setRecentActivities(parsed.recentActivities || []);
        setActiveProjectsCount(parsed.activeProjectsCount || 0);
        lastFetchTime.current = parseInt(cachedTime);
        setLoading(false);
        return;
      }
    }

    // No valid cache, fetch fresh data
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async (forceRefresh = false) => {
    // Check if data is still fresh (within cache duration)
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime.current;

    if (!forceRefresh && timeSinceLastFetch < CACHE_DURATION && stats) {
      // Data is still fresh, no need to fetch
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous fetches
    if (isFetching.current) {
      return;
    }

    try {
      isFetching.current = true;
      setLoading(true);
      setError('');

      // Fetch all dashboard data in parallel
      const [statsResponse, activitiesResponse, projectsResponse] =
        await Promise.all([
          dashboardService.getStats(currentMonth),
          dashboardService.getRecentActivities(3),
          dashboardService.getActiveProjects(),
        ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (activitiesResponse.success) {
        setRecentActivities(activitiesResponse.data || []);
      }

      if (projectsResponse.success) {
        setActiveProjectsCount(projectsResponse.data?.length || 0);
      }

      // Update last fetch time
      lastFetchTime.current = Date.now();

      // Cache data in localStorage
      localStorage.setItem(
        'dashboardCache',
        JSON.stringify({
          stats: statsResponse.data,
          recentActivities: activitiesResponse.data || [],
          activeProjectsCount: projectsResponse.data?.length || 0,
        })
      );
      localStorage.setItem('dashboardCacheTime', Date.now().toString());
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  // Calculate total working days in the current month (excluding weekends)
  const getWorkingDaysInMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    let workingDays = 0;

    for (let day = 1; day <= lastDay; day++) {
      const currentDate = new Date(year, month - 1, day);
      const dayOfWeek = currentDate.getDay();
      // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }
    return workingDays;
  };

  const totalWorkingDays = getWorkingDaysInMonth();

  // Calculate attendance rate percentage (present + paid leave / total working days)
  const attendanceRate = stats
    ? totalWorkingDays > 0
      ? Math.round(
          ((stats.presentDays + stats.paidLeaveDays) / totalWorkingDays) * 100
        )
      : 0
    : 0;

  // Use settlement hours and expected hours from backend
  const actualHours = stats?.totalSettlementHours || 0;
  const expectedHours = stats?.expectedHours || totalWorkingDays * 8;
  const hoursPercentage =
    expectedHours > 0 ? Math.round((actualHours / expectedHours) * 100) : 0;

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate work hours from time strings
  const calculateWorkHours = (
    startTime: string | null,
    endTime: string | null,
    breakHours: string
  ) => {
    if (!startTime || !endTime) return 0;

    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const breaks = parseFloat(breakHours) || 0;

    return Math.max(0, diffHours - breaks);
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user?.fullName) return 'U';
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.fullName.slice(0, 2).toUpperCase();
  };
  return (
    <DashboardLayout
      navigation={engineerNavigation}
      pageTitle="Dashboard"
      pageSubtitle={`Welcome back, ${user?.fullName || 'Engineer'}`}
      userName={user?.fullName || 'Engineer'}
      userInitials={getUserInitials()}
      notificationCount={0}
    >
      {/* Stats Cards - Responsive Grid */}
      <Grid
        templateColumns={{
          base: '1fr', // Mobile: 1 column
          md: 'repeat(2, 1fr)', // Tablet: 2 columns
          lg: 'repeat(3, 1fr)', // Desktop: 3 columns
        }}
        gap={{ base: 4, md: 6 }}
        mb={{ base: 4, md: 6 }}
      >
        {/* Hours This Month */}
        <Card.Root p={{ base: 4, md: 6 }}>
          <VStack align="start" gap={4}>
            <HStack justify="space-between" w="full">
              <Text fontSize="sm" color="gray.600">
                Hours This Month
              </Text>
              <Text fontSize={{ base: '20px', md: '24px' }}>🕐</Text>
            </HStack>
            <VStack align="start" gap={1} w="full" minH="56px">
              <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold">
                {loading
                  ? 'Loading...'
                  : `${actualHours}/${expectedHours} hours`}
              </Text>
              {stats?.settlementRangeMin && stats?.settlementRangeMax && (
                <Text fontSize="xs" color="gray.500">
                  Range: {stats.settlementRangeMin}-{stats.settlementRangeMax}{' '}
                  hours
                </Text>
              )}
            </VStack>
            <Box w="full" bg="gray.200" borderRadius="full" h="8px">
              <Box
                bg="blue.500"
                h="8px"
                borderRadius="full"
                w={`${Math.min(hoursPercentage, 100)}%`}
                transition="width 0.3s"
              />
            </Box>
          </VStack>
        </Card.Root>

        {/* Attendance Rate */}
        <Card.Root p={{ base: 4, md: 6 }}>
          <VStack align="start" gap={4}>
            <HStack justify="space-between" w="full">
              <Text fontSize="sm" color="gray.600">
                Attendance Rate
              </Text>
              <Text fontSize={{ base: '20px', md: '24px' }}>📋</Text>
            </HStack>
            <VStack align="start" gap={1} w="full" minH="56px">
              <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold">
                {loading ? 'Loading...' : `${attendanceRate}%`}
              </Text>
              <Text fontSize="xs" color="gray.500">
                This month
              </Text>
            </VStack>
            <Box w="full" bg="gray.200" borderRadius="full" h="8px">
              <Box
                bg="blue.500"
                h="8px"
                borderRadius="full"
                w={`${attendanceRate}%`}
                transition="width 0.3s"
              />
            </Box>
          </VStack>
        </Card.Root>

        {/* Active Projects */}
        <Card.Root p={{ base: 4, md: 6 }}>
          <VStack align="start" gap={4}>
            <HStack justify="space-between" w="full">
              <Text fontSize="sm" color="gray.600">
                Active Projects
              </Text>
              <Text fontSize={{ base: '20px', md: '24px' }}>💼</Text>
            </HStack>
            <Box minH="56px" display="flex" alignItems="start">
              <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold">
                {loading
                  ? 'Loading...'
                  : `${activeProjectsCount} Project${activeProjectsCount !== 1 ? 's' : ''}`}
              </Text>
            </Box>
            <Box w="full" bg="gray.200" borderRadius="full" h="8px">
              <Box
                bg="blue.500"
                h="8px"
                borderRadius="full"
                w="100%"
                transition="width 0.3s"
              />
            </Box>
          </VStack>
        </Card.Root>
      </Grid>

      {/* Recent Activities & Upcoming Tasks - Responsive Grid */}
      <Grid
        templateColumns={{
          base: '1fr', // Mobile: Stacked
          lg: '1.5fr 1fr', // Desktop: Side by side
        }}
        gap={{ base: 4, md: 6 }}
      >
        {/* Recent Activities */}
        <Card.Root p={{ base: 4, md: 6 }}>
          <VStack align="start" gap={4}>
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold">
              Recent Activities
            </Text>
            <Text fontSize="sm" color="gray.500">
              Your latest attendance entries
            </Text>

            {loading ? (
              <Text fontSize="sm" color="gray.500">
                Loading activities...
              </Text>
            ) : error ? (
              <Text fontSize="sm" color="red.500">
                {error}
              </Text>
            ) : recentActivities.length === 0 ? (
              <Text fontSize="sm" color="gray.500">
                No recent activities found
              </Text>
            ) : (
              <VStack gap={3} w="full" mt={2}>
                {recentActivities.map((activity) => {
                  const hours = calculateWorkHours(
                    activity.startTime,
                    activity.endTime,
                    activity.breakHours
                  );
                  return (
                    <Box
                      key={activity.id}
                      w="full"
                      p={{ base: 3, md: 4 }}
                      borderRadius="md"
                      bg="gray.50"
                      _hover={{ bg: 'gray.100' }}
                      transition="all 0.2s"
                    >
                      {/* Mobile Layout: Stacked */}
                      <VStack
                        align="start"
                        gap={2}
                        w="full"
                        display={{ base: 'flex', md: 'none' }}
                      >
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="medium" fontSize="sm">
                            {activity.projectAssignment.project.projectName}
                          </Text>
                          <Box
                            px={3}
                            py={1}
                            borderRadius="full"
                            bg={
                              activity.attendanceType === 'PRESENT'
                                ? 'blue.500'
                                : activity.attendanceType === 'PAID_LEAVE'
                                  ? 'green.500'
                                  : 'gray.500'
                            }
                            color="white"
                            fontSize="xs"
                          >
                            {activity.attendanceType}
                          </Box>
                        </HStack>
                        <HStack justify="space-between" w="full">
                          <Text fontSize="xs" color="gray.500">
                            {formatDate(activity.workDate)}
                          </Text>
                          <HStack gap={3}>
                            <Text fontSize="sm" fontWeight="medium">
                              {hours.toFixed(1)}h
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {activity.workLocation || 'N/A'}
                            </Text>
                          </HStack>
                        </HStack>
                      </VStack>

                      {/* Desktop Layout: Side by side */}
                      <HStack
                        justify="space-between"
                        display={{ base: 'none', md: 'flex' }}
                      >
                        <VStack align="start" gap={1}>
                          <Text fontWeight="medium" fontSize="sm">
                            {activity.projectAssignment.project.projectName}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {formatDate(activity.workDate)}
                          </Text>
                        </VStack>
                        <VStack align="end" gap={1}>
                          <Text fontSize="sm" fontWeight="medium">
                            {hours.toFixed(1)}h
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {activity.workLocation || 'N/A'}
                          </Text>
                        </VStack>
                        <Box
                          px={3}
                          py={1}
                          borderRadius="full"
                          bg={
                            activity.attendanceType === 'PRESENT'
                              ? 'blue.500'
                              : activity.attendanceType === 'PAID_LEAVE'
                                ? 'green.500'
                                : 'gray.500'
                          }
                          color="white"
                          fontSize="xs"
                        >
                          {activity.attendanceType}
                        </Box>
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            )}
          </VStack>
        </Card.Root>

        {/* Upcoming Tasks */}
        <Card.Root p={{ base: 4, md: 6 }}>
          <VStack align="start" gap={4}>
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold">
              Upcoming Tasks
            </Text>
            <Text fontSize="sm" color="gray.500">
              Important deadlines
            </Text>

            <VStack gap={3} w="full" mt={2}>
              {[
                {
                  task: 'Submit weekly attendance report',
                  due: 'Oct 11',
                  color: 'red',
                },
                {
                  task: 'Complete project status update',
                  due: 'Oct 12',
                  color: 'blue',
                },
                {
                  task: 'Review code changes',
                  due: 'Oct 31',
                  color: 'purple',
                },
              ].map((task, index) => (
                <HStack key={index} gap={3} w="full">
                  <Box
                    w="12px"
                    h="12px"
                    borderRadius="full"
                    bg={`${task.color}.500`}
                    flexShrink={0}
                  />
                  <VStack align="start" gap={0} flex={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      {task.task}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Due: {task.due}
                    </Text>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </Card.Root>
      </Grid>
    </DashboardLayout>
  );
}
