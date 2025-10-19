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
import { LuPencil } from 'react-icons/lu';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { salesNavigation } from '@/shared/config/navigation';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { AuthContext } from '@/context/AuthContext';
import {
  projectService,
  Project,
  UpdateProjectData,
} from '@/shared/service/projectService';
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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3x3 grid

  // Form state for editing
  const [formData, setFormData] = useState({
    projectName: '',
    startDate: '',
    endDate: '',
    monthlyUnitPrice: '',
    hourlyUnitPrice: '',
    settlementMethod: 'FIXED' as 'UP_DOWN' | 'FIXED',
    settlementRangeMin: '',
    settlementRangeMax: '',
    includePaidLeaveInSettlement: false,
    isActive: true,
  });

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

  // Handle edit button click
  const handleEditClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProject(project);
    setUpdateError('');
    setUpdateSuccess(false);
    setValidationErrors({});

    // Format dates for input fields (YYYY-MM-DD)
    const formatDateForInput = (dateString: string) => {
      return dateString ? dateString.split('T')[0] : '';
    };

    setFormData({
      projectName: project.projectName || '',
      startDate: formatDateForInput(project.startDate),
      endDate: project.endDate ? formatDateForInput(project.endDate) : '',
      monthlyUnitPrice: project.monthlyUnitPrice?.toString() || '',
      hourlyUnitPrice: project.hourlyUnitPrice?.toString() || '',
      settlementMethod: project.settlementMethod || 'FIXED',
      settlementRangeMin: project.settlementRangeMin?.toString() || '',
      settlementRangeMax: project.settlementRangeMax?.toString() || '',
      includePaidLeaveInSettlement:
        project.includePaidLeaveInSettlement || false,
      isActive: project.isActive,
    });

    setIsModalOpen(true);
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.projectName.trim()) {
      errors.projectName = 'Project name is required';
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (
      !formData.monthlyUnitPrice ||
      parseFloat(formData.monthlyUnitPrice) <= 0
    ) {
      errors.monthlyUnitPrice = 'Monthly unit price must be greater than 0';
    }

    if (formData.settlementMethod === 'UP_DOWN') {
      if (
        !formData.settlementRangeMin ||
        parseInt(formData.settlementRangeMin) < 0
      ) {
        errors.settlementRangeMin = 'Settlement range minimum is required';
      }
      if (
        !formData.settlementRangeMax ||
        parseInt(formData.settlementRangeMax) <= 0
      ) {
        errors.settlementRangeMax = 'Settlement range maximum is required';
      }
      if (
        formData.settlementRangeMin &&
        formData.settlementRangeMax &&
        parseInt(formData.settlementRangeMin) >=
          parseInt(formData.settlementRangeMax)
      ) {
        errors.settlementRangeMax = 'Maximum must be greater than minimum';
      }
    }

    if (
      formData.endDate &&
      formData.startDate &&
      formData.endDate < formData.startDate
    ) {
      errors.endDate = 'End date must be after start date';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedProject) {
      return;
    }

    try {
      setUpdateLoading(true);
      setUpdateError('');
      setUpdateSuccess(false);

      const dataToSubmit: UpdateProjectData = {
        projectName: formData.projectName.trim(),
        startDate: formData.startDate,
        monthlyUnitPrice: parseFloat(formData.monthlyUnitPrice),
        settlementMethod: formData.settlementMethod,
        includePaidLeaveInSettlement: formData.includePaidLeaveInSettlement,
        isActive: formData.isActive,
      };

      if (formData.endDate) {
        dataToSubmit.endDate = formData.endDate;
      }

      if (formData.hourlyUnitPrice) {
        dataToSubmit.hourlyUnitPrice = parseFloat(formData.hourlyUnitPrice);
      }

      if (formData.settlementMethod === 'UP_DOWN') {
        dataToSubmit.settlementRangeMin = parseInt(formData.settlementRangeMin);
        dataToSubmit.settlementRangeMax = parseInt(formData.settlementRangeMax);
      }

      const response = await projectService.updateProject(
        selectedProject.id,
        dataToSubmit
      );

      if (response.success) {
        setUpdateSuccess(true);
        setIsModalOpen(false);
        // Refresh the projects list
        await fetchData();
        // Reset success message after 3 seconds
        setTimeout(() => {
          setUpdateSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Error updating project:', error);
      const err = error as { response?: { data?: { message?: string } } };
      setUpdateError(
        err.response?.data?.message ||
          'Failed to update project. Please try again.'
      );
    } finally {
      setUpdateLoading(false);
    }
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

        {/* Success Message */}
        {updateSuccess && (
          <Card.Root
            p={4}
            mb={6}
            bg="green.50"
            borderColor="green.300"
            borderWidth="2px"
          >
            <HStack gap={3}>
              <Text fontSize="xl">✅</Text>
              <VStack align="start" gap={0}>
                <Text fontWeight="bold" color="green.800" fontSize="sm">
                  Success
                </Text>
                <Text fontSize="xs" color="green.600">
                  Project updated successfully
                </Text>
              </VStack>
            </HStack>
          </Card.Root>
        )}

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

                    {/* Footer with Edit Button */}
                    <HStack
                      justify="space-between"
                      align="center"
                      pt={3}
                      mt={2}
                      borderTop="1px solid"
                      borderColor="gray.100"
                    >
                      <Text fontSize="xs" color="gray.400" flexShrink={0}>
                        Created {formatDate(project.createdAt)}
                      </Text>
                      <Button
                        size="md"
                        variant="outline"
                        colorScheme="blue"
                        onClick={(e) => handleEditClick(project, e)}
                        borderWidth="1px"
                        _hover={{
                          bg: 'blue.50',
                          borderColor: 'blue.400',
                          transform: 'translateY(-1px)',
                        }}
                        transition="all 0.2s"
                        px={5}
                        h="36px"
                        flexShrink={0}
                      >
                        <HStack gap={2}>
                          <LuPencil size={16} />
                          <Text fontSize="sm" fontWeight="medium">
                            Edit
                          </Text>
                        </HStack>
                      </Button>
                    </HStack>
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

        {/* Edit Modal */}
        {isModalOpen && selectedProject && (
          <>
            {/* Modal Backdrop */}
            <Box
              position="fixed"
              inset={0}
              bg="blackAlpha.600"
              zIndex={999}
              onClick={() => !updateLoading && setIsModalOpen(false)}
            />

            {/* Modal Content */}
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
              <form onSubmit={handleSubmit}>
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
                      Edit Project
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {selectedProject.projectName}
                    </Text>
                  </VStack>
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    variant="ghost"
                    size="sm"
                    disabled={updateLoading}
                  >
                    ✕
                  </Button>
                </HStack>

                {/* Modal Body */}
                <VStack align="stretch" gap={4} p={6}>
                  {/* Error Message in Modal */}
                  {updateError && (
                    <Box
                      p={4}
                      bg="red.50"
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="red.300"
                    >
                      <HStack gap={2}>
                        <Text fontSize="lg">❌</Text>
                        <Text fontSize="sm" fontWeight="bold" color="red.700">
                          {updateError}
                        </Text>
                      </HStack>
                    </Box>
                  )}

                  {/* Project Name */}
                  <Box>
                    <HStack mb={2}>
                      <Text fontSize="sm" fontWeight="medium">
                        Project Name
                      </Text>
                      <Text fontSize="sm" color="red.500">
                        *
                      </Text>
                    </HStack>
                    <Input
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleChange}
                      borderColor={
                        validationErrors.projectName ? 'red.500' : 'gray.300'
                      }
                    />
                    {validationErrors.projectName && (
                      <Text fontSize="xs" color="red.500" mt={1}>
                        {validationErrors.projectName}
                      </Text>
                    )}
                  </Box>

                  {/* Dates */}
                  <Grid
                    templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                    gap={4}
                  >
                    <Box>
                      <HStack mb={2}>
                        <Text fontSize="sm" fontWeight="medium">
                          Start Date
                        </Text>
                        <Text fontSize="sm" color="red.500">
                          *
                        </Text>
                      </HStack>
                      <Input
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                        borderColor={
                          validationErrors.startDate ? 'red.500' : 'gray.300'
                        }
                      />
                      {validationErrors.startDate && (
                        <Text fontSize="xs" color="red.500" mt={1}>
                          {validationErrors.startDate}
                        </Text>
                      )}
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        End Date
                      </Text>
                      <Input
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleChange}
                      />
                    </Box>
                  </Grid>

                  {/* Prices */}
                  <Grid
                    templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                    gap={4}
                  >
                    <Box>
                      <HStack mb={2}>
                        <Text fontSize="sm" fontWeight="medium">
                          Monthly Price (¥)
                        </Text>
                        <Text fontSize="sm" color="red.500">
                          *
                        </Text>
                      </HStack>
                      <Input
                        name="monthlyUnitPrice"
                        type="number"
                        step="0.01"
                        value={formData.monthlyUnitPrice}
                        onChange={handleChange}
                        borderColor={
                          validationErrors.monthlyUnitPrice
                            ? 'red.500'
                            : 'gray.300'
                        }
                      />
                      {formData.monthlyUnitPrice && (
                        <Text fontSize="xs" color="gray.600" mt={1}>
                          {formatCurrency(
                            parseFloat(formData.monthlyUnitPrice)
                          )}
                        </Text>
                      )}
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Hourly Price (¥)
                      </Text>
                      <Input
                        name="hourlyUnitPrice"
                        type="number"
                        step="0.01"
                        value={formData.hourlyUnitPrice}
                        onChange={handleChange}
                      />
                      {formData.hourlyUnitPrice && (
                        <Text fontSize="xs" color="gray.600" mt={1}>
                          {formatCurrency(parseFloat(formData.hourlyUnitPrice))}
                        </Text>
                      )}
                    </Box>
                  </Grid>

                  {/* Settlement Method */}
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      Settlement Method
                    </Text>
                    <HStack gap={3}>
                      <Button
                        type="button"
                        size="sm"
                        variant={
                          formData.settlementMethod === 'FIXED'
                            ? 'solid'
                            : 'outline'
                        }
                        colorScheme={
                          formData.settlementMethod === 'FIXED'
                            ? 'blue'
                            : 'gray'
                        }
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            settlementMethod: 'FIXED',
                          }))
                        }
                      >
                        Fixed
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={
                          formData.settlementMethod === 'UP_DOWN'
                            ? 'solid'
                            : 'outline'
                        }
                        colorScheme={
                          formData.settlementMethod === 'UP_DOWN'
                            ? 'blue'
                            : 'gray'
                        }
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            settlementMethod: 'UP_DOWN',
                          }))
                        }
                      >
                        Up/Down
                      </Button>
                    </HStack>
                  </Box>

                  {/* Settlement Range */}
                  {formData.settlementMethod === 'UP_DOWN' && (
                    <Grid
                      templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                      gap={4}
                    >
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Min (hours) *
                        </Text>
                        <Input
                          name="settlementRangeMin"
                          type="number"
                          value={formData.settlementRangeMin}
                          onChange={handleChange}
                          borderColor={
                            validationErrors.settlementRangeMin
                              ? 'red.500'
                              : 'gray.300'
                          }
                        />
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Max (hours) *
                        </Text>
                        <Input
                          name="settlementRangeMax"
                          type="number"
                          value={formData.settlementRangeMax}
                          onChange={handleChange}
                          borderColor={
                            validationErrors.settlementRangeMax
                              ? 'red.500'
                              : 'gray.300'
                          }
                        />
                      </Box>
                    </Grid>
                  )}

                  {/* Checkboxes */}
                  <HStack gap={6}>
                    <HStack gap={2}>
                      <input
                        type="checkbox"
                        name="includePaidLeaveInSettlement"
                        checked={formData.includePaidLeaveInSettlement}
                        onChange={handleChange}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <Text fontSize="sm">Include Paid Leave</Text>
                    </HStack>

                    <HStack gap={2}>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <Text fontSize="sm">Active</Text>
                    </HStack>
                  </HStack>
                </VStack>

                {/* Modal Footer */}
                <HStack
                  justify="flex-end"
                  p={6}
                  borderTop="1px solid"
                  borderColor="gray.200"
                  gap={3}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={updateLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    disabled={updateLoading}
                  >
                    {updateLoading ? 'Updating...' : 'Update Project'}
                  </Button>
                </HStack>
              </form>
            </Box>
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
