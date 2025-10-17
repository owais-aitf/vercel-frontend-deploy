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
import { LuClipboardList, LuPlus, LuPencil } from 'react-icons/lu';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { salesNavigation } from '@/shared/config/navigation';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { AuthContext } from '@/context/AuthContext';
import { projectService, Project } from '@/shared/service/projectService';
import { clientService, Client } from '@/shared/service/clientService';
import { projectTabs } from '@/shared/config/projectTabs';

export default function ViewAllProjectsPage() {
  const { user } = useContext(AuthContext);

  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [filterClient, setFilterClient] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3x3 grid

  const getUserInitials = () => {
    if (!user?.fullName) return 'SR';
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.fullName.slice(0, 2).toUpperCase();
  };

  // Fetch projects and clients on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterClient]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsRes, clientsRes] = await Promise.all([
        projectService.getProjects(),
        clientService.getClients(),
      ]);
      setProjects(projectsRes.data || []);
      setClients(clientsRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on search, status, and client
  const filteredProjects = projects.filter((project) => {
    const projectName = (project.projectName || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = projectName.includes(query);

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && project.isActive) ||
      (filterStatus === 'inactive' && !project.isActive);

    const matchesClient =
      filterClient === 'all' || project.clientId === filterClient;

    return matchesSearch && matchesStatus && matchesClient;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  // Calculate project stats
  const projectStats = {
    total: projects.length,
    active: projects.filter((p) => p.isActive).length,
    inactive: projects.filter((p) => !p.isActive).length,
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format currency in Japanese Yen
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <FeatureErrorBoundary featureName="View All Projects">
      <DashboardLayout
        navigation={salesNavigation}
        pageTitle="Projects"
        pageSubtitle="Manage all client projects"
        userName={user?.fullName || 'Sales Representative'}
        userInitials={getUserInitials()}
        notificationCount={0}
      >
        <TabNavigation tabs={projectTabs} />

        {/* Error Message */}
        {error && (
          <Card.Root
            p={4}
            mb={6}
            bg="red.50"
            borderColor="red.300"
            borderWidth="2px"
          >
            <HStack gap={3}>
              <Text fontSize="xl">⚠️</Text>
              <VStack align="start" gap={0}>
                <Text fontWeight="bold" color="red.800" fontSize="sm">
                  Error
                </Text>
                <Text fontSize="xs" color="red.600">
                  {error}
                </Text>
              </VStack>
            </HStack>
          </Card.Root>
        )}

        {/* Stats Cards - Only 3 cards */}
        <Grid
          templateColumns={{ base: '1fr', sm: 'repeat(3, 1fr)' }}
          gap={{ base: 3, md: 4 }}
          mb={6}
        >
          <Card.Root p={{ base: 4, md: 5 }} bg="white" borderWidth="1px">
            <VStack align="start" gap={2}>
              <Text
                fontSize={{ base: 'xs', md: 'sm' }}
                color="gray.600"
                fontWeight="medium"
              >
                Total Projects
              </Text>
              <Text
                fontSize={{ base: '2xl', md: '3xl' }}
                fontWeight="bold"
                color="blue.600"
              >
                {projectStats.total}
              </Text>
            </VStack>
          </Card.Root>

          <Card.Root p={{ base: 4, md: 5 }} bg="white" borderWidth="1px">
            <VStack align="start" gap={2}>
              <Text
                fontSize={{ base: 'xs', md: 'sm' }}
                color="gray.600"
                fontWeight="medium"
              >
                Active Projects
              </Text>
              <Text
                fontSize={{ base: '2xl', md: '3xl' }}
                fontWeight="bold"
                color="green.600"
              >
                {projectStats.active}
              </Text>
            </VStack>
          </Card.Root>

          <Card.Root p={{ base: 4, md: 5 }} bg="white" borderWidth="1px">
            <VStack align="start" gap={2}>
              <Text
                fontSize={{ base: 'xs', md: 'sm' }}
                color="gray.600"
                fontWeight="medium"
              >
                Inactive Projects
              </Text>
              <Text
                fontSize={{ base: '2xl', md: '3xl' }}
                fontWeight="bold"
                color="red.600"
              >
                {projectStats.inactive}
              </Text>
            </VStack>
          </Card.Root>
        </Grid>

        {/* Search and Filters */}
        <Card.Root p={{ base: 4, md: 6 }} mb={6}>
          <VStack gap={4} align="stretch">
            {/* Search Input */}
            <Box w="full">
              <Input
                placeholder="Search projects by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="white"
                size={{ base: 'md', md: 'lg' }}
              />
            </Box>

            {/* Filter Buttons */}
            <HStack
              gap={2}
              wrap="wrap"
              justify={{ base: 'center', sm: 'flex-start' }}
            >
              <Button
                size={{ base: 'sm', md: 'md' }}
                variant={filterStatus === 'all' ? 'solid' : 'outline'}
                colorScheme={filterStatus === 'all' ? 'blue' : 'gray'}
                onClick={() => setFilterStatus('all')}
                fontSize={{ base: 'xs', md: 'sm' }}
              >
                All ({projectStats.total})
              </Button>
              <Button
                size={{ base: 'sm', md: 'md' }}
                variant={filterStatus === 'active' ? 'solid' : 'outline'}
                colorScheme={filterStatus === 'active' ? 'green' : 'gray'}
                onClick={() => setFilterStatus('active')}
                fontSize={{ base: 'xs', md: 'sm' }}
              >
                Active ({projectStats.active})
              </Button>
              <Button
                size={{ base: 'sm', md: 'md' }}
                variant={filterStatus === 'inactive' ? 'solid' : 'outline'}
                colorScheme={filterStatus === 'inactive' ? 'red' : 'gray'}
                onClick={() => setFilterStatus('inactive')}
                fontSize={{ base: 'xs', md: 'sm' }}
              >
                Inactive ({projectStats.inactive})
              </Button>
            </HStack>

            {/* Client Filter Dropdown */}
            <Box w="full">
              <select
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Clients</option>
                {clients
                  .filter((c) => c.isActive)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
              </select>
            </Box>
          </VStack>
        </Card.Root>

        {/* Projects List */}
        {loading ? (
          <Card.Root p={12}>
            <VStack gap={3}>
              <HStack gap={2}>
                <Box
                  w="12px"
                  h="12px"
                  borderRadius="full"
                  bg="blue.400"
                  animation="bounce 1s infinite"
                  style={{ animationDelay: '0s' }}
                />
                <Box
                  w="12px"
                  h="12px"
                  borderRadius="full"
                  bg="blue.500"
                  animation="bounce 1s infinite"
                  style={{ animationDelay: '0.2s' }}
                />
                <Box
                  w="12px"
                  h="12px"
                  borderRadius="full"
                  bg="blue.600"
                  animation="bounce 1s infinite"
                  style={{ animationDelay: '0.4s' }}
                />
              </HStack>
              <Text color="gray.600">Loading projects...</Text>
            </VStack>
          </Card.Root>
        ) : filteredProjects.length === 0 ? (
          <Card.Root p={12}>
            <VStack gap={3}>
              <Text fontSize="3xl">📭</Text>
              <Text fontSize="lg" fontWeight="bold">
                No Projects Found
              </Text>
              <Text fontSize="sm" color="gray.600">
                {searchQuery || filterStatus !== 'all' || filterClient !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No projects available yet'}
              </Text>
            </VStack>
          </Card.Root>
        ) : (
          <>
            <Grid
              templateColumns={{
                base: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              }}
              gap={{ base: 4, md: 6 }}
              mb={6}
            >
              {currentProjects.map((project) => (
                <Card.Root
                  key={project.id}
                  p={{ base: 4, md: 6 }}
                  _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
                  borderWidth="1px"
                >
                  <VStack align="stretch" gap={4}>
                    {/* Project Header */}
                    <HStack justify="space-between" align="start">
                      <Text
                        fontSize={{ base: 'md', md: 'lg' }}
                        fontWeight="bold"
                        flex={1}
                        overflow="hidden"
                        textOverflow="ellipsis"
                        display="-webkit-box"
                        css={{
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {project.projectName}
                      </Text>
                      <Badge
                        colorScheme={project.isActive ? 'green' : 'red'}
                        flexShrink={0}
                        fontSize="xs"
                      >
                        {project.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </HStack>

                    {/* Client Name */}
                    <HStack gap={2}>
                      <Text fontSize="xs" color="gray.500">
                        Client:
                      </Text>
                      <Text fontSize="xs" fontWeight="medium">
                        {project.client?.name || 'N/A'}
                      </Text>
                    </HStack>

                    {/* Project Details */}
                    <VStack
                      align="stretch"
                      gap={2}
                      pt={3}
                      borderTop="1px solid"
                      borderColor="gray.200"
                    >
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.500">
                          Start Date:
                        </Text>
                        <Text fontSize="xs" fontWeight="medium">
                          {formatDate(project.startDate)}
                        </Text>
                      </HStack>

                      {project.endDate && (
                        <HStack justify="space-between">
                          <Text fontSize="xs" color="gray.500">
                            End Date:
                          </Text>
                          <Text fontSize="xs" fontWeight="medium">
                            {formatDate(project.endDate)}
                          </Text>
                        </HStack>
                      )}

                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.500">
                          Monthly Price:
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="green.600">
                          {formatCurrency(project.monthlyUnitPrice)}
                        </Text>
                      </HStack>

                      {project.hourlyUnitPrice && (
                        <HStack justify="space-between">
                          <Text fontSize="xs" color="gray.500">
                            Hourly Price:
                          </Text>
                          <Text
                            fontSize="xs"
                            fontWeight="medium"
                            color="blue.600"
                          >
                            {formatCurrency(project.hourlyUnitPrice)}/hr
                          </Text>
                        </HStack>
                      )}

                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.500">
                          Settlement:
                        </Text>
                        <Badge colorScheme="purple" fontSize="xs">
                          {project.settlementMethod === 'UP_DOWN'
                            ? 'Up/Down'
                            : 'Fixed'}
                        </Badge>
                      </HStack>

                      {project.settlementMethod === 'UP_DOWN' && (
                        <HStack justify="space-between">
                          <Text fontSize="xs" color="gray.500">
                            Range:
                          </Text>
                          <Text fontSize="xs" fontWeight="medium">
                            {project.settlementRangeMin}h -{' '}
                            {project.settlementRangeMax}h
                          </Text>
                        </HStack>
                      )}
                    </VStack>

                    {/* Footer */}
                    <Text
                      fontSize="xs"
                      color="gray.400"
                      textAlign="center"
                      pt={2}
                    >
                      Created {formatDate(project.createdAt)}
                    </Text>
                  </VStack>
                </Card.Root>
              ))}
            </Grid>
            {/* Pagination */}
            {totalPages > 1 && (
              <Card.Root p={{ base: 4, md: 6 }}>
                <VStack gap={4} align="stretch">
                  {/* Results Info - Full width on mobile */}
                  <Text
                    fontSize={{ base: 'xs', md: 'sm' }}
                    color="gray.600"
                    textAlign={{ base: 'center', md: 'left' }}
                  >
                    Showing {startIndex + 1} -{' '}
                    {Math.min(endIndex, filteredProjects.length)} of{' '}
                    {filteredProjects.length} projects
                  </Text>

                  {/* Pagination Buttons - Centered and wrapped properly */}
                  <HStack gap={2} wrap="wrap" justify="center">
                    <Button
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      variant="outline"
                      fontSize={{ base: 'xs', md: 'sm' }}
                      px={{ base: 3, md: 4 }}
                    >
                      Prev
                    </Button>

                    {getPageNumbers().map((page, index) =>
                      page === '...' ? (
                        <Text
                          key={`ellipsis-${index}`}
                          px={{ base: 1, md: 2 }}
                          color="gray.400"
                          fontSize="sm"
                        >
                          ...
                        </Text>
                      ) : (
                        <Button
                          key={page}
                          size="sm"
                          onClick={() => goToPage(page as number)}
                          variant={currentPage === page ? 'solid' : 'outline'}
                          colorScheme={currentPage === page ? 'blue' : 'gray'}
                          minW={{ base: '36px', md: '40px' }}
                          h={{ base: '36px', md: '40px' }}
                          fontSize={{ base: 'xs', md: 'sm' }}
                          px={{ base: 2, md: 3 }}
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
                      fontSize={{ base: 'xs', md: 'sm' }}
                      px={{ base: 3, md: 4 }}
                    >
                      Next
                    </Button>
                  </HStack>
                </VStack>
              </Card.Root>
            )}
          </>
        )}

        {/* Animations */}
        <style jsx>{`
          @keyframes bounce {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-6px);
            }
          }
        `}</style>
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
