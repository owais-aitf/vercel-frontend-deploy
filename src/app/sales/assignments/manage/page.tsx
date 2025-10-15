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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3x3 grid

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

  // Pagination calculations
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssignments = filteredAssignments.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

        {/* Filter Section */}
        <Card.Root
          p={6}
          mb={6}
          bg="gradient.to-br"
          bgGradient="linear(to-br, blue.50, white)"
        >
          <VStack align="stretch" gap={4}>
            <HStack justify="space-between">
              <VStack align="start" gap={1}>
                <HStack gap={2}>
                  <Box
                    w="10px"
                    h="10px"
                    borderRadius="full"
                    bg="blue.500"
                    animation="pulse 2s ease-in-out infinite"
                  />
                  <Text fontSize="lg" fontWeight="bold" color="gray.800">
                    Select Assignment
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  Choose an assignment to manage
                </Text>
              </VStack>
              {assignments.length > 0 && (
                <Badge
                  colorScheme="blue"
                  fontSize="xs"
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  {filteredAssignments.length} Assignments
                </Badge>
              )}
            </HStack>

            {/* Search */}
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Search assignments..."
              size="md"
              bg="white"
              borderColor="gray.200"
              _hover={{ borderColor: 'blue.300' }}
              _focus={{
                borderColor: 'blue.500',
                boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
              }}
            />
          </VStack>
        </Card.Root>

        {/* Loading State */}
        {loading && (
          <Card.Root p={8}>
            <VStack gap={4}>
              <Text fontSize="2xl">⏳</Text>
              <Text color="gray.600">Loading assignments...</Text>
            </VStack>
          </Card.Root>
        )}

        {/* Empty State */}
        {!loading && filteredAssignments.length === 0 && (
          <Card.Root p={8}>
            <VStack gap={4}>
              <Text fontSize="4xl">📋</Text>
              <Text fontSize="lg" fontWeight="bold">
                No Assignments Found
              </Text>
              <Text color="gray.600" textAlign="center">
                {assignments.length === 0
                  ? 'No active assignments available'
                  : 'No assignments match your search'}
              </Text>
            </VStack>
          </Card.Root>
        )}

        {/* Assignments Grid */}
        {!loading && filteredAssignments.length > 0 && (
          <>
            <Grid
              templateColumns={{
                base: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              }}
              gap={6}
            >
              {paginatedAssignments.map((assignment) => (
                <Card.Root
                  key={assignment.id}
                  p={5}
                  cursor="pointer"
                  onClick={() => setSelectedAssignment(assignment)}
                  bg="white"
                  borderColor="gray.200"
                  borderWidth={2}
                  _hover={{
                    shadow: 'lg',
                    transform: 'translateY(-2px)',
                    borderColor: 'blue.300',
                  }}
                  transition="all 0.2s"
                >
                  <VStack align="stretch" gap={3}>
                    <HStack justify="space-between" align="start">
                      <VStack align="start" gap={1} flex={1}>
                        <Text fontSize="lg" fontWeight="bold">
                          {assignment.engineer.fullName}
                        </Text>
                        <Badge colorScheme="green" fontSize="xs">
                          Active
                        </Badge>
                      </VStack>
                    </HStack>

                    <VStack align="stretch" gap={2}>
                      <HStack gap={2}>
                        <Text fontSize="sm" color="gray.500">
                          📁
                        </Text>
                        <Text
                          fontSize="sm"
                          color="gray.700"
                          fontWeight="medium"
                        >
                          {assignment.project.projectName}
                        </Text>
                      </HStack>

                      <HStack gap={2}>
                        <Text fontSize="sm" color="gray.500">
                          🏢
                        </Text>
                        <Text fontSize="sm" color="gray.700">
                          {assignment.project.client.name}
                        </Text>
                      </HStack>

                      <HStack gap={2}>
                        <Text fontSize="sm" color="gray.500">
                          📅
                        </Text>
                        <Text fontSize="sm" color="gray.700">
                          Start:{' '}
                          {new Date(
                            assignment.assignmentStart
                          ).toLocaleDateString()}
                        </Text>
                      </HStack>
                    </VStack>

                    <HStack
                      gap={2}
                      mt={2}
                      pt={3}
                      borderTop="1px solid"
                      borderColor="gray.100"
                    >
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="outline"
                        flex={1}
                        onClick={() => setSelectedAssignment(assignment)}
                      >
                        ⚙️ Manage
                      </Button>
                    </HStack>
                  </VStack>
                </Card.Root>
              ))}
            </Grid>

            {/* Pagination */}
            <HStack
              justify="space-between"
              mt={8}
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
          </>
        )}

        {/* Assignment Management Modal */}
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
                      ⚙️ Manage Assignment
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Update assignment dates or end the assignment
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
                            Engineer:
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
                            Project:
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
                            Client:
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
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="yellow.900"
                          >
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
                </Box>
              </VStack>
            </Box>
          </>
        )}
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
