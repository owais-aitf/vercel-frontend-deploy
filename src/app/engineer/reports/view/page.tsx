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
} from '@chakra-ui/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { engineerNavigation } from '@/shared/config/navigation';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import {
  attendanceService,
  AttendanceRecord,
} from '@/shared/service/attendanceService';
import { AuthContext } from '@/context/AuthContext';

export default function ViewAttendance() {
  const { user } = useContext(AuthContext);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<
    AttendanceRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [monthFilter, setMonthFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(20);

  // Modal state
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null
  );

  // User's projects
  const [userProjects, setUserProjects] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // Fetch attendance data
  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await attendanceService.getAttendance();
      const records = response.data || [];
      setAttendance(records);
      setFilteredAttendance(records);

      // Extract unique projects
      const projects = records.reduce(
        (
          acc: Array<{ id: string; name: string }>,
          record: AttendanceRecord
        ) => {
          const projectId = record.projectAssignment.project.projectName;
          if (!acc.find((p) => p.id === projectId)) {
            acc.push({
              id: projectId,
              name: record.projectAssignment.project.projectName,
            });
          }
          return acc;
        },
        []
      );
      setUserProjects(projects);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...attendance];

    if (monthFilter) {
      filtered = filtered.filter((record) => {
        const recordMonth = new Date(record.workDate).toISOString().slice(0, 7);
        return recordMonth === monthFilter;
      });
    }

    if (typeFilter) {
      filtered = filtered.filter(
        (record) => record.attendanceType === typeFilter
      );
    }

    if (searchDate) {
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.workDate)
          .toISOString()
          .split('T')[0];
        return recordDate === searchDate;
      });
    }

    if (projectFilter) {
      filtered = filtered.filter(
        (record) =>
          record.projectAssignment.project.projectName === projectFilter
      );
    }

    setFilteredAttendance(filtered);
  }, [monthFilter, typeFilter, searchDate, projectFilter, attendance]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [monthFilter, typeFilter, searchDate, projectFilter]);

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredAttendance.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredAttendance.length / recordsPerPage);

  // Change page
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset filters
  const resetFilters = () => {
    setMonthFilter('');
    setTypeFilter('');
    setSearchDate('');
    setProjectFilter('');
  };

  // Open modal
  const openDetailModal = (record: AttendanceRecord) => {
    setSelectedRecord(record);
  };

  // Close modal
  const closeDetailModal = () => {
    setSelectedRecord(null);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time in UTC
  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';

    const date = new Date(timeString);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes} UTC`;
  };

  // Truncate text
  const truncateText = (text: string | null, maxLength: number = 50) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Get status color
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

  // Get status label
  const getStatusLabel = (type: string) => {
    return type
      .replace('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <FeatureErrorBoundary featureName="Reports">
      <DashboardLayout
        navigation={engineerNavigation}
        pageTitle="Attendance Records"
        pageSubtitle="View your attendance history"
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
        {/* Filters Section */}
        <Card.Root p={{ base: 4, md: 6 }} mb={{ base: 4, md: 6 }}>
          <VStack align="stretch" gap={4}>
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold">
              Filters
            </Text>

            <Grid
              templateColumns={{
                base: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(5, 1fr)',
              }}
              gap={4}
            >
              {/* Month Filter */}
              <Box>
                <Text fontSize="sm" mb={2} fontWeight="medium">
                  Month
                </Text>
                <Input
                  type="month"
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  placeholder="Select month"
                  bg="white"
                />
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

              {/* Date Search */}
              <Box>
                <Text fontSize="sm" mb={2} fontWeight="medium">
                  Specific Date
                </Text>
                <Input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  placeholder="Search by date"
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
                  Reset Filters
                </Button>
              </Box>
            </Grid>

            {/* Results Count */}
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">
                Showing <strong>{filteredAttendance.length}</strong> total
                records
              </Text>
              <Button
                onClick={fetchAttendance}
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

        {/* Error State */}
        {error && !loading && (
          <Card.Root p={6} bg="red.50" borderColor="red.200">
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

        {/* Empty State */}
        {!loading && !error && filteredAttendance.length === 0 && (
          <Card.Root p={8}>
            <VStack gap={4}>
              <Text fontSize="4xl">📭</Text>
              <Text fontSize="lg" fontWeight="bold">
                No Attendance Records Found
              </Text>
              <Text color="gray.600" textAlign="center">
                {attendance.length === 0
                  ? "You haven't logged any attendance yet."
                  : 'No records match your filters. Try adjusting them.'}
              </Text>
              {attendance.length > 0 && (
                <Button onClick={resetFilters} colorScheme="blue" size="sm">
                  Clear Filters
                </Button>
              )}
            </VStack>
          </Card.Root>
        )}

        {/* Attendance Records - Desktop Table */}
        {!loading && !error && currentRecords.length > 0 && (
          <>
            {/* Desktop View - Table */}
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
                      textAlign="left"
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
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => openDetailModal(record)}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Mobile/Tablet View - Cards */}
            <VStack gap={4} display={{ base: 'flex', lg: 'none' }}>
              {currentRecords.map((record) => (
                <Card.Root key={record.id} p={4} w="full" position="relative">
                  <Button
                    position="absolute"
                    top={3}
                    right={3}
                    size="xs"
                    colorScheme="blue"
                    onClick={() => openDetailModal(record)}
                  >
                    View
                  </Button>

                  <VStack align="stretch" gap={3} pr={16}>
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
                      alignSelf="flex-start"
                    >
                      {getStatusLabel(record.attendanceType)}
                    </Box>

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
                  </VStack>
                </Card.Root>
              ))}
            </VStack>

            {/* Fixed Pagination Controls */}
            <Card.Root p={4} mt={6}>
              <HStack
                justify="space-between"
                align="center"
                flexWrap="wrap"
                gap={4}
              >
                <Text fontSize="sm" color="gray.600">
                  Showing {indexOfFirstRecord + 1} to{' '}
                  {Math.min(indexOfLastRecord, filteredAttendance.length)} of{' '}
                  {filteredAttendance.length} records
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

                  {/* Desktop Page Numbers - FIXED */}
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

        {/* Detail Modal */}
        {selectedRecord && (
          <>
            <Box
              position="fixed"
              inset={0}
              bg="blackAlpha.600"
              zIndex={999}
              onClick={closeDetailModal}
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
                    Attendance Details
                  </Text>
                  <Box
                    as="button"
                    onClick={closeDetailModal}
                    cursor="pointer"
                    fontSize="24px"
                    color="gray.500"
                    _hover={{ color: 'gray.700' }}
                  >
                    ✕
                  </Box>
                </HStack>

                <VStack align="stretch" gap={4} pt={4}>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Date
                    </Text>
                    <Text fontSize="md" fontWeight="medium">
                      {formatDate(selectedRecord.workDate)}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Project
                    </Text>
                    <Text fontSize="md" fontWeight="medium">
                      {selectedRecord.projectAssignment.project.projectName}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Client:{' '}
                      {selectedRecord.projectAssignment.project.client.name}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Attendance Type
                    </Text>
                    <Box
                      px={3}
                      py={1}
                      borderRadius="full"
                      bg={`${getStatusColor(selectedRecord.attendanceType)}.100`}
                      color={`${getStatusColor(selectedRecord.attendanceType)}.700`}
                      fontSize="sm"
                      fontWeight="medium"
                      display="inline-block"
                    >
                      {getStatusLabel(selectedRecord.attendanceType)}
                    </Box>
                  </Box>

                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        Start Time
                      </Text>
                      <Text fontSize="md">
                        {formatTime(selectedRecord.startTime)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        End Time
                      </Text>
                      <Text fontSize="md">
                        {formatTime(selectedRecord.endTime)}
                      </Text>
                    </Box>
                  </Grid>

                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        Work Location
                      </Text>
                      <Text fontSize="md">
                        {selectedRecord.workLocation || '-'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        Break Hours
                      </Text>
                      <Text fontSize="md">{selectedRecord.breakHours}h</Text>
                    </Box>
                  </Grid>

                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Work Description
                    </Text>
                    <Box
                      p={3}
                      bg="gray.50"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                    >
                      <Text
                        fontSize="sm"
                        color="gray.700"
                        whiteSpace="pre-wrap"
                      >
                        {selectedRecord.workDescription ||
                          'No description provided'}
                      </Text>
                    </Box>
                  </Box>

                  <Grid
                    templateColumns="repeat(2, 1fr)"
                    gap={4}
                    pt={4}
                    borderTop="1px solid"
                    borderColor="gray.200"
                  >
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        Submitted At
                      </Text>
                      <Text fontSize="sm">
                        {selectedRecord.submittedAt
                          ? new Date(
                              selectedRecord.submittedAt
                            ).toLocaleString()
                          : selectedRecord.createdAt
                            ? new Date(
                                selectedRecord.createdAt
                              ).toLocaleString()
                            : 'N/A'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        Last Updated
                      </Text>
                      <Text fontSize="sm">
                        {new Date(selectedRecord.updatedAt).toLocaleString()}
                      </Text>
                    </Box>
                  </Grid>
                </VStack>

                <HStack justify="flex-end" pt={4}>
                  <Button onClick={closeDetailModal} colorScheme="blue">
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
