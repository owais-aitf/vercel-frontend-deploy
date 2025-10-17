'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  Input,
  Grid,
  Badge,
} from '@chakra-ui/react';

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


export default function EditProjectPage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filterClient, setFilterClient] = useState<string>('all');
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3x3 grid

  // Form state
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

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterClient]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown-container]')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const fetchData = async () => {
    try {
      setLoadingProjects(true);
      setLoadingClients(true);
      const [projectsRes, clientsRes] = await Promise.all([
        projectService.getProjects(),
        clientService.getClients(),
      ]);
      setProjects(projectsRes.data || []);
      setClients(clientsRes.data || []);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoadingProjects(false);
      setLoadingClients(false);
    }
  };

  // Filter projects by client
  const filteredProjects = projects.filter((project) => {
    if (filterClient === 'all') return true;
    return project.clientId === filterClient;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

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

  // Handle card click to open modal
  const handleCardClick = (project: Project) => {
    setSelectedProject(project);
    setError('');
    setSuccess(false);
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
      setLoading(true);
      setError('');
      setSuccess(false);

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
        setSuccess(true);
        setIsModalOpen(false);
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/sales/projects');
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Error updating project:', error);
      const err = error as { response?: { data?: { message?: string } } };
      setError(
        err.response?.data?.message ||
          'Failed to update project. Please try again.'
      );
    } finally {
      setLoading(false);
    }
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
  const formatCurrency = (amount: string | number) => {
    if (!amount) return '¥0';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <FeatureErrorBoundary featureName="Edit Project">
      <DashboardLayout
        navigation={salesNavigation}
        pageTitle="Edit Project"
        pageSubtitle="Select a project card to edit"
        userName={user?.fullName || 'Sales Representative'}
        userInitials={getUserInitials()}
        notificationCount={0}
      >
        <TabNavigation tabs={projectTabs} />

        {/* Error Message */}
        {error && !isModalOpen && (
          <Card.Root
            p={6}
            mb={6}
            bg="red.50"
            borderColor="red.300"
            borderWidth="2px"
            borderRadius="lg"
          >
            <HStack gap={3}>
              <Box
                w="40px"
                h="40px"
                borderRadius="full"
                bg="red.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="xl">❌</Text>
              </Box>
              <VStack align="start" gap={0}>
                <Text fontWeight="bold" color="red.800" fontSize="md">
                  Update Failed
                </Text>
                <Text fontSize="sm" color="red.600">
                  {error}
                </Text>
              </VStack>
            </HStack>
          </Card.Root>
        )}

        {/* Company Filter */}
        <Card.Root p={{ base: 4, md: 6 }} mb={6}>
          <VStack align="stretch" gap={4}>
            <HStack justify="space-between">
              <VStack align="start" gap={1}>
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  Filter by Company
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Select a company to view their projects
                </Text>
              </VStack>
              {filteredProjects.length > 0 && (
                <Badge
                  colorScheme="blue"
                  fontSize="xs"
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  {filteredProjects.length} Projects
                </Badge>
              )}
            </HStack>

            {/* Custom Dropdown */}
            <Box position="relative" w="full" data-dropdown-container>
              <Box
                as="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                w="full"
                p="12px 16px"
                borderRadius="8px"
                border="2px solid #E2E8F0"
                bg="white"
                fontSize="15px"
                fontWeight="500"
                textAlign="left"
                cursor="pointer"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                _hover={{ borderColor: 'blue.300' }}
                transition="all 0.2s"
              >
                <Text>
                  {filterClient === 'all'
                    ? `All Companies (${projects.length})`
                    : (() => {
                        const client = clients.find(
                          (c) => c.id === filterClient
                        );
                        const count = projects.filter(
                          (p) => p.clientId === filterClient
                        ).length;
                        return client
                          ? `${client.name} (${count})`
                          : 'Select Company';
                      })()}
                </Text>
                <Box
                  transform={isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                  transition="transform 0.2s"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Box>
              </Box>

              {/* Dropdown List */}
              {isDropdownOpen && (
                <Box
                  position="absolute"
                  top="calc(100% + 8px)"
                  left={0}
                  right={0}
                  bg="white"
                  borderRadius="8px"
                  border="2px solid #E2E8F0"
                  boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                  zIndex={1000}
                  maxH="200px"
                  overflowY="auto"
                >
                  {/* All Companies Option */}
                  <Box
                    p={3}
                    cursor="pointer"
                    bg={filterClient === 'all' ? 'blue.50' : 'white'}
                    _hover={{ bg: 'blue.50' }}
                    onClick={() => {
                      setFilterClient('all');
                      setIsDropdownOpen(false);
                    }}
                    borderBottom="1px solid #E2E8F0"
                  >
                    <Text
                      fontSize="sm"
                      fontWeight={filterClient === 'all' ? '600' : '500'}
                    >
                      All Companies ({projects.length})
                    </Text>
                  </Box>

                  {/* Individual Companies */}
                  {clients
                    .filter((c) => c.isActive)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((client) => {
                      const count = projects.filter(
                        (p) => p.clientId === client.id
                      ).length;
                      return (
                        <Box
                          key={client.id}
                          p={3}
                          cursor="pointer"
                          bg={filterClient === client.id ? 'blue.50' : 'white'}
                          _hover={{ bg: 'blue.50' }}
                          onClick={() => {
                            setFilterClient(client.id);
                            setIsDropdownOpen(false);
                          }}
                          borderBottom="1px solid #E2E8F0"
                        >
                          <Text
                            fontSize="sm"
                            fontWeight={
                              filterClient === client.id ? '600' : '500'
                            }
                          >
                            {client.name} ({count})
                          </Text>
                        </Box>
                      );
                    })}
                </Box>
              )}
            </Box>
          </VStack>
        </Card.Root>

        {/* Projects Cards */}
        {loadingProjects ? (
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
                {filterClient !== 'all'
                  ? 'This company has no projects'
                  : 'No projects available'}
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
                  cursor="pointer"
                  _hover={{
                    shadow: 'xl',
                    transform: 'translateY(-4px)',
                    borderColor: 'blue.400',
                  }}
                  transition="all 0.3s"
                  borderWidth="2px"
                  borderColor="gray.200"
                  onClick={() => handleCardClick(project)}
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
                        Company:
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
                          Monthly Price:
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="green.600">
                          {formatCurrency(project.monthlyUnitPrice)}
                        </Text>
                      </HStack>

                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.500">
                          Settlement:
                        </Text>
                        <Badge colorScheme="blue" fontSize="xs">
                          {project.settlementMethod === 'UP_DOWN'
                            ? 'Up/Down'
                            : 'Fixed'}
                        </Badge>
                      </HStack>

                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.500">
                          Start Date:
                        </Text>
                        <Text fontSize="xs" fontWeight="medium">
                          {formatDate(project.startDate)}
                        </Text>
                      </HStack>
                    </VStack>

                    {/* Click to Edit */}
                    <Box
                      textAlign="center"
                      py={2}
                      borderRadius="md"
                      bg="blue.50"
                      borderWidth="1px"
                      borderColor="blue.200"
                    >
                      <Text fontSize="xs" fontWeight="bold" color="blue.700">
                        Click to Edit ✏️
                      </Text>
                    </Box>
                  </VStack>
                </Card.Root>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card.Root p={{ base: 4, md: 6 }}>
                <VStack gap={4} align="stretch">
                  {/* Results Info */}
                  <Text
                    fontSize={{ base: 'xs', md: 'sm' }}
                    color="gray.600"
                    textAlign={{ base: 'center', md: 'left' }}
                  >
                    Showing {startIndex + 1} -{' '}
                    {Math.min(endIndex, filteredProjects.length)} of{' '}
                    {filteredProjects.length} projects
                  </Text>

                  {/* Pagination Buttons */}
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

        {/* Success Popup Modal */}
        {success && (
          <>
            <Box position="fixed" inset={0} bg="blackAlpha.600" zIndex={1999} />
            <Box
              position="fixed"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              bg="white"
              borderRadius="xl"
              shadow="2xl"
              zIndex={2000}
              w={{ base: '90%', md: '500px' }}
              p={8}
            >
              <VStack gap={4}>
                <Box
                  w="80px"
                  h="80px"
                  borderRadius="full"
                  bg="green.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="4xl">✅</Text>
                </Box>
                <VStack gap={2}>
                  <Text fontSize="2xl" fontWeight="bold" color="green.700">
                    Success!
                  </Text>
                  <Text fontSize="md" color="gray.600" textAlign="center">
                    Project updated successfully
                  </Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Redirecting to View All Projects...
                  </Text>
                </VStack>
                <Box
                  w="full"
                  h="4px"
                  bg="gray.200"
                  borderRadius="full"
                  overflow="hidden"
                  mt={4}
                >
                  <Box
                    w="full"
                    h="full"
                    bg="green.500"
                    animation="progress 2s linear"
                  />
                </Box>
              </VStack>
            </Box>
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
              onClick={() => !loading && setIsModalOpen(false)}
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
                    disabled={loading}
                  >
                    ✕
                  </Button>
                </HStack>

                {/* Modal Body */}
                <VStack align="stretch" gap={4} p={6}>
                  {/* Error Message in Modal */}
                  {error && (
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
                          {error}
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
                          {formatCurrency(formData.monthlyUnitPrice)}
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
                          {formatCurrency(formData.hourlyUnitPrice)}
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
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" colorScheme="blue" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Project'}
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

          @keyframes progress {
            from {
              transform: translateX(-100%);
            }
            to {
              transform: translateX(0);
            }
          }
        `}</style>
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
