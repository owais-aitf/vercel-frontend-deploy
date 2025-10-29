'use client';

import { useState, useEffect, useContext } from 'react';
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
  Badge,
  Input,
  Table,
} from '@chakra-ui/react';
import {
  LuClipboard,
  LuCheck,
  LuUsers,
  LuFolderOpen,
  LuSearch,
  LuTrash2,
  LuPencil,
} from 'react-icons/lu';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { salesNavigation } from '@/shared/config/navigation';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { AuthContext } from '@/context/AuthContext';
import {
  assignmentService,
  ProjectAssignment,
} from '@/shared/service/assignmentService';
import { toaster } from '@/components/ui/toaster';
import { assignmentTabs } from '@/shared/config/assignmentTabs';

export default function AssignmentsPage() {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation('sales');
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<
    ProjectAssignment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Edit modal state
  const [selectedAssignment, setSelectedAssignment] =
    useState<ProjectAssignment | null>(null);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    assignmentStart: '',
    assignmentEnd: '',
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await assignmentService.getAllAssignments();
      const assignmentsData = response.data || [];
      setAssignments(assignmentsData);
      setFilteredAssignments(assignmentsData);
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      setError(errorMessage || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...assignments];

    if (statusFilter === 'active') {
      filtered = filtered.filter((assignment) => assignment.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((assignment) => !assignment.isActive);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (assignment) =>
          assignment.engineer.fullName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          assignment.engineer.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          assignment.project.projectName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          assignment.project.client.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAssignments(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, assignments]);

  const handleEndAssignment = async (id: string, engineerName: string) => {
    if (!confirm(t('assignments.confirm_end', { name: engineerName }))) {
      return;
    }

    try {
      await assignmentService.updateAssignment(id, {
        assignmentEnd: new Date().toISOString().split('T')[0],
        isActive: false,
      });

      toaster.create({
        title: t('assignments.end_success'),
        description: t('assignments.end_description', { name: engineerName }),
        type: 'success',
        duration: 3000,
      });

      fetchAssignments();
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toaster.create({
        title: t('assignments.error'),
        description: errorMessage || t('assignments.error_ending'),
        type: 'error',
        duration: 4000,
      });
    }
  };

  const handleDeleteAssignment = async (id: string, engineerName: string) => {
    if (!confirm(t('assignments.confirm_delete', { name: engineerName }))) {
      return;
    }

    try {
      await assignmentService.deleteAssignment(id);

      toaster.create({
        title: t('assignments.delete_success'),
        description: t('assignments.delete_description', {
          name: engineerName,
        }),
        type: 'success',
        duration: 3000,
      });

      fetchAssignments();
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toaster.create({
        title: t('assignments.error'),
        description: errorMessage || t('assignments.error_deleting'),
        type: 'error',
        duration: 4000,
      });
    }
  };

  const handleEditAssignment = (assignment: ProjectAssignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      assignmentStart: assignment.assignmentStart.split('T')[0],
      assignmentEnd: assignment.assignmentEnd
        ? assignment.assignmentEnd.split('T')[0]
        : '',
    });
  };

  const handleUpdateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAssignment) return;

    try {
      setUpdating(true);
      await assignmentService.updateAssignment(selectedAssignment.id, {
        assignmentStart: formData.assignmentStart,
        assignmentEnd: formData.assignmentEnd || undefined,
      });

      toaster.create({
        title: t('assignments.update_success'),
        description: t('assignments.update_description', {
          name: selectedAssignment.engineer.fullName,
        }),
        type: 'success',
        duration: 3000,
      });

      // Refresh assignments list
      await fetchAssignments();
      setSelectedAssignment(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toaster.create({
        title: t('assignments.error'),
        description: errorMessage || t('assignments.error_updating'),
        type: 'error',
        duration: 4000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const activeCount = assignments.filter((a) => a.isActive).length;
  const uniqueEngineers = new Set(assignments.map((a) => a.engineer.fullName))
    .size;
  const uniqueProjects = new Set(assignments.map((a) => a.project.projectName))
    .size;

  // Pagination
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssignments = filteredAssignments.slice(startIndex, endIndex);

  return (
    <FeatureErrorBoundary featureName="Assignments">
      <DashboardLayout
        navigation={salesNavigation}
        pageTitle={t('assignments.page_title')}
        pageSubtitle={t('assignments.page_subtitle')}
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
        <TabNavigation tabs={assignmentTabs} />

        {/* Stats Cards - Clean Horizontal Layout with React Icons */}
        <Grid
          templateColumns={{
            base: 'repeat(2, 1fr)', // Mobile: 2x2 grid
            md: 'repeat(4, 1fr)', // Desktop: 4 columns in a row
          }}
          gap={{ base: 3, md: 4 }}
          mb={{ base: 4, md: 6 }}
        >
          {/* Total Assignments */}
          <Card.Root bg="blue.50" borderRadius="lg">
            <Card.Body p={{ base: 3, md: 4 }}>
              <VStack align="start" gap={1} position="relative">
                <Text
                  fontSize={{ base: '2xs', md: 'xs' }}
                  color="blue.700"
                  fontWeight="medium"
                >
                  {t('assignments.stats.total')}
                </Text>
                <Text
                  fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                  fontWeight="bold"
                  color="blue.600"
                >
                  {assignments.length}
                </Text>
                {/* Optional: Icon in corner */}
                <Box
                  position="absolute"
                  top={0}
                  right={0}
                  color="blue.400"
                  opacity={0.3}
                >
                  <LuClipboard size={24} />
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Active Assignments */}
          <Card.Root bg="green.50" borderRadius="lg">
            <Card.Body p={{ base: 3, md: 4 }}>
              <VStack align="start" gap={1} position="relative">
                <Text
                  fontSize={{ base: '2xs', md: 'xs' }}
                  color="green.700"
                  fontWeight="medium"
                >
                  {t('assignments.stats.active')}
                </Text>
                <Text
                  fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                  fontWeight="bold"
                  color="green.600"
                >
                  {activeCount}
                </Text>
                <Box
                  position="absolute"
                  top={0}
                  right={0}
                  color="green.400"
                  opacity={0.3}
                >
                  <LuCheck size={24} />
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Engineers */}
          <Card.Root bg="purple.50" borderRadius="lg">
            <Card.Body p={{ base: 3, md: 4 }}>
              <VStack align="start" gap={1} position="relative">
                <Text
                  fontSize={{ base: '2xs', md: 'xs' }}
                  color="purple.700"
                  fontWeight="medium"
                >
                  {t('assignments.stats.engineers')}
                </Text>
                <Text
                  fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                  fontWeight="bold"
                  color="purple.600"
                >
                  {uniqueEngineers}
                </Text>
                <Box
                  position="absolute"
                  top={0}
                  right={0}
                  color="purple.400"
                  opacity={0.3}
                >
                  <LuUsers size={24} />
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Projects */}
          <Card.Root bg="orange.50" borderRadius="lg">
            <Card.Body p={{ base: 3, md: 4 }}>
              <VStack align="start" gap={1} position="relative">
                <Text
                  fontSize={{ base: '2xs', md: 'xs' }}
                  color="orange.700"
                  fontWeight="medium"
                >
                  {t('assignments.stats.projects')}
                </Text>
                <Text
                  fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                  fontWeight="bold"
                  color="orange.600"
                >
                  {uniqueProjects}
                </Text>
                <Box
                  position="absolute"
                  top={0}
                  right={0}
                  color="orange.400"
                  opacity={0.3}
                >
                  <LuFolderOpen size={24} />
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Grid>

        {/* Loading/Error States */}
        {loading && (
          <Card.Root p={8}>
            <VStack gap={4}>
              <HStack gap={2}>
                <Box
                  w="12px"
                  h="12px"
                  borderRadius="full"
                  bg="blue.500"
                  animation="bounce 1.4s infinite ease-in-out"
                  style={{ animationDelay: '0s' }}
                />
                <Box
                  w="12px"
                  h="12px"
                  borderRadius="full"
                  bg="blue.500"
                  animation="bounce 1.4s infinite ease-in-out"
                  style={{ animationDelay: '0.2s' }}
                />
                <Box
                  w="12px"
                  h="12px"
                  borderRadius="full"
                  bg="blue.500"
                  animation="bounce 1.4s infinite ease-in-out"
                  style={{ animationDelay: '0.4s' }}
                />
              </HStack>
              <Text fontSize="lg" fontWeight="bold">
                {t('assignments.loading')}
              </Text>
              <Text color="gray.600">
                {t('assignments.loading_assignments')}
              </Text>
            </VStack>

            {/* Add CSS */}
            <style jsx>{`
              @keyframes bounce {
                0%,
                80%,
                100% {
                  transform: translateY(0);
                }
                40% {
                  transform: translateY(-20px);
                }
              }
            `}</style>
          </Card.Root>
        )}

        {error && !loading && (
          <Card.Root p={6} bg="red.50">
            <HStack gap={3}>
              <Text fontSize="lg" fontWeight="bold" color="red.600">
                {t('assignments.error')}
              </Text>
              <VStack align="start" gap={1}>
                <Text fontWeight="bold" color="red.700">
                  {t('assignments.error')}
                </Text>
                <Text fontSize="sm" color="red.600">
                  {error}
                </Text>
              </VStack>
            </HStack>
          </Card.Root>
        )}

        {!loading && !error && filteredAssignments.length === 0 && (
          <Card.Root p={8}>
            <VStack gap={4}>
              <LuClipboard size={48} color="gray" />
              <Text fontSize="lg" fontWeight="bold" color="gray.500">
                {t('assignments.no_data')}
              </Text>
              <Text fontSize="lg" fontWeight="bold">
                {t('assignments.no_assignments')}
              </Text>
              <Text color="gray.600" textAlign="center">
                {assignments.length === 0
                  ? t('assignments.no_assignments_created')
                  : t('assignments.no_assignments_match')}
              </Text>
            </VStack>
          </Card.Root>
        )}

        {/* Assignments Table/Cards */}
        {!loading && !error && filteredAssignments.length > 0 && (
          <Card.Root>
            {/* Filters Header */}
            <Box
              p={{ base: 3, md: 4 }}
              borderBottom="1px solid"
              borderColor="gray.200"
              bg="gray.50"
            >
              <VStack gap={3} align="stretch">
                {/* Search with Icon */}
                <HStack gap={2} w="full">
                  <Box color="gray.400">
                    <LuSearch size={18} />
                  </Box>
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('assignments.search_placeholder')}
                    size="sm"
                    bg="white"
                    flex={1}
                    fontSize={{ base: 'xs', md: 'sm' }}
                  />
                </HStack>

                {/* Status Filter and Refresh */}
                <HStack justify="space-between" flexWrap="wrap" gap={2}>
                  <Box minW={{ base: '140px', md: '160px' }}>
                    <select
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(
                          e.target.value as 'all' | 'active' | 'inactive'
                        )
                      }
                      style={{
                        width: '100%',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: 'white',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="all">{t('assignments.filter_all')}</option>
                      <option value="active">
                        {t('assignments.filter_active')}
                      </option>
                      <option value="inactive">
                        {t('assignments.filter_inactive')}
                      </option>
                    </select>
                  </Box>

                  <HStack gap={3}>
                    <Text fontSize="xs" color="gray.600">
                      {t('assignments.results', {
                        count: filteredAssignments.length,
                      })}
                    </Text>
                    <Button
                      onClick={fetchAssignments}
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      fontSize="xs"
                    >
                      {t('assignments.refresh')}
                    </Button>
                  </HStack>
                </HStack>
              </VStack>
            </Box>

            {/* Desktop Table View */}
            <Box overflowX="auto" display={{ base: 'none', lg: 'block' }}>
              <Table.Root size="sm" variant="line">
                <Table.Header>
                  <Table.Row bg="white">
                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs">
                      {t('assignments.engineer')}
                    </Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs">
                      {t('assignments.project')}
                    </Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs">
                      {t('assignments.client')}
                    </Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs">
                      {t('assignments.start_date')}
                    </Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs">
                      {t('assignments.end_date')}
                    </Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs">
                      {t('assignments.status')}
                    </Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs">
                      {t('assignments.actions')}
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedAssignments.map((assignment) => (
                    <Table.Row key={assignment.id}>
                      <Table.Cell>
                        <VStack align="start" gap={0}>
                          <Text fontSize="sm" fontWeight="semibold">
                            {assignment.engineer.fullName}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {assignment.engineer.email}
                          </Text>
                        </VStack>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm" fontWeight="medium">
                          {assignment.project.projectName}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm">
                          {assignment.project.client.name}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm">
                          {new Date(
                            assignment.assignmentStart
                          ).toLocaleDateString()}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm">
                          {assignment.assignmentEnd
                            ? new Date(
                                assignment.assignmentEnd
                              ).toLocaleDateString()
                            : '-'}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          colorScheme={assignment.isActive ? 'green' : 'gray'}
                          fontSize="xs"
                        >
                          {assignment.isActive
                            ? t('assignments.active')
                            : t('assignments.ended')}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <HStack gap={2}>
                          <Button
                            size="xs"
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => handleEditAssignment(assignment)}
                            title="Edit assignment dates"
                          >
                            <LuPencil
                              size={14}
                              style={{ marginRight: '6px' }}
                            />
                            {t('assignments.edit')}
                          </Button>
                          {assignment.isActive && (
                            <Button
                              size="xs"
                              colorScheme="orange"
                              variant="outline"
                              onClick={() =>
                                handleEndAssignment(
                                  assignment.id,
                                  assignment.engineer.fullName
                                )
                              }
                              title={t('assignments.end')}
                            >
                              {t('assignments.end')}
                            </Button>
                          )}
                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="outline"
                            onClick={() =>
                              handleDeleteAssignment(
                                assignment.id,
                                assignment.engineer.fullName
                              )
                            }
                            title="Delete"
                          >
                            <LuTrash2 size={14} />
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
              display={{ base: 'flex', lg: 'none' }}
              align="stretch"
              gap={3}
              p={{ base: 3, md: 4 }}
            >
              {paginatedAssignments.map((assignment) => (
                <Card.Root key={assignment.id} borderWidth="1px">
                  <Card.Body p={3}>
                    <VStack align="stretch" gap={2}>
                      {/* Engineer & Status */}
                      <HStack justify="space-between" align="start">
                        <VStack align="start" gap={0} flex={1}>
                          <Text fontSize="sm" fontWeight="bold">
                            {assignment.engineer.fullName}
                          </Text>
                          <Text fontSize="2xs" color="gray.600">
                            {assignment.engineer.email}
                          </Text>
                        </VStack>
                        <Badge
                          colorScheme={assignment.isActive ? 'green' : 'gray'}
                          fontSize="2xs"
                        >
                          {assignment.isActive
                            ? t('assignments.active')
                            : t('assignments.ended')}
                        </Badge>
                      </HStack>

                      {/* Project & Client */}
                      <VStack align="stretch" gap={1}>
                        <HStack justify="space-between">
                          <Text fontSize="2xs" color="gray.500">
                            {t('assignments.project')}:
                          </Text>
                          <Text fontSize="xs" fontWeight="medium">
                            {assignment.project.projectName}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="2xs" color="gray.500">
                            {t('assignments.client')}:
                          </Text>
                          <Text fontSize="xs">
                            {assignment.project.client.name}
                          </Text>
                        </HStack>
                      </VStack>

                      {/* Status & Actions */}
                      <HStack
                        justify="space-between"
                        pt={2}
                        borderTop="1px solid"
                        borderColor="gray.100"
                      >
                        <Badge
                          colorScheme={assignment.isActive ? 'green' : 'gray'}
                          fontSize="xs"
                        >
                          {assignment.isActive
                            ? t('assignments.active')
                            : t('assignments.ended')}
                        </Badge>
                        <HStack gap={2}>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => handleEditAssignment(assignment)}
                            fontSize="xs"
                            title="Edit assignment dates"
                          >
                            <LuPencil
                              size={14}
                              style={{ marginRight: '6px' }}
                            />
                            {t('assignments.edit')}
                          </Button>
                          {assignment.isActive && (
                            <Button
                              size="xs"
                              colorScheme="orange"
                              variant="outline"
                              flex={1}
                              onClick={() =>
                                handleEndAssignment(
                                  assignment.id,
                                  assignment.engineer.fullName
                                )
                              }
                              fontSize="xs"
                              title={t('assignments.end')}
                            >
                              {t('assignments.end')}
                            </Button>
                          )}
                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="outline"
                            onClick={() =>
                              handleDeleteAssignment(
                                assignment.id,
                                assignment.engineer.fullName
                              )
                            }
                            title="Delete"
                          >
                            <LuTrash2 size={16} />
                          </Button>
                        </HStack>
                      </HStack>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              ))}
            </VStack>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box
                p={4}
                borderTop="1px solid"
                borderColor="gray.200"
                bg="white"
              >
                <HStack justify="space-between" flexWrap="wrap" gap={3}>
                  <Text fontSize={{ base: '2xs', md: 'xs' }} color="gray.600">
                    {t('assignments.pagination.showing', {
                      start: startIndex + 1,
                      end: Math.min(endIndex, filteredAssignments.length),
                      total: filteredAssignments.length,
                    })}
                  </Text>

                  <HStack gap={2}>
                    <Button
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      variant="outline"
                      fontSize={{ base: '2xs', md: 'xs' }}
                    >
                      {t('assignments.pagination.previous')}
                    </Button>

                    <HStack gap={1} display={{ base: 'none', md: 'flex' }}>
                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              variant={
                                currentPage === pageNum ? 'solid' : 'outline'
                              }
                              colorScheme={
                                currentPage === pageNum ? 'blue' : 'gray'
                              }
                              minW="32px"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </HStack>

                    <Text fontSize="xs" display={{ base: 'block', md: 'none' }}>
                      {currentPage}/{totalPages}
                    </Text>

                    <Button
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      variant="outline"
                      fontSize={{ base: '2xs', md: 'xs' }}
                    >
                      {t('assignments.pagination.next')}
                    </Button>
                  </HStack>
                </HStack>
              </Box>
            )}
          </Card.Root>
        )}

        {/* Edit Assignment Modal */}
        {selectedAssignment && (
          <>
            {/* Backdrop */}
            <Box
              position="fixed"
              inset={0}
              bg="blackAlpha.600"
              zIndex={999}
              onClick={() => setSelectedAssignment(null)}
            />

            {/* Modal */}
            <Box
              position="fixed"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              bg="white"
              borderRadius="xl"
              shadow="2xl"
              zIndex={1000}
              w={{ base: '95%', md: '90%', lg: '800px' }}
              maxH="90vh"
              overflowY="auto"
            >
              <VStack align="stretch" gap={0}>
                {/* Modal Header */}
                <HStack
                  justify="space-between"
                  p={6}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  bg="blue.50"
                >
                  <VStack align="start" gap={1}>
                    <Text fontSize="xl" fontWeight="bold">
                      {t('assignments.edit_modal.title')}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {t('assignments.edit_modal.subtitle')}
                    </Text>
                  </VStack>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedAssignment(null)}
                  >
                    ✕
                  </Button>
                </HStack>

                {/* Modal Content */}
                <Box p={6}>
                  <VStack align="stretch" gap={6}>
                    {/* Current Info Display */}
                    <Card.Root p={4} bg="gray.50">
                      <VStack align="stretch" gap={2}>
                        <HStack>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="gray.700"
                          >
                            {t('assignments.edit_modal.engineer_label')}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {selectedAssignment.engineer.fullName}
                          </Text>
                        </HStack>
                        <HStack>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="gray.700"
                          >
                            {t('assignments.edit_modal.project_label')}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {selectedAssignment.project.projectName}
                          </Text>
                        </HStack>
                        <HStack>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="gray.700"
                          >
                            {t('assignments.edit_modal.client_label')}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {selectedAssignment.project.client.name}
                          </Text>
                        </HStack>
                        <HStack>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="gray.700"
                          >
                            {t('assignments.edit_modal.status_label')}
                          </Text>
                          <Badge
                            colorScheme={
                              selectedAssignment.isActive ? 'green' : 'gray'
                            }
                          >
                            {selectedAssignment.isActive
                              ? t('assignments.active')
                              : t('assignments.ended')}
                          </Badge>
                        </HStack>
                      </VStack>
                    </Card.Root>

                    <form onSubmit={handleUpdateAssignment}>
                      <VStack align="stretch" gap={5}>
                        {/* Assignment Start Date */}
                        <Box>
                          <Text
                            fontSize="sm"
                            mb={2}
                            fontWeight="medium"
                            color="gray.700"
                          >
                            {t('assignments.edit_modal.start_date_label')}{' '}
                            <Text as="span" color="red.500">
                              {t('assignments.edit_modal.required')}
                            </Text>
                          </Text>
                          <Input
                            type="date"
                            value={formData.assignmentStart}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                assignmentStart: e.target.value,
                              })
                            }
                            required
                            size="lg"
                          />
                        </Box>

                        {/* Assignment End Date */}
                        <Box>
                          <Text
                            fontSize="sm"
                            mb={2}
                            fontWeight="medium"
                            color="gray.700"
                          >
                            {t('assignments.edit_modal.end_date_label')}
                          </Text>
                          <Input
                            type="date"
                            value={formData.assignmentEnd}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                assignmentEnd: e.target.value,
                              })
                            }
                            size="lg"
                            min={formData.assignmentStart}
                          />
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            {t('assignments.edit_modal.end_date_note')}
                          </Text>
                        </Box>

                        {/* Action Buttons */}
                        <HStack gap={3} pt={2}>
                          <Button
                            type="submit"
                            colorScheme="blue"
                            size="lg"
                            loading={updating}
                            loadingText={t('assignments.edit_modal.updating')}
                            flex={1}
                          >
                            {t('assignments.edit_modal.update')}
                          </Button>
                          {selectedAssignment.isActive && (
                            <Button
                              type="button"
                              colorScheme="orange"
                              variant="outline"
                              size="lg"
                              onClick={() => {
                                handleEndAssignment(
                                  selectedAssignment.id,
                                  selectedAssignment.engineer.fullName
                                );
                                setSelectedAssignment(null);
                              }}
                            >
                              {t('assignments.edit_modal.end_assignment')}
                            </Button>
                          )}
                        </HStack>
                      </VStack>
                    </form>

                    {/* Warning */}
                    <Card.Root
                      p={4}
                      bg="yellow.50"
                      borderColor="yellow.300"
                      borderWidth={1}
                    >
                      <HStack gap={2}>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color="yellow.700"
                        >
                          {t('assignments.edit_modal.warning_title')}
                        </Text>
                        <VStack align="start" gap={1}>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="yellow.900"
                          >
                            {t('assignments.edit_modal.warning_subtitle')}
                          </Text>
                          <Text fontSize="xs" color="yellow.800">
                            {t('assignments.edit_modal.warning_dates')}
                            <br />
                            {t('assignments.edit_modal.warning_end')}
                            <br />
                            {t('assignments.edit_modal.warning_reactivate')}
                          </Text>
                        </VStack>
                      </HStack>
                    </Card.Root>
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </>
        )}
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
