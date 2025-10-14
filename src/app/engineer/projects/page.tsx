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
} from '@chakra-ui/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { engineerNavigation } from '@/shared/config/navigation';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { AuthContext } from '@/context/AuthContext';
import { attendanceService } from '@/shared/service/attendanceService';

interface Project {
  id: string;
  engineerId: string;
  projectId: string;
  assignmentStart: string;
  assignmentEnd: string | null;
  role: string;
  isActive: boolean;
  assignedAt: string;
  project: {
    projectName: string;
    description: string;
    client: {
      name: string;
      email: string;
    };
  };
}

export default function ViewAssignedProjects() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(12);

  // Modal state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Fetch projects data
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await attendanceService.getAllProjects();
      const projectsData = response.data || [];

      setProjects(projectsData);
      setFilteredProjects(projectsData);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const isProjectActive = (endDate: string | null) => {
    if (!endDate) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const projectEndDate = new Date(endDate);
    projectEndDate.setHours(0, 0, 0, 0);

    return projectEndDate >= today;
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...projects];

    if (statusFilter === 'active') {
      filtered = filtered.filter((project) =>
        isProjectActive(project.assignmentEnd)
      );
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(
        (project) => !isProjectActive(project.assignmentEnd)
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.project.projectName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          project.project.client.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchTerm, projects.length]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredProjects.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredProjects.length / recordsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setStatusFilter('');
    setSearchTerm('');
  };

  const openDetailModal = (project: Project) => {
    setSelectedProject(project);
  };

  const closeDetailModal = () => {
    setSelectedProject(null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Ongoing';

    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateDuration = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;

    if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''} ${days > 0 ? `${days} day${days > 1 ? 's' : ''}` : ''}${!endDate ? ' (ongoing)' : ''}`;
    }
    return `${days} day${days > 1 ? 's' : ''}${!endDate ? ' (ongoing)' : ''}`;
  };

  const getStatusBadgeColor = (endDate: string | null) => {
    return isProjectActive(endDate) ? 'green' : 'red';
  };

  const activeCount = projects.filter((p) =>
    isProjectActive(p.assignmentEnd)
  ).length;
  const inactiveCount = projects.length - activeCount;

  return (
    <FeatureErrorBoundary featureName="Projects">
      <DashboardLayout
        navigation={engineerNavigation}
        pageTitle="My Assigned Projects"
        pageSubtitle="View all your project assignments"
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
        {/* Stats Cards */}
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
          gap={4}
          mb={6}
        >
          <Card.Root p={4} bg="blue.50">
            <VStack align="start" gap={2}>
              <Text fontSize="sm" color="blue.700" fontWeight="medium">
                Total Projects
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.900">
                {projects.length}
              </Text>
            </VStack>
          </Card.Root>

          <Card.Root p={4} bg="green.50">
            <VStack align="start" gap={2}>
              <Text fontSize="sm" color="green.700" fontWeight="medium">
                Active Projects
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.900">
                {activeCount}
              </Text>
            </VStack>
          </Card.Root>

          <Card.Root p={4} bg="red.50">
            <VStack align="start" gap={2}>
              <Text fontSize="sm" color="red.700" fontWeight="medium">
                Completed Projects
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="red.900">
                {inactiveCount}
              </Text>
            </VStack>
          </Card.Root>
        </Grid>

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
                lg: 'repeat(3, 1fr)',
              }}
              gap={4}
            >
              {/* Status Filter */}
              <Box>
                <Text fontSize="sm" mb={2} fontWeight="medium" color="gray.700">
                  Project Status
                </Text>
                <Box position="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
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
                    <option value="active">✅ Active Projects</option>
                    <option value="inactive">❌ Completed Projects</option>
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

              {/* Search Filter */}
              <Box>
                <Text fontSize="sm" mb={2} fontWeight="medium" color="gray.700">
                  Search
                </Text>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by project or client..."
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '2px solid #E2E8F0',
                    backgroundColor: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                  }}
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
                Showing <strong>{filteredProjects.length}</strong> total
                projects
              </Text>
              <Button
                onClick={fetchProjects}
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
              <Text color="gray.600">Loading projects...</Text>
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
        {!loading && !error && filteredProjects.length === 0 && (
          <Card.Root p={8}>
            <VStack gap={4}>
              <Text fontSize="4xl">📭</Text>
              <Text fontSize="lg" fontWeight="bold">
                No Projects Found
              </Text>
              <Text color="gray.600" textAlign="center">
                {projects.length === 0
                  ? "You haven't been assigned to any projects yet."
                  : 'No projects match your filters. Try adjusting them.'}
              </Text>
              {projects.length > 0 && (
                <Button onClick={resetFilters} colorScheme="blue" size="sm">
                  Clear Filters
                </Button>
              )}
            </VStack>
          </Card.Root>
        )}

        {/* Projects Grid */}
        {!loading && !error && currentRecords.length > 0 && (
          <>
            <Grid
              templateColumns={{
                base: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              }}
              gap={6}
              mb={6}
            >
              {currentRecords.map((project) => {
                const active = isProjectActive(project.assignmentEnd);
                return (
                  <Card.Root
                    key={project.id}
                    p={5}
                    _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                    cursor="pointer"
                    onClick={() => openDetailModal(project)}
                  >
                    <VStack align="stretch" gap={3}>
                      <HStack justify="space-between" align="start">
                        <Text fontSize="lg" fontWeight="bold" flex={1}>
                          {project.project.projectName}
                        </Text>
                        <Badge
                          colorScheme={getStatusBadgeColor(
                            project.assignmentEnd
                          )}
                          fontSize="xs"
                        >
                          {active ? 'Active' : 'Completed'}
                        </Badge>
                      </HStack>

                      <HStack gap={2}>
                        <Text fontSize="sm" color="gray.500">
                          🏢 Client:
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {project.project.client.name}
                        </Text>
                      </HStack>

                      <HStack gap={2}>
                        <Text fontSize="sm" color="gray.500">
                          👤 Role:
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {project.role}
                        </Text>
                      </HStack>

                      <HStack gap={2}>
                        <Text fontSize="sm" color="gray.500">
                          📅 Duration:
                        </Text>
                        <Text fontSize="sm">
                          {calculateDuration(
                            project.assignmentStart,
                            project.assignmentEnd
                          )}
                        </Text>
                      </HStack>

                      <Box p={3} bg="gray.50" borderRadius="md">
                        <VStack gap={2} align="stretch">
                          <HStack justify="space-between">
                            <Text fontSize="xs" color="gray.600">
                              Start:
                            </Text>
                            <Text fontSize="xs" fontWeight="medium">
                              {formatDate(project.assignmentStart)}
                            </Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontSize="xs" color="gray.600">
                              End:
                            </Text>
                            <Text fontSize="xs" fontWeight="medium">
                              {formatDate(project.assignmentEnd)}
                            </Text>
                          </HStack>
                        </VStack>
                      </Box>

                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        w="full"
                      >
                        View Details →
                      </Button>
                    </VStack>
                  </Card.Root>
                );
              })}
            </Grid>

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
                  {Math.min(indexOfLastRecord, filteredProjects.length)} of{' '}
                  {filteredProjects.length} projects
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

                  <HStack gap={1} display={{ base: 'none', md: 'flex' }}>
                    {(() => {
                      const pageNumbers = [];
                      const maxVisiblePages = 5;

                      if (totalPages <= maxVisiblePages) {
                        for (let i = 1; i <= totalPages; i++) {
                          pageNumbers.push(i);
                        }
                      } else {
                        pageNumbers.push(1);
                        let startPage = Math.max(2, currentPage - 1);
                        let endPage = Math.min(totalPages - 1, currentPage + 1);

                        if (currentPage <= 3) {
                          startPage = 2;
                          endPage = 4;
                        }

                        if (currentPage >= totalPages - 2) {
                          startPage = totalPages - 3;
                          endPage = totalPages - 1;
                        }

                        if (startPage > 2) {
                          pageNumbers.push('...');
                        }

                        for (let i = startPage; i <= endPage; i++) {
                          pageNumbers.push(i);
                        }

                        if (endPage < totalPages - 1) {
                          pageNumbers.push('...');
                        }

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
        {selectedProject && (
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
                    Project Details
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
                      Project Name
                    </Text>
                    <Text fontSize="md" fontWeight="medium">
                      {selectedProject.project.projectName}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Status
                    </Text>
                    <Badge
                      colorScheme={getStatusBadgeColor(
                        selectedProject.assignmentEnd
                      )}
                      fontSize="sm"
                    >
                      {isProjectActive(selectedProject.assignmentEnd)
                        ? 'Active'
                        : 'Completed'}
                    </Badge>
                  </Box>

                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Client Information
                    </Text>
                    <VStack
                      align="start"
                      gap={1}
                      p={3}
                      bg="gray.50"
                      borderRadius="md"
                    >
                      <Text fontSize="sm" fontWeight="medium">
                        {selectedProject.project.client.name}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {selectedProject.project.client.email}
                      </Text>
                    </VStack>
                  </Box>

                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Your Role
                    </Text>
                    <Text fontSize="md">{selectedProject.role}</Text>
                  </Box>

                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        Start Date
                      </Text>
                      <Text fontSize="md">
                        {formatDate(selectedProject.assignmentStart)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        End Date
                      </Text>
                      <Text fontSize="md">
                        {formatDate(selectedProject.assignmentEnd)}
                      </Text>
                    </Box>
                  </Grid>

                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Project Duration
                    </Text>
                    <Text fontSize="md">
                      {calculateDuration(
                        selectedProject.assignmentStart,
                        selectedProject.assignmentEnd
                      )}
                    </Text>
                  </Box>

                  {selectedProject.project.description && (
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        Description
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
                          {selectedProject.project.description ||
                            'No description available'}
                        </Text>
                      </Box>
                    </Box>
                  )}

                  <Box pt={4} borderTop="1px solid" borderColor="gray.200">
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Assigned On
                    </Text>
                    <Text fontSize="sm">
                      {new Date(selectedProject.assignedAt).toLocaleString()}
                    </Text>
                  </Box>
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
