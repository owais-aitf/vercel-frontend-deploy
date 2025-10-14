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
  Input,
  Badge,
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

export default function ManageAssignmentsPage() {
  const { user } = useContext(AuthContext);
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] =
    useState<ProjectAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
      const response = await assignmentService.getAllAssignments({
        isActive: true, // Only show active assignments
      });
      setAssignments(response.data || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toaster.create({
        title: 'Error',
        description: errorMessage || 'Failed to fetch assignments',
        type: 'error',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAssignment = (assignment: ProjectAssignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      assignmentStart: assignment.assignmentStart.split('T')[0],
      assignmentEnd: assignment.assignmentEnd
        ? assignment.assignmentEnd.split('T')[0]
        : '',
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAssignment) return;

    try {
      setUpdating(true);
      await assignmentService.updateAssignment(selectedAssignment.id, {
        assignmentStart: formData.assignmentStart,
        assignmentEnd: formData.assignmentEnd || undefined,
      });

      toaster.create({
        title: 'Assignment updated successfully!',
        description: `Updated assignment for ${selectedAssignment.engineer.fullName}`,
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
        title: 'Error',
        description: errorMessage || 'Failed to update assignment',
        type: 'error',
        duration: 4000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleEndAssignment = async () => {
    if (!selectedAssignment) return;

    if (
      !confirm(
        `Are you sure you want to end the assignment for ${selectedAssignment.engineer.fullName}?`
      )
    ) {
      return;
    }

    try {
      await assignmentService.updateAssignment(selectedAssignment.id, {
        assignmentEnd: new Date().toISOString().split('T')[0],
        isActive: false,
      });

      toaster.create({
        title: 'Assignment ended successfully',
        description: `Assignment for ${selectedAssignment.engineer.fullName} has been ended`,
        type: 'success',
        duration: 3000,
      });

      // Refresh list and clear selection
      await fetchAssignments();
      setSelectedAssignment(null);
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

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.engineer.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assignment.project.projectName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assignment.project.client.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <FeatureErrorBoundary featureName="Manage Assignments">
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

        <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap={6}>
          {/* Assignment Selection List */}
          <Card.Root p={5}>
            <VStack align="stretch" gap={4}>
              <Text fontSize="lg" fontWeight="bold">
                📋 Select Assignment
              </Text>

              {/* Search */}
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search assignments..."
                size="md"
              />

              {/* Assignments List */}
              <VStack
                align="stretch"
                gap={2}
                maxH="600px"
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
                    Loading assignments...
                  </Text>
                )}

                {!loading && filteredAssignments.length === 0 && (
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    textAlign="center"
                    py={4}
                  >
                    No active assignments found
                  </Text>
                )}

                {!loading &&
                  filteredAssignments.map((assignment) => (
                    <Card.Root
                      key={assignment.id}
                      p={3}
                      cursor="pointer"
                      onClick={() => handleSelectAssignment(assignment)}
                      bg={
                        selectedAssignment?.id === assignment.id
                          ? 'blue.50'
                          : 'white'
                      }
                      borderColor={
                        selectedAssignment?.id === assignment.id
                          ? 'blue.500'
                          : 'gray.200'
                      }
                      borderWidth={2}
                      _hover={{ bg: 'gray.50' }}
                      transition="all 0.2s"
                    >
                      <VStack align="stretch" gap={1}>
                        <Text fontSize="sm" fontWeight="bold">
                          {assignment.engineer.fullName}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          → {assignment.project.projectName}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {assignment.project.client.name}
                        </Text>
                        <HStack fontSize="xs" color="gray.600" mt={1}>
                          <Text>
                            Start:{' '}
                            {new Date(
                              assignment.assignmentStart
                            ).toLocaleDateString()}
                          </Text>
                        </HStack>
                      </VStack>
                    </Card.Root>
                  ))}
              </VStack>
            </VStack>
          </Card.Root>

          {/* Update Form */}
          <Card.Root p={6}>
            {!selectedAssignment ? (
              <VStack gap={4} py={20}>
                <Text fontSize="4xl">👈</Text>
                <Text fontSize="lg" fontWeight="bold">
                  Select an Assignment
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Choose an assignment from the list to view and update its
                  information
                </Text>
              </VStack>
            ) : (
              <VStack align="stretch" gap={6}>
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="xl" fontWeight="bold">
                      ⚙️ Manage Assignment
                    </Text>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedAssignment(null)}
                    >
                      ✕ Clear
                    </Button>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    Update assignment dates or end the assignment
                  </Text>
                </Box>

                {/* Current Info Display */}
                <Card.Root p={4} bg="gray.50">
                  <VStack align="stretch" gap={2}>
                    <HStack>
                      <Text fontSize="sm" fontWeight="bold" color="gray.700">
                        Engineer:
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {selectedAssignment.engineer.fullName}
                      </Text>
                    </HStack>
                    <HStack>
                      <Text fontSize="sm" fontWeight="bold" color="gray.700">
                        Project:
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {selectedAssignment.project.projectName}
                      </Text>
                    </HStack>
                    <HStack>
                      <Text fontSize="sm" fontWeight="bold" color="gray.700">
                        Client:
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {selectedAssignment.project.client.name}
                      </Text>
                    </HStack>
                    <HStack>
                      <Text fontSize="sm" fontWeight="bold" color="gray.700">
                        Status:
                      </Text>
                      <Badge
                        colorScheme={
                          selectedAssignment.isActive ? 'green' : 'gray'
                        }
                      >
                        {selectedAssignment.isActive ? 'Active' : 'Ended'}
                      </Badge>
                    </HStack>
                  </VStack>
                </Card.Root>

                <form onSubmit={handleUpdate}>
                  <VStack align="stretch" gap={5}>
                    {/* Assignment Start Date */}
                    <Box>
                      <Text
                        fontSize="sm"
                        mb={2}
                        fontWeight="medium"
                        color="gray.700"
                      >
                        Assignment Start Date{' '}
                        <Text as="span" color="red.500">
                          *
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
                        Assignment End Date (Optional)
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
                        Leave empty if the assignment is ongoing
                      </Text>
                    </Box>

                    {/* Action Buttons */}
                    <HStack gap={3} pt={2}>
                      <Button
                        type="submit"
                        colorScheme="blue"
                        size="lg"
                        loading={updating}
                        loadingText="Updating..."
                        flex={1}
                      >
                        💾 Update Assignment
                      </Button>
                      <Button
                        type="button"
                        colorScheme="orange"
                        variant="outline"
                        size="lg"
                        onClick={handleEndAssignment}
                      >
                        🔚 End Assignment
                      </Button>
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
                    <Text fontSize="lg">⚠️</Text>
                    <VStack align="start" gap={1}>
                      <Text fontSize="sm" fontWeight="bold" color="yellow.900">
                        Important
                      </Text>
                      <Text fontSize="xs" color="yellow.800">
                        • Changing dates affects billing calculations
                        <br />
                        • Ending assignment sets end date to today
                        <br />• Ended assignments cannot be reactivated
                      </Text>
                    </VStack>
                  </HStack>
                </Card.Root>
              </VStack>
            )}
          </Card.Root>
        </Grid>
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
