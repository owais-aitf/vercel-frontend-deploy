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
import {
  assignmentService,
  ProjectAssignment,
} from '@/shared/service/assignmentService';
import { toaster } from '@/components/ui/toaster';

const assignmentTabs = [
  { label: 'View All Assignments', href: '/sales/assignments', icon: '📋' },
  { label: 'Create Assignment', href: '/sales/assignments/create', icon: '➕' },
  {
    label: 'Manage Assignments',
    href: '/sales/assignments/manage',
    icon: '⚙️',
  },
];

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

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((assignment) => assignment.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((assignment) => !assignment.isActive);
    }

    // Search filter
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

  // Get unique engineers and projects
  const uniqueEngineers = new Set(assignments.map((a) => a.engineer.fullName))
    .size;
  const uniqueProjects = new Set(assignments.map((a) => a.project.projectName))
    .size;

  // Pagination calculations
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssignments = filteredAssignments.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

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

        {/* Compact Stats Bar with Boxes */}
        <HStack
          p={4}
          bg="white"
          borderRadius="lg"
          shadow="sm"
          mb={4}
          flexWrap="wrap"
          gap={3}
        >
          {/* Total */}
          <Box
            p={3}
            bg="blue.50"
            borderRadius="md"
            border="1px solid"
            borderColor="blue.100"
            minW="100px"
          >
            <VStack align="start" gap={0}>
              <Text fontSize="xs" color="blue.700" fontWeight="medium">
                Total
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {assignments.length}
              </Text>
            </VStack>
          </Box>

          {/* Active */}
          <Box
            p={3}
            bg="green.50"
            borderRadius="md"
            border="1px solid"
            borderColor="green.100"
            minW="100px"
          >
            <VStack align="start" gap={0}>
              <Text fontSize="xs" color="green.700" fontWeight="medium">
                Active
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                {activeCount}
              </Text>
            </VStack>
          </Box>

          {/* Engineers */}
          <Box
            p={3}
            bg="purple.50"
            borderRadius="md"
            border="1px solid"
            borderColor="purple.100"
            minW="100px"
          >
            <VStack align="start" gap={0}>
              <Text fontSize="xs" color="purple.700" fontWeight="medium">
                Engineers
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                {uniqueEngineers}
              </Text>
            </VStack>
          </Box>

          {/* Projects */}
          <Box
            p={3}
            bg="orange.50"
            borderRadius="md"
            border="1px solid"
            borderColor="orange.100"
            minW="100px"
          >
            <VStack align="start" gap={0}>
              <Text fontSize="xs" color="orange.700" fontWeight="medium">
                Projects
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                {uniqueProjects}
              </Text>
            </VStack>
          </Box>
        </HStack>

        {/* Loading/Error/Empty States */}
        {loading && (
          <Card.Root p={8}>
            <VStack gap={4}>
              <Text fontSize="2xl">⏳</Text>
              <Text color="gray.600">Loading assignments...</Text>
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

        {!loading && !error && filteredAssignments.length === 0 && (
          <Card.Root p={8}>
            <VStack gap={4}>
              <Text fontSize="4xl">📋</Text>
              <Text fontSize="lg" fontWeight="bold">
                No Assignments Found
              </Text>
              <Text color="gray.600">
                {assignments.length === 0
                  ? 'No assignments have been created yet. Create your first assignment to link engineers to projects.'
                  : 'No assignments match your filters.'}
              </Text>
            </VStack>
          </Card.Root>
        )}

        {/* Assignments Table */}
        {!loading && !error && filteredAssignments.length > 0 && (
          <Card.Root>
            {/* Integrated Filters in Table Header */}
            <Box
              p={4}
              borderBottom="1px solid"
              borderColor="gray.200"
              bg="gray.50"
            >
              <HStack justify="space-between" flexWrap="wrap" gap={4}>
                <HStack gap={3} flex={1} flexWrap="wrap">
                  {/* Search */}
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="🔍 Search by engineer, project, or client..."
                    size="sm"
                    bg="white"
                    maxW={{ base: '100%', md: '300px' }}
                    fontSize="sm"
                  />

                  {/* Status Filter */}
                  <Box minW="150px">
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
                        outline: 'none',
                      }}
                    >
                      <option value="all">All Assignments</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>
                  </Box>
                </HStack>

                <HStack gap={3}>
                  <Text fontSize="xs" color="gray.600">
                    {filteredAssignments.length} results
                  </Text>
                  <Button
                    onClick={fetchAssignments}
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    fontSize="xs"
                  >
                    🔄 Refresh
                  </Button>
                </HStack>
              </HStack>
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
                            🗑️
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
              p={4}
            >
              {paginatedAssignments.map((assignment) => (
                <Box
                  key={assignment.id}
                  p={4}
                  bg="white"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.200"
                  shadow="sm"
                >
                  <VStack align="stretch" gap={3}>
                    {/* Engineer */}
                    <VStack align="start" gap={0}>
                      <Text fontSize="sm" fontWeight="bold">
                        {assignment.engineer.fullName}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {assignment.engineer.email}
                      </Text>
                    </VStack>

                    {/* Project & Client */}
                    <VStack align="stretch" gap={1}>
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.600">
                          Project:
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {assignment.project.projectName}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.600">
                          Client:
                        </Text>
                        <Text fontSize="sm">
                          {assignment.project.client.name}
                        </Text>
                      </HStack>
                    </VStack>

                    {/* Dates */}
                    <HStack justify="space-between" gap={4}>
                      <VStack align="start" gap={0} flex={1}>
                        <Text fontSize="xs" color="gray.600">
                          Start Date
                        </Text>
                        <Text fontSize="sm">
                          {new Date(
                            assignment.assignmentStart
                          ).toLocaleDateString()}
                        </Text>
                      </VStack>
                      <VStack align="start" gap={0} flex={1}>
                        <Text fontSize="xs" color="gray.600">
                          End Date
                        </Text>
                        <Text fontSize="sm">
                          {assignment.assignmentEnd
                            ? new Date(
                                assignment.assignmentEnd
                              ).toLocaleDateString()
                            : '-'}
                        </Text>
                      </VStack>
                    </HStack>

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
                        {assignment.isActive ? 'Active' : 'Ended'}
                      </Badge>
                      <HStack gap={2}>
                        {assignment.isActive && (
                          <Button
                            size="sm"
                            colorScheme="orange"
                            variant="outline"
                            onClick={() =>
                              handleEndAssignment(
                                assignment.id,
                                assignment.engineer.fullName
                              )
                            }
                            fontSize="xs"
                          >
                            End
                          </Button>
                        )}
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() =>
                            handleDeleteAssignment(
                              assignment.id,
                              assignment.engineer.fullName
                            )
                          }
                        >
                          🗑️
                        </Button>
                      </HStack>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </VStack>

            {/* Pagination */}
            {filteredAssignments.length > 0 && (
              <HStack
                justify="space-between"
                mt={6}
                p={4}
                bg="white"
                borderRadius="lg"
                border="1px solid"
                borderColor="gray.200"
              >
                {/* Results Info */}
                <Text fontSize="sm" color="gray.600">
                  Showing {startIndex + 1} to{' '}
                  {Math.min(endIndex, filteredAssignments.length)} of{' '}
                  {filteredAssignments.length} assignments
                </Text>

                {/* Pagination Controls */}
                <HStack gap={2}>
                  <Button
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    variant="ghost"
                    fontSize="sm"
                    color="gray.600"
                    _hover={{ bg: 'gray.100' }}
                  >
                    ← Previous
                  </Button>

                  <HStack gap={1}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          bg={currentPage === page ? 'gray.900' : 'white'}
                          color={currentPage === page ? 'white' : 'gray.700'}
                          border="1px solid"
                          borderColor="gray.200"
                          _hover={{
                            bg: currentPage === page ? 'gray.800' : 'gray.50',
                          }}
                          minW="40px"
                          fontWeight={currentPage === page ? 'bold' : 'normal'}
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </HStack>

                  <Button
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    variant="ghost"
                    fontSize="sm"
                    color="gray.600"
                    _hover={{ bg: 'gray.100' }}
                  >
                    Next →
                  </Button>
                </HStack>
              </HStack>
            )}
          </Card.Root>
        )}
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
