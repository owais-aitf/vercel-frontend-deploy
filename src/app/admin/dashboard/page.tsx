'use client';

import { useState, useEffect, useContext, useRef } from 'react';
import {
  Box,
  Grid,
  Text,
  VStack,
  HStack,
  Card,
  Spinner,
  Button,
} from '@chakra-ui/react';
import {
  LuUsers,
  LuUserCog,
  LuUserCheck,
  LuFolderCheck,
  LuFolderX,
  LuBuilding2,
  LuClipboardList,
  LuTrendingUp,
  LuActivity,
  LuFileCheck,
  LuClock,
  LuBot,
} from 'react-icons/lu';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { adminNavigation } from '@/shared/config/navigation';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { AuthContext } from '@/context/AuthContext';
import adminService, {
  AdminDashboardStats,
} from '@/shared/service/adminService';
import { toaster } from '@/components/ui/toaster';
import { SalesAdminChatbotModal } from '@/components/chatbot/SalesAdminChatbotModal';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
export default function AdminDashboard() {
  // const router = useRouter();
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);
  const hasFetched = useRef(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation('admin');

  useEffect(() => {
    if (user && !hasFetched.current) {
      hasFetched.current = true;
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchDashboardData = async () => {
    if (isFetching.current) return;

    try {
      isFetching.current = true;
      setLoading(true);

      const response = await adminService.getDashboardStats();

      if (response.success) {
        setStats(response.data);
        console.log('✅ Dashboard stats loaded:', response.data);
      }
    } catch (error) {
      console.error('❌ Dashboard fetch error:', error);
      const err = error as { response?: { data?: { error?: string } } };
      toaster.create({
        title: t('dashboard.errors.title'),
        description:
          err?.response?.data?.error || t('dashboard.errors.load_failed'),
        type: 'error',
      });
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  const getUserInitials = () => {
    if (!user?.fullName) return 'AD';
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.fullName.slice(0, 2).toUpperCase();
  };

  return (
    <FeatureErrorBoundary featureName="Admin Dashboard">
      <DashboardLayout
        navigation={adminNavigation}
        pageTitle={t('dashboard.page_title')}
        pageSubtitle={t('dashboard.page_subtitle')}
        userName={user?.fullName || 'Admin User'}
        userInitials={getUserInitials()}
        notificationCount={stats?.pendingReports || 0}
      >
        {/* Loading State */}
        {loading ? (
          <Card.Root p={8}>
            <VStack gap={4}>
              <Spinner size="xl" color="blue.500" />
              <Text color="gray.600">{t('dashboard.loading')}</Text>
            </VStack>
          </Card.Root>
        ) : (
          <>
            {/* Primary Stats - User Statistics */}
            <Text fontSize="lg" fontWeight="bold" mb={3}>
              {t('dashboard.user_statistics')}
            </Text>
            <Grid
              templateColumns={{
                base: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(5, 1fr)',
              }}
              gap={{ base: 3, md: 4 }}
              mb={6}
            >
              {/* Total Users */}
              <Card.Root bg="blue.50" borderRadius="lg">
                <Card.Body p={{ base: 3, md: 4 }}>
                  <VStack align="start" gap={1}>
                    <HStack justify="space-between" w="full">
                      <Text
                        fontSize={{ base: '2xs', md: 'xs' }}
                        color="blue.700"
                        fontWeight="medium"
                      >
                        {t('dashboard.stats.total_users')}
                      </Text>
                      <Box color="blue.500">
                        <LuUsers size={18} />
                      </Box>
                    </HStack>
                    <Text
                      fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                      fontWeight="bold"
                      color="blue.600"
                    >
                      {stats?.totalUsers || 0}
                    </Text>
                  </VStack>
                </Card.Body>
              </Card.Root>

              {/* Total Engineers */}
              <Card.Root bg="purple.50" borderRadius="lg">
                <Card.Body p={{ base: 3, md: 4 }}>
                  <VStack align="start" gap={1}>
                    <HStack justify="space-between" w="full">
                      <Text
                        fontSize={{ base: '2xs', md: 'xs' }}
                        color="purple.700"
                        fontWeight="medium"
                      >
                        {t('dashboard.stats.engineers')}
                      </Text>
                      <Box color="purple.500">
                        <LuUserCog size={18} />
                      </Box>
                    </HStack>
                    <Text
                      fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                      fontWeight="bold"
                      color="purple.600"
                    >
                      {stats?.totalEngineers || 0}
                    </Text>
                  </VStack>
                </Card.Body>
              </Card.Root>

              {/* Sales Representatives */}
              <Card.Root bg="green.50" borderRadius="lg">
                <Card.Body p={{ base: 3, md: 4 }}>
                  <VStack align="start" gap={1}>
                    <HStack justify="space-between" w="full">
                      <Text
                        fontSize={{ base: '2xs', md: 'xs' }}
                        color="green.700"
                        fontWeight="medium"
                      >
                        {t('dashboard.stats.sales_reps')}
                      </Text>
                      <Box color="green.500">
                        <LuUserCheck size={18} />
                      </Box>
                    </HStack>
                    <Text
                      fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                      fontWeight="bold"
                      color="green.600"
                    >
                      {stats?.totalSalesReps || 0}
                    </Text>
                  </VStack>
                </Card.Body>
              </Card.Root>

              {/* Total Clients */}
              <Card.Root bg="orange.50" borderRadius="lg">
                <Card.Body p={{ base: 3, md: 4 }}>
                  <VStack align="start" gap={1}>
                    <HStack justify="space-between" w="full">
                      <Text
                        fontSize={{ base: '2xs', md: 'xs' }}
                        color="orange.700"
                        fontWeight="medium"
                      >
                        {t('dashboard.stats.clients')}
                      </Text>
                      <Box color="orange.500">
                        <LuBuilding2 size={18} />
                      </Box>
                    </HStack>
                    <Text
                      fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                      fontWeight="bold"
                      color="orange.600"
                    >
                      {stats?.totalClients || 0}
                    </Text>
                    <Text fontSize="2xs" color="orange.700">
                      {stats?.activeClients || 0} {t('dashboard.stats.active')}
                    </Text>
                  </VStack>
                </Card.Body>
              </Card.Root>

              {/* Active Assignments */}
              <Card.Root bg="cyan.50" borderRadius="lg">
                <Card.Body p={{ base: 3, md: 4 }}>
                  <VStack align="start" gap={1}>
                    <HStack justify="space-between" w="full">
                      <Text
                        fontSize={{ base: '2xs', md: 'xs' }}
                        color="cyan.700"
                        fontWeight="medium"
                      >
                        {t('dashboard.stats.assignments')}
                      </Text>
                      <Box color="cyan.500">
                        <LuTrendingUp size={18} />
                      </Box>
                    </HStack>
                    <Text
                      fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                      fontWeight="bold"
                      color="cyan.600"
                    >
                      {stats?.activeAssignments || 0}
                    </Text>
                    <Text fontSize="2xs" color="cyan.700">
                      {t('dashboard.stats.of_total')}{' '}
                      {stats?.totalAssignments || 0}{' '}
                      {t('dashboard.stats.total')}
                    </Text>
                  </VStack>
                </Card.Body>
              </Card.Root>
            </Grid>

            {/* Project Stats - Row 2 */}
            <Text fontSize="lg" fontWeight="bold" mb={3} mt={6}>
              {t('dashboard.project_statistics')}
            </Text>
            <Grid
              templateColumns={{
                base: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              }}
              gap={{ base: 3, md: 4 }}
              mb={6}
            >
              {/* Total Projects */}
              <Card.Root bg="indigo.50" borderRadius="lg">
                <Card.Body p={{ base: 3, md: 4 }}>
                  <VStack align="start" gap={1}>
                    <HStack justify="space-between" w="full">
                      <Text
                        fontSize={{ base: '2xs', md: 'xs' }}
                        color="indigo.700"
                        fontWeight="medium"
                      >
                        {t('dashboard.stats.total_projects')}
                      </Text>
                      <Box color="indigo.500">
                        <LuClipboardList size={18} />
                      </Box>
                    </HStack>
                    <Text
                      fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                      fontWeight="bold"
                      color="indigo.600"
                    >
                      {stats?.totalProjects || 0}
                    </Text>
                  </VStack>
                </Card.Body>
              </Card.Root>

              {/* Active Projects */}
              <Card.Root bg="green.50" borderRadius="lg">
                <Card.Body p={{ base: 3, md: 4 }}>
                  <VStack align="start" gap={1}>
                    <HStack justify="space-between" w="full">
                      <Text
                        fontSize={{ base: '2xs', md: 'xs' }}
                        color="green.700"
                        fontWeight="medium"
                      >
                        {t('dashboard.stats.active_projects')}
                      </Text>
                      <Box color="green.500">
                        <LuFolderCheck size={18} />
                      </Box>
                    </HStack>
                    <Text
                      fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                      fontWeight="bold"
                      color="green.600"
                    >
                      {stats?.activeProjects || 0}
                    </Text>
                  </VStack>
                </Card.Body>
              </Card.Root>

              {/* Inactive Projects */}
              <Card.Root bg="gray.50" borderRadius="lg">
                <Card.Body p={{ base: 3, md: 4 }}>
                  <VStack align="start" gap={1}>
                    <HStack justify="space-between" w="full">
                      <Text
                        fontSize={{ base: '2xs', md: 'xs' }}
                        color="gray.700"
                        fontWeight="medium"
                      >
                        {t('dashboard.stats.inactive_projects')}
                      </Text>
                      <Box color="gray.500">
                        <LuFolderX size={18} />
                      </Box>
                    </HStack>
                    <Text
                      fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                      fontWeight="bold"
                      color="gray.600"
                    >
                      {stats?.inactiveProjects || 0}
                    </Text>
                  </VStack>
                </Card.Body>
              </Card.Root>

              {/* Activity Rate */}
              <Card.Root bg="blue.50" borderRadius="lg">
                <Card.Body p={{ base: 3, md: 4 }}>
                  <VStack align="start" gap={1}>
                    <HStack justify="space-between" w="full">
                      <Text
                        fontSize={{ base: '2xs', md: 'xs' }}
                        color="blue.700"
                        fontWeight="medium"
                      >
                        {t('dashboard.stats.activity_rate')}
                      </Text>
                      <Box color="blue.500">
                        <LuActivity size={18} />
                      </Box>
                    </HStack>
                    <Text
                      fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                      fontWeight="bold"
                      color="blue.600"
                    >
                      {stats?.totalProjects && stats.totalProjects > 0
                        ? Math.round(
                            (stats.activeProjects / stats.totalProjects) * 100
                          )
                        : 0}
                      %
                    </Text>
                  </VStack>
                </Card.Body>
              </Card.Root>
            </Grid>

            {/* Reports & Overview - Row 3 */}
            <Text fontSize="lg" fontWeight="bold" mb={3} mt={6}>
              {t('dashboard.reports_activity')}
            </Text>
            <Grid
              templateColumns={{
                base: '1fr',
                md: 'repeat(2, 1fr)',
              }}
              gap={{ base: 3, md: 4 }}
              mb={6}
            >
              {/* Reports Card */}
              <Card.Root bg="yellow.50" borderRadius="lg">
                <Card.Body p={{ base: 4, md: 5 }}>
                  <VStack align="stretch" gap={3}>
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="bold" color="yellow.900">
                        {t('dashboard.stats.monthly_reports')}
                      </Text>
                      <Box color="yellow.500">
                        <LuFileCheck size={24} />
                      </Box>
                    </HStack>
                    <VStack align="stretch" gap={2}>
                      <HStack justify="space-between">
                        <HStack gap={2}>
                          <LuClock size={16} color="orange" />
                          <Text fontSize="xs" color="gray.600">
                            {t('dashboard.stats.pending_approval')}
                          </Text>
                        </HStack>
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color="orange.600"
                        >
                          {stats?.pendingReports || 0}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <HStack gap={2}>
                          <LuFileCheck size={16} color="green" />
                          <Text fontSize="xs" color="gray.600">
                            {t('dashboard.stats.approved')}
                          </Text>
                        </HStack>
                        <Text fontSize="lg" fontWeight="bold" color="green.600">
                          {stats?.approvedReports || 0}
                        </Text>
                      </HStack>
                      <HStack
                        justify="space-between"
                        pt={2}
                        borderTop="1px"
                        borderColor="yellow.200"
                      >
                        <Text fontSize="xs" color="gray.700" fontWeight="bold">
                          {t('dashboard.stats.total_reports')}
                        </Text>
                        <Text
                          fontSize="md"
                          fontWeight="bold"
                          color="yellow.700"
                        >
                          {stats?.totalReports || 0}
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </Card.Body>
              </Card.Root>

              {/* System Overview */}
              <Card.Root bg="white" borderWidth="1px" borderRadius="lg">
                <Card.Body p={{ base: 4, md: 5 }}>
                  <VStack align="stretch" gap={3}>
                    <Text fontSize="sm" fontWeight="bold">
                      {t('dashboard.stats.system_overview')}
                    </Text>
                    <VStack align="stretch" gap={2}>
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.600">
                          {t('dashboard.stats.active_users')}
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold">
                          {stats?.totalUsers || 0}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.600">
                          {t('dashboard.stats.active_clients')}
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold">
                          {stats?.activeClients || 0}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.600">
                          {t('dashboard.stats.running_projects')}
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold">
                          {stats?.activeProjects || 0}
                        </Text>
                      </HStack>
                      <HStack
                        justify="space-between"
                        pt={2}
                        borderTop="1px"
                        borderColor="gray.200"
                      >
                        <Text fontSize="xs" color="gray.700" fontWeight="bold">
                          {t('dashboard.stats.system_health')}
                        </Text>
                        <Text fontSize="md" fontWeight="bold" color="green.600">
                          {stats?.activeProjects && stats.activeProjects > 0
                            ? t('dashboard.stats.healthy')
                            : t('dashboard.stats.idle')}
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </Card.Body>
              </Card.Root>
            </Grid>

            {/* Quick Actions
            <Card.Root mt={6}>
              <Card.Body p={{ base: 4, md: 6 }}>
                <VStack alignItems="start" gap={{ base: 3, md: 4 }}>
                  <Text fontSize="lg" fontWeight="bold">
                    Quick Actions
                  </Text>
                  <Grid
                    templateColumns={{
                      base: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(4, 1fr)',
                    }}
                    gap={3}
                    w="full"
                  >
                    <Button
                      colorScheme="blue"
                      size={{ base: 'sm', md: 'md' }}
                      onClick={handleManageUsers}
                    >
                      <HStack gap={2}>
                        <LuUsers size={18} />
                        <Text>Manage Users</Text>
                      </HStack>
                    </Button>

                    <Button
                      colorScheme="blue"
                      size={{ base: 'sm', md: 'md' }}
                      onClick={handleManageProjects}
                    >
                      <HStack gap={2}>
                        <LuFolderOpen size={18} />
                        <Text>Manage Projects</Text>
                      </HStack>
                    </Button>

                    <Button
                      colorScheme="blue"
                      size={{ base: 'sm', md: 'md' }}
                      onClick={handleManageClients}
                    >
                      <HStack gap={2}>
                        <LuBuilding2 size={18} />
                        <Text>Manage Clients</Text>
                      </HStack>
                    </Button>

                    <Button
                      colorScheme="blue"
                      size={{ base: 'sm', md: 'md' }}
                      onClick={handleViewReports}
                    >
                      <HStack gap={2}>
                        <LuClipboardList size={18} />
                        <Text>View Reports</Text>
                      </HStack>
                    </Button>
                  </Grid>
                </VStack>
              </Card.Body>
            </Card.Root> */}
          </>
        )}
      </DashboardLayout>

      {/* Floating Chatbot Button */}
      {mounted && (
        <>
          {/* Floating Chatbot Button */}
          <Button
            position="fixed"
            bottom={{ base: 4, md: 6 }}
            right={{ base: 4, md: 6 }}
            colorScheme="blue"
            size="lg"
            borderRadius="full"
            boxShadow="2xl"
            onClick={() => setIsChatbotOpen(true)}
            zIndex={1000}
            _hover={{
              transform: 'scale(1.1)',
              boxShadow: '2xl',
            }}
            transition="all 0.3s"
            width={{ base: '56px', md: '60px' }}
            height={{ base: '56px', md: '60px' }}
            padding={0}
          >
            <VStack gap={0}>
              <LuBot size={24} />
              <Text fontSize="2xs" fontWeight="bold">
                {t('dashboard.chatbot.ai')}
              </Text>
            </VStack>
          </Button>

          {/* Chatbot Modal */}
          <SalesAdminChatbotModal
            isOpen={isChatbotOpen}
            onClose={() => setIsChatbotOpen(false)}
          />
        </>
      )}
    </FeatureErrorBoundary>
  );
}
