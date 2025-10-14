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

        {/* Stats Cards */}
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }}
          gap={4}
          mb={6}
        >
          <Card.Root p={4} bg="blue.50">
            <VStack align="start" gap={2}>
              <Text fontSize="sm" color="blue.700" fontWeight="medium">
                Total Assignments
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.900">
                {assignments.length}
              </Text>
            </VStack>
          </Card.Root>

          <Card.Root p={4} bg="green.50">
            <VStack align="start" gap={2}>
              <Text fontSize="sm" color="green.700" fontWeight="medium">
                Active Assignments
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.900">
                {activeCount}
              </Text>
            </VStack>
          </Card.Root>

          <Card.Root p={4} bg="purple.50">
            <VStack align="start" gap={2}>
              <Text fontSize="sm" color="purple.700" fontWeight="medium">
                Engineers Assigned
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="purple.900">
                {uniqueEngineers}
              </Text>
            </VStack>
          </Card.Root>

          <Card.Root p={4} bg="orange.50">
            <VStack align="start" gap={2}>
              <Text fontSize="sm" color="orange.700" fontWeight="medium">
                Active Projects
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="orange.900">
                {uniqueProjects}
              </Text>
            </VStack>
          </Card.Root>
        </Grid>

        {/* Filters */}
        <Card.Root p={6} mb={6}>
          <VStack align="stretch" gap={4}>
            <Text fontSize="lg" fontWeight="bold">
              🔍 Filters
            </Text>

            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
              gap={4}
            >
              {/* Search */}
              <Box>
                <Text fontSize="sm" mb={2} fontWeight="medium" color="gray.700">
                  Search
                </Text>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by engineer, project, or client..."
                  bg="white"
                />
              </Box>

              {/* Status Filter */}
              <Box>
                <Text fontSize="sm" mb={2} fontWeight="medium" color="gray.700">
                  Status
                </Text>
                <Box position="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value as 'all' | 'active' | 'inactive'
                      )
                    }
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
                  >
                    <option value="all">All Assignments</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </Box>
              </Box>
            </Grid>

            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">
                Showing <strong>{filteredAssignments.length}</strong>{' '}
                assignments
              </Text>
              <Button
                onClick={fetchAssignments}
                size="sm"
                variant="ghost"
                colorScheme="blue"
              >
                🔄 Refresh
              </Button>
            </HStack>
          </VStack>
        </Card.Root>

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
            <Box overflowX="auto">
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row bg="gray.50">
                    <Table.ColumnHeader>Engineer</Table.ColumnHeader>
                    <Table.ColumnHeader>Project</Table.ColumnHeader>
                    <Table.ColumnHeader>Client</Table.ColumnHeader>
                    <Table.ColumnHeader>Start Date</Table.ColumnHeader>
                    <Table.ColumnHeader>End Date</Table.ColumnHeader>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                    <Table.ColumnHeader>Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredAssignments.map((assignment) => (
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
          </Card.Root>
        )}
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
