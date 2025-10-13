'use client';

import { useState, useEffect, useContext } from 'react';
import {
  Box,
  Grid,
  Text,
  VStack,
  HStack,
  Card,
  Input,
  Button,
  Textarea,
} from '@chakra-ui/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { engineerNavigation } from '@/shared/config/navigation';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import {
  attendanceService,
  AttendanceRecord,
} from '@/shared/service/attendanceService';
import { toaster } from '@/components/ui/toaster';
import { AuthContext } from '@/context/AuthContext';

interface FormData {
  workDate: string;
  projectAssignmentId: string;
  attendanceType: string;
  workDescription: string;
  workLocation?: string;
  startTime?: string;
  endTime?: string;
  breakHours: number;
}

export default function UpdateAttendance() {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [projects, setProjects] = useState<
    Array<{
      id: string;
      project: {
        projectName: string;
        client: {
          name: string;
        };
      };
    }>
  >([]);

  // Filter states
  const [projectFilter, setProjectFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // User's projects for filter
  const [userProjects, setUserProjects] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(
    null
  );
  const [formData, setFormData] = useState<FormData>({
    workDate: '',
    projectAssignmentId: '',
    attendanceType: 'PRESENT',
    workDescription: '',
    workLocation: 'CLIENT_SITE',
    startTime: '09:00',
    endTime: '18:00',
    breakHours: 1.0,
  });

  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
  const [deleteRecordDate, setDeleteRecordDate] = useState<string>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(20);

  useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(currentMonth);
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      fetchAttendanceRecords();
      fetchActiveProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  // Apply filters whenever records or filter values change
  useEffect(() => {
    let filtered = [...records];

    // Filter by project
    if (projectFilter) {
      filtered = filtered.filter(
        (record) =>
          record.projectAssignment.project.projectName === projectFilter
      );
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.workDate)
          .toISOString()
          .split('T')[0];
        return recordDate === dateFilter;
      });
    }

    // Filter by attendance type
    if (typeFilter) {
      filtered = filtered.filter(
        (record) => record.attendanceType === typeFilter
      );
    }

    setFilteredRecords(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [records, projectFilter, dateFilter, typeFilter]);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getAttendance({
        month: selectedMonth,
      });
      const fetchedRecords = response.data || [];
      setRecords(fetchedRecords);
      setFilteredRecords(fetchedRecords);

      // Extract unique projects from records
      const uniqueProjects = fetchedRecords.reduce(
        (
          acc: Array<{ id: string; name: string }>,
          record: AttendanceRecord
        ) => {
          const projectName = record.projectAssignment.project.projectName;
          if (!acc.find((p) => p.name === projectName)) {
            acc.push({
              id: projectName,
              name: projectName,
            });
          }
          return acc;
        },
        []
      );
      setUserProjects(uniqueProjects);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toaster.create({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load records',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveProjects = async () => {
    try {
      const response = await attendanceService.getActiveProjects();
      setProjects(response.data || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const handleEditClick = (record: AttendanceRecord) => {
    setEditingRecord(record);

    // Get projectAssignmentId from the record
    const projectAssignmentId = record.projectAssignmentId || '';

    setFormData({
      workDate: record.workDate.split('T')[0],
      projectAssignmentId: projectAssignmentId,
      attendanceType: record.attendanceType,
      workLocation: record.workLocation || 'CLIENT_SITE',
      startTime: record.startTime?.slice(0, 5) || '09:00',
      endTime: record.endTime?.slice(0, 5) || '18:00',
      breakHours: parseFloat(record.breakHours) || 1.0,
      workDescription: record.workDescription || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async () => {
    if (!editingRecord) return;

    setSubmitting(true);
    try {
      await attendanceService.updateAttendance(editingRecord.id, formData);
      toaster.create({
        title: 'Success',
        description: 'Attendance record updated successfully',
        type: 'success',
      });
      setIsEditModalOpen(false);
      fetchAttendanceRecords();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toaster.create({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update record',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (recordId: string, workDate: string) => {
    setDeleteRecordId(recordId);
    setDeleteRecordDate(workDate);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteRecordId) return;

    setDeleting(true);
    try {
      await attendanceService.deleteAttendance(deleteRecordId);
      toaster.create({
        title: 'Success',
        description: 'Attendance record deleted successfully',
        type: 'success',
      });
      setIsDeleteDialogOpen(false);
      fetchAttendanceRecords();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toaster.create({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete record',
        type: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  const resetFilters = () => {
    setProjectFilter('');
    setDateFilter('');
    setTypeFilter('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    const date = new Date(timeString);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} UTC`;
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'PRESENT':
        return 'blue';
      case 'PAID_LEAVE':
        return 'green';
      case 'ABSENT':
        return 'red';
      case 'LEGAL_HOLIDAY':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (type: string) => {
    return type
      .replace('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const calculateWorkHours = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    const start = new Date(`2000-01-01T${formData.startTime}`);
    const end = new Date(`2000-01-01T${formData.endTime}`);
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return Math.max(0, diffHours - formData.breakHours);
  };

  const truncateText = (text: string | null, maxLength: number = 30) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <FeatureErrorBoundary featureName="Update Reports">
      <DashboardLayout
        navigation={engineerNavigation}
        pageTitle="Update Daily Reports"
        pageSubtitle="Edit or delete your attendance records from current month"
        userName={user?.fullName || 'User'}
        userInitials={
          user?.fullName
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase() || 'U'
        }
        notificationCount={3}
      >
        {/* Info Card */}
        <Card.Root p={{ base: 4, md: 6 }} mb={{ base: 4, md: 6 }} bg="blue.50">
          <HStack gap={3}>
            <Text fontSize="2xl">ℹ️</Text>
            <VStack align="start" gap={1}>
              <Text fontWeight="bold" color="blue.800">
                Current Month Only
              </Text>
              <Text fontSize="sm" color="blue.700">
                You can only update or delete attendance records from the
                current month ({selectedMonth})
              </Text>
            </VStack>
          </HStack>
        </Card.Root>

        {/* Filters Section */}
        <Card.Root p={{ base: 4, md: 6 }} mb={{ base: 4, md: 6 }}>
          <VStack align="stretch" gap={4}>
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold">
              🔍 Filters
            </Text>

            <Grid
              templateColumns={{
                base: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(4, 1fr)',
              }}
              gap={4}
            >
              {/* Project Filter */}
              <Box>
                <Text fontSize="sm" mb={2} fontWeight="medium" color="gray.700">
                  Project
                </Text>
                <Box position="relative">
                  <select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 40px 11px 14px',
                      borderRadius: '10px',
                      border: '2px solid #E2E8F0',
                      backgroundColor: 'white',
                      fontSize: '14px',
                      cursor: 'pointer',
                      appearance: 'none',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontWeight: '500',
                      color: '#2D3748',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3182CE';
                      e.target.style.boxShadow =
                        '0 0 0 4px rgba(49, 130, 206, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">📁 All Projects</option>
                    {userProjects.map((project) => (
                      <option key={project.id} value={project.name}>
                        {project.name}
                      </option>
                    ))}
                  </select>

                  <Box
                    position="absolute"
                    right="14px"
                    top="50%"
                    transform="translateY(-50%)"
                    pointerEvents="none"
                    transition="all 0.2s"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      style={{ color: '#718096' }}
                    >
                      <path
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        fill="currentColor"
                      />
                    </svg>
                  </Box>
                </Box>
              </Box>

              {/* Type Filter */}
              <Box>
                <Text fontSize="sm" mb={2} fontWeight="medium" color="gray.700">
                  Attendance Type
                </Text>
                <Box position="relative">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 40px 11px 14px',
                      borderRadius: '10px',
                      border: '2px solid #E2E8F0',
                      backgroundColor: 'white',
                      fontSize: '14px',
                      cursor: 'pointer',
                      appearance: 'none',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontWeight: '500',
                      color: '#2D3748',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3182CE';
                      e.target.style.boxShadow =
                        '0 0 0 4px rgba(49, 130, 206, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">🔍 All Types</option>
                    <option value="PRESENT">✅ Present</option>
                    <option value="PAID_LEAVE">🏖️ Paid Leave</option>
                    <option value="ABSENT">❌ Absent</option>
                    <option value="LEGAL_HOLIDAY">🎉 Legal Holiday</option>
                  </select>

                  <Box
                    position="absolute"
                    right="14px"
                    top="50%"
                    transform="translateY(-50%)"
                    pointerEvents="none"
                    transition="all 0.2s"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      style={{ color: '#718096' }}
                    >
                      <path
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        fill="currentColor"
                      />
                    </svg>
                  </Box>
                </Box>
              </Box>

              {/* Date Filter */}
              <Box>
                <Text fontSize="sm" mb={2} fontWeight="medium">
                  Specific Date
                </Text>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  placeholder="Filter by date"
                  bg="white"
                />
              </Box>

              {/* Reset Button */}
              <Box display="flex" alignItems="flex-end">
                <Button
                  onClick={resetFilters}
                  colorScheme="gray"
                  variant="outline"
                  w="full"
                >
                  🔄 Reset Filters
                </Button>
              </Box>
            </Grid>

            {/* Results Count */}
            <HStack justify="space-between" pt={2}>
              <Text fontSize="sm" color="gray.600">
                Showing <strong>{filteredRecords.length}</strong> of{' '}
                <strong>{records.length}</strong> total records
              </Text>
              <Button
                onClick={fetchAttendanceRecords}
                size="sm"
                variant="ghost"
                colorScheme="blue"
              >
                🔄 Refresh
              </Button>
            </HStack>
          </VStack>
        </Card.Root>

        {/* Loading State */}
        {loading && (
          <Card.Root p={8}>
            <VStack gap={4}>
              <Text fontSize="2xl">⏳</Text>
              <Text color="gray.600">Loading attendance records...</Text>
            </VStack>
          </Card.Root>
        )}

        {/* Empty State */}
        {!loading && filteredRecords.length === 0 && (
          <Card.Root p={8}>
            <VStack gap={4}>
              <Text fontSize="4xl">📭</Text>
              <Text fontSize="lg" fontWeight="bold">
                No Attendance Records Found
              </Text>
              <Text color="gray.600" textAlign="center">
                {records.length === 0
                  ? 'No attendance records found for this month. Start by submitting your daily attendance.'
                  : 'No records match your filters. Try adjusting them.'}
              </Text>
              {records.length > 0 && (
                <Button onClick={resetFilters} colorScheme="blue" size="sm">
                  Clear Filters
                </Button>
              )}
            </VStack>
          </Card.Root>
        )}

        {/* Desktop Table View */}
        {!loading && currentRecords.length > 0 && (
          <>
            <Box
              display={{ base: 'none', lg: 'block' }}
              overflowX="auto"
              bg="white"
              borderRadius="lg"
              border="1px solid"
              borderColor="gray.200"
            >
              <Box as="table" w="full">
                <Box as="thead" bg="gray.50">
                  <Box as="tr">
                    <Box
                      as="th"
                      p={4}
                      textAlign="left"
                      fontSize="sm"
                      fontWeight="semibold"
                    >
                      Date
                    </Box>
                    <Box
                      as="th"
                      p={4}
                      textAlign="left"
                      fontSize="sm"
                      fontWeight="semibold"
                    >
                      Project
                    </Box>
                    <Box
                      as="th"
                      p={4}
                      textAlign="left"
                      fontSize="sm"
                      fontWeight="semibold"
                    >
                      Type
                    </Box>
                    <Box
                      as="th"
                      p={4}
                      textAlign="left"
                      fontSize="sm"
                      fontWeight="semibold"
                    >
                      Time
                    </Box>
                    <Box
                      as="th"
                      p={4}
                      textAlign="left"
                      fontSize="sm"
                      fontWeight="semibold"
                    >
                      Location
                    </Box>
                    <Box
                      as="th"
                      p={4}
                      textAlign="left"
                      fontSize="sm"
                      fontWeight="semibold"
                    >
                      Description
                    </Box>
                    <Box
                      as="th"
                      p={4}
                      textAlign="center"
                      fontSize="sm"
                      fontWeight="semibold"
                    >
                      Actions
                    </Box>
                  </Box>
                </Box>
                <Box as="tbody">
                  {currentRecords.map((record) => (
                    <Box
                      as="tr"
                      key={record.id}
                      borderBottom="1px solid"
                      borderColor="gray.100"
                      _hover={{ bg: 'gray.50' }}
                      transition="background 0.2s"
                    >
                      <Box as="td" p={4}>
                        <Text fontSize="sm" fontWeight="medium">
                          {formatDate(record.workDate)}
                        </Text>
                      </Box>
                      <Box as="td" p={4}>
                        <VStack align="start" gap={0}>
                          <Text fontSize="sm" fontWeight="medium">
                            {record.projectAssignment.project.projectName}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {record.projectAssignment.project.client.name}
                          </Text>
                        </VStack>
                      </Box>
                      <Box as="td" p={4}>
                        <Box
                          px={3}
                          py={1}
                          borderRadius="full"
                          bg={`${getStatusColor(record.attendanceType)}.100`}
                          color={`${getStatusColor(record.attendanceType)}.700`}
                          fontSize="xs"
                          fontWeight="medium"
                          display="inline-block"
                        >
                          {getStatusLabel(record.attendanceType)}
                        </Box>
                      </Box>
                      <Box as="td" p={4}>
                        <Text fontSize="sm">
                          {formatTime(record.startTime)} -{' '}
                          {formatTime(record.endTime)}
                        </Text>
                      </Box>
                      <Box as="td" p={4}>
                        <Text fontSize="sm">{record.workLocation || '-'}</Text>
                      </Box>
                      <Box as="td" p={4}>
                        <Text fontSize="sm" color="gray.600">
                          {truncateText(record.workDescription, 30)}
                        </Text>
                      </Box>
                      <Box as="td" p={4}>
                        <HStack gap={2} justify="center">
                          <Button
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleEditClick(record)}
                          >
                            ✏️ Edit
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() =>
                              handleDeleteClick(record.id, record.workDate)
                            }
                          >
                            🗑️ Delete
                          </Button>
                        </HStack>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Mobile/Tablet View - Cards */}
            <VStack gap={4} display={{ base: 'flex', lg: 'none' }}>
              {currentRecords.map((record) => (
                <Card.Root key={record.id} p={4} w="full">
                  <VStack align="stretch" gap={3}>
                    <HStack justify="space-between">
                      <VStack align="start" gap={0}>
                        <Text fontSize="md" fontWeight="bold">
                          {formatDate(record.workDate)}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {formatTime(record.startTime)} -{' '}
                          {formatTime(record.endTime)}
                        </Text>
                      </VStack>

                      <Box
                        px={3}
                        py={1}
                        borderRadius="full"
                        bg={`${getStatusColor(record.attendanceType)}.100`}
                        color={`${getStatusColor(record.attendanceType)}.700`}
                        fontSize="xs"
                        fontWeight="medium"
                        display="inline-block"
                      >
                        {getStatusLabel(record.attendanceType)}
                      </Box>
                    </HStack>

                    <VStack align="start" gap={0}>
                      <Text fontSize="sm" fontWeight="medium">
                        {record.projectAssignment.project.projectName}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {record.projectAssignment.project.client.name}
                      </Text>
                    </VStack>

                    <HStack
                      gap={3}
                      fontSize="xs"
                      color="gray.600"
                      flexWrap="wrap"
                    >
                      <HStack gap={1}>
                        <Text>📍</Text>
                        <Text>{record.workLocation || 'N/A'}</Text>
                      </HStack>
                      <HStack gap={1}>
                        <Text>☕</Text>
                        <Text>{record.breakHours}h</Text>
                      </HStack>
                    </HStack>

                    {record.workDescription && (
                      <Box
                        p={2}
                        bg="gray.50"
                        borderRadius="md"
                        borderLeft="3px solid"
                        borderColor="blue.400"
                      >
                        <Text fontSize="xs" color="gray.600" lineClamp={2}>
                          {record.workDescription}
                        </Text>
                      </Box>
                    )}

                    <HStack gap={2} pt={2}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        flex={1}
                        onClick={() => handleEditClick(record)}
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        flex={1}
                        onClick={() =>
                          handleDeleteClick(record.id, record.workDate)
                        }
                      >
                        🗑️ Delete
                      </Button>
                    </HStack>
                  </VStack>
                </Card.Root>
              ))}
            </VStack>

            {/* Pagination Controls */}
            <Card.Root p={4} mt={6}>
              <HStack
                justify="space-between"
                align="center"
                flexWrap="wrap"
                gap={4}
              >
                <Text fontSize="sm" color="gray.600">
                  Showing {indexOfFirstRecord + 1} to{' '}
                  {Math.min(indexOfLastRecord, filteredRecords.length)} of{' '}
                  {filteredRecords.length} records
                </Text>

                <HStack gap={2}>
                  <Button
                    size="sm"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                  >
                    ← Previous
                  </Button>

                  {/* Desktop Page Numbers */}
                  <HStack gap={1} display={{ base: 'none', md: 'flex' }}>
                    {(() => {
                      const pageNumbers = [];
                      const maxVisiblePages = 5;

                      if (totalPages <= maxVisiblePages) {
                        // Show all pages if total is less than max visible
                        for (let i = 1; i <= totalPages; i++) {
                          pageNumbers.push(i);
                        }
                      } else {
                        // Always show first page
                        pageNumbers.push(1);

                        let startPage = Math.max(2, currentPage - 1);
                        let endPage = Math.min(totalPages - 1, currentPage + 1);

                        // Adjust if we're near the start
                        if (currentPage <= 3) {
                          startPage = 2;
                          endPage = 4;
                        }

                        // Adjust if we're near the end
                        if (currentPage >= totalPages - 2) {
                          startPage = totalPages - 3;
                          endPage = totalPages - 1;
                        }

                        // Add ellipsis after first page if needed
                        if (startPage > 2) {
                          pageNumbers.push('...');
                        }

                        // Add middle pages
                        for (let i = startPage; i <= endPage; i++) {
                          pageNumbers.push(i);
                        }

                        // Add ellipsis before last page if needed
                        if (endPage < totalPages - 1) {
                          pageNumbers.push('...');
                        }

                        // Always show last page
                        pageNumbers.push(totalPages);
                      }

                      return pageNumbers.map((page, index) => {
                        if (page === '...') {
                          return (
                            <Text
                              key={`ellipsis-${index}`}
                              px={2}
                              color="gray.400"
                            >
                              ...
                            </Text>
                          );
                        }

                        return (
                          <Button
                            key={page}
                            size="sm"
                            onClick={() => paginate(page as number)}
                            colorScheme={currentPage === page ? 'blue' : 'gray'}
                            variant={currentPage === page ? 'solid' : 'outline'}
                          >
                            {page}
                          </Button>
                        );
                      });
                    })()}
                  </HStack>

                  {/* Mobile Page Indicator */}
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    display={{ base: 'block', md: 'none' }}
                  >
                    Page {currentPage} of {totalPages}
                  </Text>

                  <Button
                    size="sm"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                  >
                    Next →
                  </Button>
                </HStack>
              </HStack>
            </Card.Root>
          </>
        )}

        {/* Edit Modal - Same as before */}
        {isEditModalOpen && (
          <>
            <Box
              position="fixed"
              inset={0}
              bg="blackAlpha.600"
              zIndex={999}
              onClick={() => setIsEditModalOpen(false)}
            />

            <Box
              position="fixed"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              bg="white"
              borderRadius="lg"
              shadow="2xl"
              zIndex={1000}
              w={{ base: '90%', md: '600px' }}
              maxH="80vh"
              overflowY="auto"
              p={6}
            >
              <VStack align="stretch" gap={4}>
                <HStack justify="space-between">
                  <Text fontSize="xl" fontWeight="bold">
                    Edit Attendance Record
                  </Text>
                  <Box
                    as="button"
                    onClick={() => setIsEditModalOpen(false)}
                    cursor="pointer"
                    fontSize="24px"
                    color="gray.500"
                    _hover={{ color: 'gray.700' }}
                  >
                    ✕
                  </Box>
                </HStack>

                <VStack align="stretch" gap={4} pt={4}>
                  {/* Date */}
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      📅 Date
                    </Text>
                    <Input
                      type="date"
                      value={formData.workDate}
                      onChange={(e) =>
                        setFormData({ ...formData, workDate: e.target.value })
                      }
                    />
                  </Box>

                  {/* Project */}
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      📁 Project
                    </Text>
                    <select
                      value={formData.projectAssignmentId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          projectAssignmentId: e.target.value,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        fontSize: '14px',
                      }}
                    >
                      <option value="">Select Project</option>
                      {projects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          {proj.project.projectName} -{' '}
                          {proj.project.client.name}
                        </option>
                      ))}
                    </select>
                  </Box>

                  {/* Attendance Type */}
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      ✅ Attendance Type
                    </Text>
                    <select
                      value={formData.attendanceType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          attendanceType: e.target.value,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        fontSize: '14px',
                      }}
                    >
                      <option value="PRESENT">Present</option>
                      <option value="PAID_LEAVE">Paid Leave</option>
                      <option value="ABSENT">Absent</option>
                      <option value="LEGAL_HOLIDAY">Legal Holiday</option>
                    </select>
                  </Box>

                  {/* Conditional Fields for PRESENT */}
                  {formData.attendanceType === 'PRESENT' && (
                    <>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          📍 Work Location
                        </Text>
                        <select
                          value={formData.workLocation}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              workLocation: e.target.value,
                            })
                          }
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #E2E8F0',
                            fontSize: '14px',
                          }}
                        >
                          <option value="CLIENT_SITE">Client Site</option>
                          <option value="HOME">Home</option>
                          <option value="OFFICE">Office</option>
                        </select>
                      </Box>

                      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>
                            🕐 Start Time
                          </Text>
                          <Input
                            type="time"
                            value={formData.startTime}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                startTime: e.target.value,
                              })
                            }
                          />
                        </Box>
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>
                            🕐 End Time
                          </Text>
                          <Input
                            type="time"
                            value={formData.endTime}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                endTime: e.target.value,
                              })
                            }
                          />
                        </Box>
                      </Grid>

                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          ☕ Break Hours
                        </Text>
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          value={formData.breakHours}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              breakHours: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </Box>

                      <Box bg="blue.50" p={3} borderRadius="md">
                        <Text fontSize="sm" fontWeight="bold" color="blue.800">
                          💼 Calculated Work Hours:{' '}
                          {calculateWorkHours().toFixed(1)} hours
                        </Text>
                      </Box>
                    </>
                  )}

                  {/* Work Description */}
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      📝 Work Description
                    </Text>
                    <Textarea
                      value={formData.workDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workDescription: e.target.value,
                        })
                      }
                      placeholder="Describe your work..."
                      rows={3}
                    />
                  </Box>
                </VStack>

                <HStack justify="flex-end" pt={4} gap={3}>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleUpdateSubmit}
                    disabled={submitting}
                  >
                    {submitting ? 'Updating...' : '💾 Update'}
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </>
        )}

        {/* Delete Confirmation Dialog */}
        {isDeleteDialogOpen && (
          <>
            <Box
              position="fixed"
              inset={0}
              bg="blackAlpha.600"
              zIndex={999}
              onClick={() => setIsDeleteDialogOpen(false)}
            />

            <Box
              position="fixed"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              bg="white"
              borderRadius="lg"
              shadow="2xl"
              zIndex={1000}
              w={{ base: '90%', md: '400px' }}
              p={6}
            >
              <VStack align="stretch" gap={4}>
                <HStack justify="space-between">
                  <Text fontSize="xl" fontWeight="bold">
                    ⚠️ Confirm Delete
                  </Text>
                  <Box
                    as="button"
                    onClick={() => setIsDeleteDialogOpen(false)}
                    cursor="pointer"
                    fontSize="24px"
                    color="gray.500"
                    _hover={{ color: 'gray.700' }}
                  >
                    ✕
                  </Box>
                </HStack>

                <Box>
                  <Text color="gray.700">
                    Are you sure you want to delete the attendance record for{' '}
                    <strong>{formatDate(deleteRecordDate)}</strong>?
                  </Text>
                  <Text fontSize="sm" color="red.600" mt={2}>
                    This action cannot be undone.
                  </Text>
                </Box>

                <HStack justify="flex-end" pt={4} gap={3}>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={handleDeleteConfirm}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : '🗑️ Delete'}
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
