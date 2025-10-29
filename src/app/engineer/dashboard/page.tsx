'use client';

import { useState, useEffect, useContext, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import {
  Box,
  Grid,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  Spinner,
} from '@chakra-ui/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { engineerNavigation } from '@/shared/config/navigation';
import { AuthContext } from '@/context/AuthContext';
import {
  dashboardService,
  DashboardStats,
  RecentActivity,
} from '@/shared/service/dashboardService';
import { getUserCacheKey, CACHE_KEYS } from '@/shared/utils/cache';
import {
  LuBot,
  LuCalendarCheck,
  LuFileText,
  LuFolderOpen,
  LuClock,
  LuClipboardList,
  LuBriefcase,
} from 'react-icons/lu';
import { ChatbotModal } from '@/components/chatbot/ChatbotModal';
import { SlackConnectionCard } from '@/components/slack/SlackConnectionCard';
import { SlackConnectionModal } from '@/components/slack/SlackConnectionModal';

// Cache duration: 2 minutes
const CACHE_DURATION = 2 * 60 * 1000;

function EngineerDashboardContent() {
  const { user } = useContext(AuthContext);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const lastFetchTime = useRef<number>(0);
  const isFetching = useRef<boolean>(false);
  const { t } = useTranslation('engineer');

  // Slack integration state
  const [slackModalOpen, setSlackModalOpen] = useState(false);
  const [slackModalStatus, setSlackModalStatus] = useState<
    'success' | 'linking_required' | 'error' | null
  >(null);
  const [slackModalMessage, setSlackModalMessage] = useState('');
  const [slackTeamName, setSlackTeamName] = useState('');

  // Get current month in YYYY-MM format
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Handle Slack OAuth callback
  useEffect(() => {
    const slackOAuth = searchParams.get('slack_oauth');

    if (slackOAuth) {
      // Clean URL immediately
      // const cleanUrl = window.location.pathname;
      // window.history.replaceState({}, '', cleanUrl);

      switch (slackOAuth) {
        case 'success':
          setSlackModalStatus('success');
          setSlackModalMessage('');
          setSlackModalOpen(true);
          break;

        case 'linking_required':
          const teamName = searchParams.get('team_name') || 'Your workspace';
          setSlackModalStatus('linking_required');
          setSlackTeamName(teamName);
          setSlackModalOpen(true);
          break;

        case 'error':
          const errorMessage =
            searchParams.get('error_message') || 'Unknown error occurred';
          setSlackModalStatus('error');
          setSlackModalMessage(errorMessage);
          setSlackModalOpen(true);
          break;
      }
    }
  }, [searchParams]);

  useEffect(() => {
    // Don't try to load cache if no user is logged in
    if (!user?.id) {
      setLoading(false);
      return;
    }

    // Try to load cached data from localStorage first (user-specific)
    const cacheKey = getUserCacheKey(CACHE_KEYS.DASHBOARD, user.id);
    const cacheTimeKey = getUserCacheKey(CACHE_KEYS.DASHBOARD_TIME, user.id);
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);

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
  }, [user?.id]);

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

      // Cache data in localStorage (user-specific)
      if (user?.id) {
        const cacheKey = getUserCacheKey(CACHE_KEYS.DASHBOARD, user.id);
        const cacheTimeKey = getUserCacheKey(
          CACHE_KEYS.DASHBOARD_TIME,
          user.id
        );
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            stats: statsResponse.data,
            recentActivities: activitiesResponse.data || [],
            activeProjectsCount: projectsResponse.data?.length || 0,
          })
        );
        localStorage.setItem(cacheTimeKey, Date.now().toString());
      }
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || t('dashboard.error_loading'));
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
      pageTitle={t('dashboard.title')}
      pageSubtitle={t('dashboard.page_subtitle', {
        name: user?.fullName || 'Engineer',
      })}
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
                {t('dashboard.hours_this_month')}
              </Text>
              <LuClock size={24} color="#3182CE" />
            </HStack>
            <VStack align="start" gap={1} w="full" minH="56px">
              <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold">
                {loading
                  ? t('dashboard.loading')
                  : `${actualHours}/${expectedHours} ${t('dashboard.hours')}`}
              </Text>
              {stats?.settlementRangeMin && stats?.settlementRangeMax && (
                <Text fontSize="xs" color="gray.500">
                  {t('dashboard.range')} {stats.settlementRangeMin}-
                  {stats.settlementRangeMax} {t('dashboard.hours')}
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
                {t('dashboard.attendance_rate')}
              </Text>
              <LuClipboardList size={24} color="#3182CE" />
            </HStack>
            <VStack align="start" gap={1} w="full" minH="56px">
              <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold">
                {loading ? 'Loading...' : `${attendanceRate}%`}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {t('dashboard.this_month')}
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
                {t('dashboard.active_projects')}
              </Text>
              <LuBriefcase size={24} color="#3182CE" />
            </HStack>
            <Box minH="56px" display="flex" alignItems="start">
              <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold">
                {loading
                  ? t('dashboard.loading')
                  : `${activeProjectsCount} ${activeProjectsCount !== 1 ? t('dashboard.projects') : t('dashboard.project')}`}
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

      {/* Slack Integration Card */}
      <Box mb={{ base: 4, md: 6 }}>
        <SlackConnectionCard />
      </Box>

      {/* Recent Activities & Quick Actions - Responsive Grid */}
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
              {t('dashboard.recent_activities')}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {t('dashboard.latest_entries')}
            </Text>

            {loading ? (
              <Text fontSize="sm" color="gray.500">
                {t('dashboard.loading_activities')}
              </Text>
            ) : error ? (
              <Text fontSize="sm" color="red.500">
                {error}
              </Text>
            ) : recentActivities.length === 0 ? (
              <Text fontSize="sm" color="gray.500">
                {t('dashboard.no_activities')}
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

        {/* Quick Actions */}
        <Card.Root
          p={{ base: 4, md: 6 }}
          bg="gradient-to-r from-blue.50 to-purple.50"
        >
          <VStack align="stretch" gap={4}>
            <VStack align="start" gap={0}>
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                fontWeight="bold"
                color="gray.800"
              >
                ⚡ Quick Actions
              </Text>
              <Text fontSize="xs" color="gray.600">
                Frequently used features
              </Text>
            </VStack>

            <Grid templateColumns="repeat(2, 1fr)" gap={3}>
              <Button
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={() => router.push('/engineer/attendance')}
                h="70px"
                flexDirection="column"
                gap={2}
                _hover={{
                  bg: 'blue.50',
                  transform: 'translateY(-2px)',
                  shadow: 'md',
                }}
                transition="all 0.2s"
              >
                <LuCalendarCheck size={20} />
                <Text fontSize="xs" fontWeight="medium" textAlign="center">
                  Mark Attendance
                </Text>
              </Button>

              <Button
                size="sm"
                colorScheme="green"
                variant="outline"
                onClick={() => router.push('/engineer/reports/view')}
                h="70px"
                flexDirection="column"
                gap={2}
                _hover={{
                  bg: 'green.50',
                  transform: 'translateY(-2px)',
                  shadow: 'md',
                }}
                transition="all 0.2s"
              >
                <LuFileText size={20} />
                <Text fontSize="xs" fontWeight="medium" textAlign="center">
                  View Records
                </Text>
              </Button>

              <Button
                size="sm"
                colorScheme="purple"
                variant="outline"
                onClick={() => router.push('/engineer/reports/update')}
                h="70px"
                flexDirection="column"
                gap={2}
                _hover={{
                  bg: 'purple.50',
                  transform: 'translateY(-2px)',
                  shadow: 'md',
                }}
                transition="all 0.2s"
              >
                <LuClock size={20} />
                <Text fontSize="xs" fontWeight="medium" textAlign="center">
                  Update Reports
                </Text>
              </Button>

              <Button
                size="sm"
                colorScheme="orange"
                variant="outline"
                onClick={() => router.push('/engineer/projects')}
                h="70px"
                flexDirection="column"
                gap={2}
                _hover={{
                  bg: 'orange.50',
                  transform: 'translateY(-2px)',
                  shadow: 'md',
                }}
                transition="all 0.2s"
              >
                <LuFolderOpen size={20} />
                <Text fontSize="xs" fontWeight="medium" textAlign="center">
                  My Projects
                </Text>
              </Button>
            </Grid>
          </VStack>
        </Card.Root>
      </Grid>

      {/* Floating Chatbot Button */}
      <Box
        position="fixed"
        bottom={{ base: '20px', md: '30px' }}
        right={{ base: '20px', md: '30px' }}
        zIndex={999}
      >
        <VStack align="end" gap={2}>
          {/* Tooltip Text */}
          <Box
            bg="white"
            color="gray.700"
            px={3}
            py={2}
            borderRadius="lg"
            boxShadow="lg"
            border="1px solid"
            borderColor="gray.200"
            fontSize="sm"
            fontWeight="medium"
            opacity={0.9}
            _hover={{ opacity: 1 }}
            transition="all 0.2s"
            whiteSpace="nowrap"
          >
            💬 {t('dashboard.ask_ai')}
          </Box>

          {/* Chatbot Button */}
          <Button
            colorScheme="blue"
            size="lg"
            borderRadius="full"
            w="60px"
            h="60px"
            boxShadow="2xl"
            onClick={() => setIsChatbotOpen(true)}
            _hover={{
              transform: 'scale(1.1)',
              boxShadow: '3xl',
            }}
            transition="all 0.2s"
            title={t('dashboard.ask_ai')}
          >
            <LuBot size={28} />
          </Button>
        </VStack>
      </Box>

      {/* Chatbot Modal */}
      <ChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />

      {/* Slack Connection Modal */}
      <SlackConnectionModal
        isOpen={slackModalOpen}
        onClose={() => {
          setSlackModalOpen(false);
          // Clean URL when modal closes
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        }}
        status={slackModalStatus}
        message={slackModalMessage}
        teamName={slackTeamName}
        autoRedirect={true}
      />
    </DashboardLayout>
  );
}

export default function EngineerDashboard() {
  return (
    <Suspense
      fallback={
        <Box
          minH="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner size="xl" color="blue.500" />
        </Box>
      }
    >
      <EngineerDashboardContent />
    </Suspense>
  );
}
