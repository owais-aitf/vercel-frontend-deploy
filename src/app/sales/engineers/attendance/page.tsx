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
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    attendanceType: '',
    workLocation: '',
    startTime: '',
    endTime: '',
    breakHours: 0,
    workDescription: '',
  });

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
        engineerId: selectedEngineer.id, // Pass engineerId to backend
      });

      // Backend already filters by engineerId, so use data directly
      setAttendanceRecords(response.data || []);
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

  const openEditModal = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setEditFormData({
      attendanceType: record.attendanceType,
      workLocation: record.workLocation || '',
      startTime: record.startTime || '',
      endTime: record.endTime || '',
      breakHours: record.breakHours,
      workDescription: record.workDescription || '',
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingRecord(null);
  };

  const handleUpdateAttendance = async () => {
    if (!editingRecord) return;

    try {
      await attendanceService.updateAttendance(editingRecord.id, editFormData);
      toaster.create({
        title: 'Success',
        description: 'Attendance record updated successfully',
        type: 'success',
        duration: 3000,
      });
      closeEditModal();
      fetchAttendance();
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toaster.create({
        title: 'Error',
        description: errorMessage || 'Failed to update attendance record',
        type: 'error',
        duration: 4000,
      });
    }
  };

  const handleDeleteAttendance = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }

    try {
      await attendanceService.deleteAttendance(recordId);
      toaster.create({
        title: 'Success',
        description: 'Attendance record deleted successfully',
        type: 'success',
        duration: 3000,
      });
      fetchAttendance();
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toaster.create({
        title: 'Error',
        description: errorMessage || 'Failed to delete attendance record',
        type: 'error',
        duration: 4000,
      });
    }
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return (
      selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear()
    );
  };

  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return '';
    try {
      // Handle ISO timestamp format (1970-01-01T09:00:00.000Z)
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (error) {
      // If it's already in HH:MM format, return as is
      return timeString;
    }
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
                                    🕐 {formatTime(record.startTime)} -{' '}
                                    {formatTime(record.endTime)}
                                  </Text>
                                )}
                                {record.workDescription && (
                                  <Text fontSize="xs" color="gray.700" mt={1}>
                                    {record.workDescription}
                                  </Text>
                                )}
                              </VStack>

                              {/* Edit/Delete Actions - Only for current month */}
                              {isCurrentMonth() && (
                                <VStack gap={2} align="stretch">
                                  <Button
                                    size="sm"
                                    colorScheme="blue"
                                    variant="outline"
                                    onClick={() => openEditModal(record)}
                                    title="Edit attendance record"
                                    fontSize="xs"
                                    fontWeight="medium"
                                    _hover={{
                                      bg: 'blue.50',
                                      borderColor: 'blue.500',
                                      transform: 'translateY(-1px)',
                                      shadow: 'sm',
                                    }}
                                    transition="all 0.2s"
                                  >
                                    ✏️ Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() =>
                                      handleDeleteAttendance(record.id)
                                    }
                                    title="Delete attendance record"
                                    fontSize="xs"
                                    fontWeight="medium"
                                    _hover={{
                                      bg: 'red.50',
                                      color: 'red.600',
                                      transform: 'translateY(-1px)',
                                    }}
                                    transition="all 0.2s"
                                  >
                                    🗑️ Delete
                                  </Button>
                                </VStack>
                              )}
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

        {/* Edit Attendance Modal */}
        {isEditModalOpen && editingRecord && (
          <>
            {/* Backdrop */}
            <Box
              position="fixed"
              inset={0}
              bg="blackAlpha.600"
              zIndex={999}
              onClick={closeEditModal}
            />

            {/* Modal */}
            <Box
              position="fixed"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              bg="white"
              borderRadius="lg"
              shadow="2xl"
              p={6}
              w={{ base: '90%', md: '600px' }}
              maxH="90vh"
              overflowY="auto"
              zIndex={1000}
            >
              <VStack align="stretch" gap={4}>
                {/* Header */}
                <HStack
                  justify="space-between"
                  pb={3}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                >
                  <Text fontSize="xl" fontWeight="bold">
                    ✏️ Edit Attendance Record
                  </Text>
                  <Button onClick={closeEditModal} variant="ghost" size="sm">
                    ✕
                  </Button>
                </HStack>

                {/* Date Info */}
                <Box p={3} bg="blue.50" borderRadius="md">
                  <Text fontSize="sm" fontWeight="medium" color="blue.900">
                    📅{' '}
                    {new Date(editingRecord.workDate).toLocaleDateString(
                      'en-US',
                      {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </Text>
                </Box>

                {/* Attendance Type */}
                <Box>
                  <Text fontSize="sm" mb={2} fontWeight="medium">
                    Attendance Type *
                  </Text>
                  <select
                    value={editFormData.attendanceType}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        attendanceType: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '14px',
                    }}
                  >
                    <option value="PRESENT">✅ Present</option>
                    <option value="PAID_LEAVE">🏖️ Paid Leave</option>
                    <option value="ABSENT">❌ Absent</option>
                    <option value="LEGAL_HOLIDAY">🎉 Legal Holiday</option>
                  </select>
                </Box>

                {/* Work Location */}
                {editFormData.attendanceType === 'PRESENT' && (
                  <Box>
                    <Text fontSize="sm" mb={2} fontWeight="medium">
                      Work Location
                    </Text>
                    <Input
                      value={editFormData.workLocation}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          workLocation: e.target.value,
                        })
                      }
                      placeholder="e.g., Office, Remote, Client Site"
                    />
                  </Box>
                )}

                {/* Start & End Time */}
                {editFormData.attendanceType === 'PRESENT' && (
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <Box>
                      <Text fontSize="sm" mb={2} fontWeight="medium">
                        Start Time
                      </Text>
                      <Input
                        type="time"
                        value={editFormData.startTime}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            startTime: e.target.value,
                          })
                        }
                      />
                    </Box>
                    <Box>
                      <Text fontSize="sm" mb={2} fontWeight="medium">
                        End Time
                      </Text>
                      <Input
                        type="time"
                        value={editFormData.endTime}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            endTime: e.target.value,
                          })
                        }
                      />
                    </Box>
                  </Grid>
                )}

                {/* Break Hours */}
                {editFormData.attendanceType === 'PRESENT' && (
                  <Box>
                    <Text fontSize="sm" mb={2} fontWeight="medium">
                      Break Hours
                    </Text>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      max="8"
                      value={editFormData.breakHours}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          breakHours: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </Box>
                )}

                {/* Work Description */}
                <Box>
                  <Text fontSize="sm" mb={2} fontWeight="medium">
                    Work Description
                  </Text>
                  <textarea
                    value={editFormData.workDescription}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        workDescription: e.target.value,
                      })
                    }
                    placeholder="Describe the work done or reason for leave..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </Box>

                {/* Actions */}
                <HStack
                  justify="flex-end"
                  pt={4}
                  borderTop="1px solid"
                  borderColor="gray.200"
                  gap={3}
                >
                  <Button onClick={closeEditModal} variant="outline">
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateAttendance} colorScheme="blue">
                    💾 Save Changes
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
