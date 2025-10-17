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
import {
  LuClipboard,
  LuCheck,
  LuUsers,
  LuFolderOpen,
  LuSearch,
  LuRefreshCw,
  LuTrash2,
  LuCircleAlert,
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
    if (
      !confirm(
        `Are you sure you want to end the assignment for ${engineerName}?`
      )
    ) {
      return;
    }

    try {
      await assignmentService.updateAssignment(id, {
        assignmentEnd: new Date().toISOString().split('T')[0],
        isActive: false,
      });

      toaster.create({
        title: 'Assignment ended',
        description: `Assignment for ${engineerName} has been ended`,
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
        title: 'Error',
        description: errorMessage || 'Failed to end assignment',
        type: 'error',
        duration: 4000,
      });
    }
  };

  const handleDeleteAssignment = async (id: string, engineerName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the assignment for ${engineerName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await assignmentService.deleteAssignment(id);

      toaster.create({
        title: 'Assignment deleted',
        description: `Assignment for ${engineerName} has been deleted`,
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
        title: 'Error',
        description: errorMessage || 'Failed to delete assignment',
        type: 'error',
        duration: 4000,
      });
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
        pageTitle="Project Assignment Management"
        pageSubtitle="Link engineers to projects for attendance tracking and billing"
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
                  Total
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
                  Active
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
                  Engineers
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
                  Projects
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
              <Text color="gray.600">Loading assignments...</Text>
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
              <LuCircleAlert size={24} color="red" />
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

        {!loading && !error && filteredAssignments.length === 0 && (
          <Card.Root p={8}>
            <VStack gap={4}>
              <LuClipboard size={48} color="gray" />
              <Text fontSize="lg" fontWeight="bold">
                No Assignments Found
              </Text>
              <Text color="gray.600" textAlign="center">
                {assignments.length === 0
                  ? 'No assignments have been created yet. Create your first assignment to link engineers to projects.'
                  : 'No assignments match your filters.'}
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
                    placeholder="Search by engineer, project, or client..."
                    size={{ base: 'sm', md: 'md' }}
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
                      <option value="all">All Assignments</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>
                  </Box>

                  <HStack gap={2}>
                    <Text fontSize={{ base: '2xs', md: 'xs' }} color="gray.600">
                      {filteredAssignments.length} results
                    </Text>
                    <Button
                      onClick={fetchAssignments}
                      size={{ base: 'xs', md: 'sm' }}
                      variant="ghost"
                      colorScheme="blue"
                    >
                      <LuRefreshCw size={14} />
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
                      Engineer
                    </Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs">
                      Project
                    </Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs">
                      Client
                    </Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs">
                      Start Date
                    </Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs">
                      End Date
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
                          {assignment.isActive ? 'Active' : 'Ended'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <HStack gap={2}>
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
                            >
                              End
                            </Button>
                          )}
                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() =>
                              handleDeleteAssignment(
                                assignment.id,
                                assignment.engineer.fullName
                              )
                            }
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
                          {assignment.isActive ? 'Active' : 'Ended'}
                        </Badge>
                      </HStack>

                      {/* Project & Client */}
                      <VStack align="stretch" gap={1}>
                        <HStack justify="space-between">
                          <Text fontSize="2xs" color="gray.500">
                            Project:
                          </Text>
                          <Text fontSize="xs" fontWeight="medium">
                            {assignment.project.projectName}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="2xs" color="gray.500">
                            Client:
                          </Text>
                          <Text fontSize="xs">
                            {assignment.project.client.name}
                          </Text>
                        </HStack>
                      </VStack>

                      {/* Dates */}
                      <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                        <VStack align="start" gap={0}>
                          <Text fontSize="2xs" color="gray.500">
                            Start
                          </Text>
                          <Text fontSize="xs" fontWeight="medium">
                            {new Date(
                              assignment.assignmentStart
                            ).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Text>
                        </VStack>
                        <VStack align="start" gap={0}>
                          <Text fontSize="2xs" color="gray.500">
                            End
                          </Text>
                          <Text fontSize="xs" fontWeight="medium">
                            {assignment.assignmentEnd
                              ? new Date(
                                  assignment.assignmentEnd
                                ).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '-'}
                          </Text>
                        </VStack>
                      </Grid>

                      {/* Actions */}
                      <HStack gap={2} mt={1}>
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
                          >
                            End
                          </Button>
                        )}
                        <Button
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() =>
                            handleDeleteAssignment(
                              assignment.id,
                              assignment.engineer.fullName
                            )
                          }
                        >
                          <LuTrash2 size={14} />
                        </Button>
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
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, filteredAssignments.length)} of{' '}
                    {filteredAssignments.length}
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
                      Previous
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
                      Next
                    </Button>
                  </HStack>
                </HStack>
              </Box>
            )}
          </Card.Root>
        )}
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
