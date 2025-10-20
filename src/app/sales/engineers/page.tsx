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
  Table,
} from '@chakra-ui/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { salesNavigation } from '@/shared/config/navigation';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { AuthContext } from '@/context/AuthContext';
import { engineerService, Engineer } from '@/shared/service/engineerService';
import { toaster } from '@/components/ui/toaster';
import { engineerTabs } from '@/shared/config/engineerTabs';
import {
  LuMail,
  LuMessageSquare,
  LuCalendarDays,
  LuCircleCheck,
  LuClock,
  LuBell,
} from 'react-icons/lu';

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

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEngineer, setEditingEngineer] = useState<Engineer | null>(null);
  const [updating, setUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    slackUserId: '',
    annualPaidLeaveAllowance: 10,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const handleEditClick = (engineer: Engineer) => {
    setEditingEngineer(engineer);
    setEditFormData({
      fullName: engineer.fullName,
      slackUserId: engineer.slackUserId || '',
      annualPaidLeaveAllowance: engineer.annualPaidLeaveAllowance,
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (field: string, value: string | number) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateEngineer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingEngineer) return;

    try {
      setUpdating(true);
      await engineerService.updateEngineer(editingEngineer.id, {
        fullName: editFormData.fullName,
        slackUserId: editFormData.slackUserId || undefined,
        annualPaidLeaveAllowance: editFormData.annualPaidLeaveAllowance,
      });

      toaster.create({
        title: 'Engineer updated successfully!',
        description: `Updated ${editFormData.fullName}`,
        type: 'success',
        duration: 3000,
      });

      // Refresh engineers list
      await fetchEngineers();
      setIsEditModalOpen(false);
      setEditingEngineer(null);
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toaster.create({
        title: 'Update failed',
        description: err?.response?.data?.error || 'Failed to update engineer',
        type: 'error',
        duration: 4000,
      });
    } finally {
      setUpdating(false);
    }
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredEngineers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEngineers = filteredEngineers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

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

        {/* Engineers Table */}
        {!loading && !error && filteredEngineers.length > 0 && (
          <Card.Root>
            {/* Filters Header */}
            <Box
              p={{ base: 3, md: 4 }}
              borderBottom="1px solid"
              borderColor="gray.200"
              bg="gray.50"
            >
              <VStack gap={3} align="stretch">
                <Grid
                  templateColumns={{ base: '1fr', md: '1fr auto' }}
                  gap={3}
                  alignItems="end"
                >
                  {/* Search */}
                  <Box>
                    <Text
                      fontSize="xs"
                      mb={1.5}
                      fontWeight="medium"
                      color="gray.600"
                    >
                      Search
                    </Text>
                    <Input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name, email, or Slack ID..."
                      size="sm"
                      bg="white"
                      fontSize="sm"
                    />
                  </Box>

                  {/* Status Filter */}
                  <Box minW={{ base: 'full', md: '200px' }}>
                    <Text
                      fontSize="xs"
                      mb={1.5}
                      fontWeight="medium"
                      color="gray.600"
                    >
                      Status
                    </Text>
                    <select
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(
                          e.target.value as 'all' | 'active' | 'inactive'
                        )
                      }
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '0 12px',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: 'white',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="all">All Engineers</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>
                  </Box>
                </Grid>

                {/* Results and Refresh */}
                <HStack justify="space-between" flexWrap="wrap" gap={2}>
                  <Text fontSize="xs" color="gray.600">
                    Showing{' '}
                    <strong>
                      {startIndex + 1}-
                      {Math.min(endIndex, filteredEngineers.length)}
                    </strong>{' '}
                    of <strong>{filteredEngineers.length}</strong> engineers
                  </Text>
                  <Button
                    onClick={fetchEngineers}
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    fontSize="xs"
                  >
                    Refresh
                  </Button>
                </HStack>
              </VStack>
            </Box>

            {/* Desktop Table View */}
            <Box overflowX="auto" display={{ base: 'none', lg: 'block' }}>
              <Table.Root size="sm" variant="line">
                <Table.Header>
                  <Table.Row bg="white">
                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs">
                      Engineer
                    </Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs">
                      Slack ID
                    </Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs">
                      Leave Status
                    </Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs">
                      Last Login
                    </Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs">
                      Status
                    </Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs">
                      Actions
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedEngineers.map((engineer) => (
                    <Table.Row
                      key={engineer.id}
                      bg={
                        selectedEngineer?.id === engineer.id ||
                        editingEngineer?.id === engineer.id
                          ? 'blue.50'
                          : 'transparent'
                      }
                      _hover={{ bg: 'gray.50' }}
                      transition="background 0.2s"
                    >
                      <Table.Cell>
                        <VStack align="start" gap={0}>
                          <Text fontSize="sm" fontWeight="semibold">
                            {engineer.fullName}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {engineer.email}
                          </Text>
                        </VStack>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm" color="gray.700">
                          {engineer.slackUserId || '-'}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm">
                          {engineer.paidLeaveUsedThisYear}/
                          {engineer.annualPaidLeaveAllowance} days
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm" color="gray.700">
                          {engineer.lastLoginAt
                            ? new Date(
                                engineer.lastLoginAt
                              ).toLocaleDateString()
                            : 'Never'}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          colorScheme={engineer.isActive ? 'green' : 'red'}
                          fontSize="xs"
                        >
                          {engineer.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <HStack gap={2}>
                          <Button
                            size="xs"
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => openEngineerModal(engineer)}
                          >
                            View
                          </Button>
                          <Button
                            size="xs"
                            colorScheme="green"
                            variant="outline"
                            onClick={() => handleEditClick(engineer)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="xs"
                            colorScheme="purple"
                            variant="ghost"
                            onClick={() =>
                              handleSendReminder(engineer.id, engineer.fullName)
                            }
                            title="Send Reminder"
                          >
                            <LuBell size={16} />
                          </Button>
                        </HStack>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>

            {/* Mobile Card View */}
            <VStack
              gap={3}
              p={{ base: 3, md: 4 }}
              display={{ base: 'flex', lg: 'none' }}
            >
              {paginatedEngineers.map((engineer) => (
                <Card.Root
                  key={engineer.id}
                  w="full"
                  p={4}
                  borderWidth="1px"
                  bg={
                    selectedEngineer?.id === engineer.id ||
                    editingEngineer?.id === engineer.id
                      ? 'blue.50'
                      : 'white'
                  }
                  _hover={{ shadow: 'md' }}
                  transition="all 0.2s"
                >
                  <VStack align="stretch" gap={3}>
                    <HStack justify="space-between" align="start">
                      <VStack align="start" gap={0} flex={1}>
                        <Text fontSize="sm" fontWeight="bold">
                          {engineer.fullName}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {engineer.email}
                        </Text>
                      </VStack>
                      <Badge
                        colorScheme={engineer.isActive ? 'green' : 'red'}
                        fontSize="xs"
                      >
                        {engineer.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </HStack>

                    {engineer.slackUserId && (
                      <HStack gap={2}>
                        <Text fontSize="xs" color="gray.500">
                          Slack:
                        </Text>
                        <Text fontSize="xs" color="gray.700">
                          {engineer.slackUserId}
                        </Text>
                      </HStack>
                    )}

                    <HStack gap={2}>
                      <Text fontSize="xs" color="gray.500">
                        Leave:
                      </Text>
                      <Text fontSize="xs" color="gray.700">
                        {engineer.paidLeaveUsedThisYear}/
                        {engineer.annualPaidLeaveAllowance} days
                      </Text>
                    </HStack>

                    {engineer.lastLoginAt && (
                      <HStack gap={2}>
                        <Text fontSize="xs" color="gray.500">
                          Last Login:
                        </Text>
                        <Text fontSize="xs" color="gray.700">
                          {new Date(engineer.lastLoginAt).toLocaleDateString()}
                        </Text>
                      </HStack>
                    )}

                    <HStack gap={2} mt={2}>
                      <Button
                        size="xs"
                        colorScheme="blue"
                        variant="outline"
                        flex={1}
                        onClick={() => openEngineerModal(engineer)}
                      >
                        View
                      </Button>
                      <Button
                        size="xs"
                        colorScheme="green"
                        variant="outline"
                        flex={1}
                        onClick={() => handleEditClick(engineer)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        colorScheme="purple"
                        variant="ghost"
                        onClick={() =>
                          handleSendReminder(engineer.id, engineer.fullName)
                        }
                        title="Send Reminder"
                      >
                        <LuBell size={16} />
                      </Button>
                    </HStack>
                  </VStack>
                </Card.Root>
              ))}
            </VStack>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box
                p={{ base: 3, md: 4 }}
                borderTop="1px solid"
                borderColor="gray.200"
                bg="gray.50"
              >
                <HStack justify="space-between" flexWrap="wrap" gap={3}>
                  <Text fontSize="xs" color="gray.600">
                    Page {currentPage} of {totalPages}
                  </Text>
                  <HStack gap={2} flexWrap="wrap">
                    <Button
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      variant="outline"
                      fontSize="xs"
                    >
                      Previous
                    </Button>
                    {getPageNumbers().map((page, index) =>
                      page === '...' ? (
                        <Text key={`ellipsis-${index}`} px={2} color="gray.500">
                          ...
                        </Text>
                      ) : (
                        <Button
                          key={page}
                          size="sm"
                          onClick={() => goToPage(page as number)}
                          variant={currentPage === page ? 'solid' : 'outline'}
                          colorScheme={currentPage === page ? 'blue' : 'gray'}
                          fontSize="xs"
                          minW="36px"
                        >
                          {page}
                        </Button>
                      )
                    )}
                    <Button
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      fontSize="xs"
                    >
                      Next
                    </Button>
                  </HStack>
                </HStack>
              </Box>
            )}
          </Card.Root>
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
                      <LuMail size={16} color="#4299E1" />
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
                      <LuMessageSquare size={16} color="#805AD5" />
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
                          <HStack gap={1.5}>
                            <LuCalendarDays size={14} color="#805AD5" />
                            <Text fontSize="sm" color="gray.700">
                              Annual Allowance:
                            </Text>
                          </HStack>
                          <Text fontSize="sm" fontWeight="bold">
                            {selectedEngineer.annualPaidLeaveAllowance || 0}{' '}
                            days
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <HStack gap={1.5}>
                            <LuCalendarDays size={14} color="#805AD5" />
                            <Text fontSize="sm" color="gray.700">
                              Used This Year:
                            </Text>
                          </HStack>
                          <Text fontSize="sm" fontWeight="bold">
                            {selectedEngineer.paidLeaveUsedThisYear || 0} days
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <HStack gap={1.5}>
                            <LuCircleCheck size={14} color="#48BB78" />
                            <Text fontSize="sm" color="gray.700">
                              Remaining:
                            </Text>
                          </HStack>
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
                        <LuClock size={16} color="#718096" />
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

        {/* Edit Engineer Modal */}
        {isEditModalOpen && editingEngineer && (
          <>
            {/* Backdrop */}
            <Box
              position="fixed"
              inset={0}
              bg="blackAlpha.600"
              zIndex={999}
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingEngineer(null);
              }}
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
              w={{ base: 'auto', md: '500px' }}
              maxH={{ base: 'calc(100vh - 40px)', md: '80vh' }}
              overflowY="auto"
              p={{ base: 5, md: 6 }}
            >
              <form onSubmit={handleUpdateEngineer}>
                <VStack align="stretch" gap={4}>
                  {/* Header */}
                  <HStack
                    justify="space-between"
                    pb={3}
                    borderBottom="1px solid"
                    borderColor="gray.200"
                  >
                    <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold">
                      Edit Engineer
                    </Text>
                    <Box
                      as="button"
                      onClick={() => {
                        setIsEditModalOpen(false);
                        setEditingEngineer(null);
                      }}
                      cursor="pointer"
                      fontSize="24px"
                      color="gray.500"
                      _hover={{ color: 'gray.700' }}
                    >
                      ✕
                    </Box>
                  </HStack>

                  {/* Form Fields */}
                  <VStack align="stretch" gap={4}>
                    {/* Full Name */}
                    <Box>
                      <Text fontSize="sm" mb={2} fontWeight="medium">
                        Full Name{' '}
                        <Text as="span" color="red.500">
                          *
                        </Text>
                      </Text>
                      <Input
                        value={editFormData.fullName}
                        onChange={(e) =>
                          handleEditFormChange('fullName', e.target.value)
                        }
                        placeholder="Enter full name"
                        required
                      />
                    </Box>

                    {/* Slack User ID */}
                    <Box>
                      <Text fontSize="sm" mb={2} fontWeight="medium">
                        Slack User ID
                      </Text>
                      <Input
                        value={editFormData.slackUserId}
                        onChange={(e) =>
                          handleEditFormChange('slackUserId', e.target.value)
                        }
                        placeholder="U01ABC123XY (optional)"
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Leave empty if engineer doesn&apos;t use Slack
                      </Text>
                    </Box>

                    {/* Annual Paid Leave Allowance */}
                    <Box>
                      <Text fontSize="sm" mb={2} fontWeight="medium">
                        Annual Paid Leave Allowance (days){' '}
                        <Text as="span" color="red.500">
                          *
                        </Text>
                      </Text>
                      <Input
                        type="number"
                        value={editFormData.annualPaidLeaveAllowance}
                        onChange={(e) =>
                          handleEditFormChange(
                            'annualPaidLeaveAllowance',
                            parseInt(e.target.value)
                          )
                        }
                        min={0}
                        max={365}
                        required
                      />
                    </Box>
                  </VStack>

                  {/* Footer */}
                  <HStack
                    justify="flex-end"
                    gap={3}
                    pt={4}
                    borderTop="1px solid"
                    borderColor="gray.200"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditModalOpen(false);
                        setEditingEngineer(null);
                      }}
                      disabled={updating}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="green"
                      disabled={updating}
                    >
                      {updating ? 'Updating...' : 'Update Engineer'}
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </Box>
          </>
        )}
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
