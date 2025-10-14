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
} from '@chakra-ui/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { salesNavigation } from '@/shared/config/navigation';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { AuthContext } from '@/context/AuthContext';
import { engineerService, Engineer } from '@/shared/service/engineerService';
import { attendanceService } from '@/shared/service/attendanceService';
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

interface AttendanceRecord {
  id: string;
  workDate: string;
  attendanceType: string;
  workLocation?: string;
  startTime?: string;
  endTime?: string;
  breakHours: number;
  workDescription?: string;
}

export default function ManageAttendancePage() {
  const { user } = useContext(AuthContext);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(
    null
  );
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchEngineers();
  }, []);

  useEffect(() => {
    if (selectedEngineer) {
      fetchAttendance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEngineer, selectedMonth, selectedYear]);

  const fetchEngineers = async () => {
    try {
      setLoading(true);
      const response = await engineerService.getAllEngineers();
      const activeEngineers = (response.data || []).filter(
        (e: Engineer) => e.isActive
      );
      setEngineers(activeEngineers);
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

  const fetchAttendance = async () => {
    if (!selectedEngineer) return;

    try {
      setLoadingAttendance(true);
      // Format month as YYYY-MM
      const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      const response = await attendanceService.getAttendance({
        month: monthStr,
      });

      // Filter records for selected engineer
      const engineerRecords = (response.data || []).filter(
        (record: { engineerId: string }) =>
          record.engineerId === selectedEngineer.id
      );

      setAttendanceRecords(engineerRecords);
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toaster.create({
        title: 'Error',
        description: errorMessage || 'Failed to fetch attendance records',
        type: 'error',
        duration: 4000,
      });
      setAttendanceRecords([]);
    } finally {
      setLoadingAttendance(false);
    }
  };

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

  const handleSendBulkReminders = async () => {
    // TODO: Implement API call later
    toaster.create({
      title: 'Bulk reminder feature',
      description: `Bulk reminder functionality for ${engineers.length} engineers will be implemented soon`,
      type: 'info',
      duration: 3000,
    });
  };

  const getAttendanceTypeColor = (type: string) => {
    switch (type) {
      case 'PRESENT':
        return 'green';
      case 'PAID_LEAVE':
        return 'blue';
      case 'ABSENT':
        return 'red';
      case 'LEGAL_HOLIDAY':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const getAttendanceTypeLabel = (type: string) => {
    switch (type) {
      case 'PRESENT':
        return '✅ Present';
      case 'PAID_LEAVE':
        return '🏖️ Paid Leave';
      case 'ABSENT':
        return '❌ Absent';
      case 'LEGAL_HOLIDAY':
        return '🎉 Holiday';
      default:
        return type;
    }
  };

  const filteredEngineers = engineers.filter(
    (engineer) =>
      engineer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engineer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalWorkDays = attendanceRecords.filter(
    (r) => r.attendanceType === 'PRESENT'
  ).length;
  const totalLeave = attendanceRecords.filter(
    (r) => r.attendanceType === 'PAID_LEAVE'
  ).length;
  const totalAbsent = attendanceRecords.filter(
    (r) => r.attendanceType === 'ABSENT'
  ).length;

  return (
    <FeatureErrorBoundary featureName="Manage Attendance">
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

        {/* Bulk Actions */}
        <Card.Root p={4} mb={6} bg="purple.50">
          <HStack justify="space-between">
            <VStack align="start" gap={1}>
              <Text fontSize="md" fontWeight="bold" color="purple.900">
                📢 Bulk Actions
              </Text>
              <Text fontSize="sm" color="purple.700">
                Send reminders to all active engineers
              </Text>
            </VStack>
            <Button
              colorScheme="purple"
              onClick={handleSendBulkReminders}
              size="md"
            >
              🔔 Send Bulk Reminders
            </Button>
          </HStack>
        </Card.Root>

        <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap={6}>
          {/* Engineer Selection List */}
          <Card.Root p={5}>
            <VStack align="stretch" gap={4}>
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="bold">
                  👥 Engineers ({engineers.length})
                </Text>
              </HStack>

              {/* Search */}
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search engineers..."
                size="md"
              />

              {/* Engineers List */}
              <VStack
                align="stretch"
                gap={2}
                maxH="700px"
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
                      p={3}
                      cursor="pointer"
                      onClick={() => setSelectedEngineer(engineer)}
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
                      <VStack align="stretch" gap={2}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" fontWeight="bold">
                            {engineer.fullName}
                          </Text>
                          <Button
                            size="xs"
                            colorScheme="purple"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendReminder(
                                engineer.id,
                                engineer.fullName
                              );
                            }}
                          >
                            🔔
                          </Button>
                        </HStack>
                        <Text fontSize="xs" color="gray.600">
                          {engineer.email}
                        </Text>
                        <HStack fontSize="xs" color="gray.600">
                          <Text>
                            🏖️ {engineer.paidLeaveUsedThisYear}/
                            {engineer.annualPaidLeaveAllowance}
                          </Text>
                        </HStack>
                      </VStack>
                    </Card.Root>
                  ))}
              </VStack>
            </VStack>
          </Card.Root>

          {/* Attendance Records */}
          <VStack align="stretch" gap={6}>
            {!selectedEngineer ? (
              <Card.Root p={6}>
                <VStack gap={4} py={20}>
                  <Text fontSize="4xl">👈</Text>
                  <Text fontSize="lg" fontWeight="bold">
                    Select an Engineer
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Choose an engineer to view their attendance records
                  </Text>
                </VStack>
              </Card.Root>
            ) : (
              <>
                {/* Engineer Info & Controls */}
                <Card.Root p={5}>
                  <VStack align="stretch" gap={4}>
                    <HStack justify="space-between">
                      <VStack align="start" gap={1}>
                        <Text fontSize="xl" fontWeight="bold">
                          {selectedEngineer.fullName}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {selectedEngineer.email}
                        </Text>
                      </VStack>
                      <Button
                        colorScheme="purple"
                        size="sm"
                        onClick={() =>
                          handleSendReminder(
                            selectedEngineer.id,
                            selectedEngineer.fullName
                          )
                        }
                      >
                        🔔 Send Reminder
                      </Button>
                    </HStack>

                    {/* Month/Year Selector */}
                    <HStack gap={3}>
                      <Box flex={1}>
                        <Text fontSize="xs" mb={1} color="gray.600">
                          Month
                        </Text>
                        <select
                          value={selectedMonth}
                          onChange={(e) =>
                            setSelectedMonth(parseInt(e.target.value))
                          }
                          style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '8px',
                            border: '2px solid #E2E8F0',
                            fontSize: '14px',
                          }}
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (month) => (
                              <option key={month} value={month}>
                                {new Date(2000, month - 1).toLocaleString(
                                  'default',
                                  { month: 'long' }
                                )}
                              </option>
                            )
                          )}
                        </select>
                      </Box>
                      <Box flex={1}>
                        <Text fontSize="xs" mb={1} color="gray.600">
                          Year
                        </Text>
                        <select
                          value={selectedYear}
                          onChange={(e) =>
                            setSelectedYear(parseInt(e.target.value))
                          }
                          style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '8px',
                            border: '2px solid #E2E8F0',
                            fontSize: '14px',
                          }}
                        >
                          {Array.from({ length: 5 }, (_, i) => 2023 + i).map(
                            (year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            )
                          )}
                        </select>
                      </Box>
                    </HStack>
                  </VStack>
                </Card.Root>

                {/* Stats */}
                <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                  <Card.Root p={4} bg="green.50">
                    <VStack gap={1}>
                      <Text fontSize="2xl" fontWeight="bold" color="green.900">
                        {totalWorkDays}
                      </Text>
                      <Text fontSize="xs" color="green.700">
                        Work Days
                      </Text>
                    </VStack>
                  </Card.Root>
                  <Card.Root p={4} bg="blue.50">
                    <VStack gap={1}>
                      <Text fontSize="2xl" fontWeight="bold" color="blue.900">
                        {totalLeave}
                      </Text>
                      <Text fontSize="xs" color="blue.700">
                        Leave Days
                      </Text>
                    </VStack>
                  </Card.Root>
                  <Card.Root p={4} bg="red.50">
                    <VStack gap={1}>
                      <Text fontSize="2xl" fontWeight="bold" color="red.900">
                        {totalAbsent}
                      </Text>
                      <Text fontSize="xs" color="red.700">
                        Absent Days
                      </Text>
                    </VStack>
                  </Card.Root>
                </Grid>

                {/* Attendance Records */}
                <Card.Root p={5}>
                  <VStack align="stretch" gap={4}>
                    <Text fontSize="lg" fontWeight="bold">
                      📅 Attendance Records
                    </Text>

                    {loadingAttendance && (
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        textAlign="center"
                        py={4}
                      >
                        Loading attendance records...
                      </Text>
                    )}

                    {!loadingAttendance && attendanceRecords.length === 0 && (
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        textAlign="center"
                        py={4}
                      >
                        No attendance records for this period
                      </Text>
                    )}

                    {!loadingAttendance && attendanceRecords.length > 0 && (
                      <VStack
                        align="stretch"
                        gap={2}
                        maxH="500px"
                        overflowY="auto"
                      >
                        {attendanceRecords.map((record) => (
                          <Card.Root key={record.id} p={4} bg="gray.50">
                            <HStack justify="space-between" align="start">
                              <VStack align="start" gap={1} flex={1}>
                                <HStack>
                                  <Text fontSize="sm" fontWeight="bold">
                                    {new Date(
                                      record.workDate
                                    ).toLocaleDateString()}
                                  </Text>
                                  <Badge
                                    colorScheme={getAttendanceTypeColor(
                                      record.attendanceType
                                    )}
                                    fontSize="xs"
                                  >
                                    {getAttendanceTypeLabel(
                                      record.attendanceType
                                    )}
                                  </Badge>
                                </HStack>
                                {record.workLocation && (
                                  <Text fontSize="xs" color="gray.600">
                                    📍 {record.workLocation}
                                  </Text>
                                )}
                                {record.startTime && record.endTime && (
                                  <Text fontSize="xs" color="gray.600">
                                    🕐 {record.startTime} - {record.endTime}
                                  </Text>
                                )}
                                {record.workDescription && (
                                  <Text fontSize="xs" color="gray.700" mt={1}>
                                    {record.workDescription}
                                  </Text>
                                )}
                              </VStack>
                            </HStack>
                          </Card.Root>
                        ))}
                      </VStack>
                    )}
                  </VStack>
                </Card.Root>
              </>
            )}
          </VStack>
        </Grid>
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
