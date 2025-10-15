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
} from '@chakra-ui/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { salesNavigation } from '@/shared/config/navigation';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { AuthContext } from '@/context/AuthContext';
import {
  projectService,
  CreateProjectData,
} from '@/shared/service/projectService';
import { clientService, Client } from '@/shared/service/clientService';

const projectTabs = [
  { label: 'View All Projects', href: '/sales/projects', icon: '📋' },
  { label: 'Create New Project', href: '/sales/projects/add', icon: '➕' },
  { label: 'Edit Project', href: '/sales/projects/update', icon: '✏️' },
];

export default function AddProjectPage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Form state
  const [formData, setFormData] = useState({
    projectName: '',
    clientId: '',
    startDate: '',
    endDate: '',
    monthlyUnitPrice: '',
    hourlyUnitPrice: '',
    settlementMethod: 'FIXED' as 'UP_DOWN' | 'FIXED',
    settlementRangeMin: '',
    settlementRangeMax: '',
    includePaidLeaveInSettlement: false,
  });

  const getUserInitials = () => {
    if (!user?.fullName) return 'SR';
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.fullName.slice(0, 2).toUpperCase();
  };

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await clientService.getClients();
      setClients(response.data || []);
    } catch {
      setError('Failed to load clients');
    } finally {
      setLoadingClients(false);
    }
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

    if (!formData.clientId) {
      errors.clientId = 'Please select a client';
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

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      const dataToSubmit: CreateProjectData = {
        projectName: formData.projectName.trim(),
        clientId: formData.clientId,
        startDate: formData.startDate,
        monthlyUnitPrice: parseFloat(formData.monthlyUnitPrice),
        settlementMethod: formData.settlementMethod,
        includePaidLeaveInSettlement: formData.includePaidLeaveInSettlement,
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

      console.log('📤 Creating project:', dataToSubmit);

      const response = await projectService.createProject(dataToSubmit);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/sales/projects');
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Error creating project:', error);
      const err = error as { response?: { data?: { message?: string } } };
      setError(
        err.response?.data?.message ||
          'Failed to create project. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/sales/projects');
  };

  const handleReset = () => {
    setFormData({
      projectName: '',
      clientId: '',
      startDate: '',
      endDate: '',
      monthlyUnitPrice: '',
      hourlyUnitPrice: '',
      settlementMethod: 'FIXED',
      settlementRangeMin: '',
      settlementRangeMax: '',
      includePaidLeaveInSettlement: false,
    });
    setValidationErrors({});
    setError('');
    setSuccess(false);
  };

  // Format currency in Japanese Yen
  const formatCurrency = (amount: string) => {
    if (!amount) return '';
    const num = parseFloat(amount);
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <FeatureErrorBoundary featureName="Create New Project">
      <DashboardLayout
        navigation={salesNavigation}
        pageTitle="Create New Project"
        pageSubtitle="Add a new project to the system"
        userName={user?.fullName || 'Sales Representative'}
        userInitials={getUserInitials()}
        notificationCount={0}
      >
        <TabNavigation tabs={projectTabs} />

        {/* Success Popup */}
        {success && (
          <>
            <Box
              position="fixed"
              inset={0}
              bg="blackAlpha.400"
              zIndex={999}
              animation="fadeIn 0.3s ease"
            />

            <Box
              position="fixed"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              bg="white"
              borderRadius="xl"
              shadow="2xl"
              zIndex={1000}
              p={8}
              minW="400px"
              maxW="90%"
              animation="slideIn 0.3s ease"
            >
              <VStack gap={4} align="center">
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

                <VStack gap={2} textAlign="center">
                  <Text fontSize="xl" fontWeight="bold" color="gray.800">
                    Success!
                  </Text>
                  <Text fontSize="md" color="gray.600">
                    Project created successfully
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Redirecting to projects list...
                  </Text>
                </VStack>

                <Box
                  w="full"
                  h="4px"
                  bg="gray.200"
                  borderRadius="full"
                  overflow="hidden"
                >
                  <Box
                    h="full"
                    bg="green.500"
                    borderRadius="full"
                    animation="progressBar 2s linear"
                    w="0"
                  />
                </Box>
              </VStack>
            </Box>

            <style jsx>{`
              @keyframes fadeIn {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }

              @keyframes slideIn {
                from {
                  transform: translate(-50%, -60%);
                  opacity: 0;
                }
                to {
                  transform: translate(-50%, -50%);
                  opacity: 1;
                }
              }

              @keyframes progressBar {
                from {
                  width: 0%;
                }
                to {
                  width: 100%;
                }
              }
            `}</style>
          </>
        )}

        {/* Error Message */}
        {error && (
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
                  Creation Failed
                </Text>
                <Text fontSize="sm" color="red.600">
                  {error}
                </Text>
              </VStack>
            </HStack>
          </Card.Root>
        )}

        {/* Form Card */}
        <Card.Root p={{ base: 4, md: 6 }}>
          <form onSubmit={handleSubmit}>
            <VStack align="stretch" gap={6}>
              <VStack align="start" gap={1}>
                <Text fontSize="lg" fontWeight="bold">
                  Project Information
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Enter the project details below
                </Text>
              </VStack>

              {/* Project Name */}
              <Box>
                <HStack mb={2}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Project Name
                  </Text>
                  <Text fontSize="sm" color="red.500">
                    *
                  </Text>
                </HStack>
                <Input
                  name="projectName"
                  type="text"
                  value={formData.projectName}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  bg="white"
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

              {/* Client Selection */}
              <Box>
                <HStack mb={2}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Client
                  </Text>
                  <Text fontSize="sm" color="red.500">
                    *
                  </Text>
                </HStack>
                <select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  disabled={loadingClients}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: validationErrors.clientId
                      ? '1px solid #FC8181'
                      : '1px solid #E2E8F0',
                    backgroundColor: 'white',
                    fontSize: '14px',
                    cursor: loadingClients ? 'not-allowed' : 'pointer',
                  }}
                >
                  <option value="">-- Select a client --</option>
                  {clients
                    .filter((c) => c.isActive)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                </select>
                {validationErrors.clientId && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    {validationErrors.clientId}
                  </Text>
                )}
              </Box>

              {/* Start Date and End Date */}
              <Grid
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                gap={4}
              >
                <Box>
                  <HStack mb={2}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
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
                    bg="white"
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
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.700"
                    mb={2}
                  >
                    End Date
                  </Text>
                  <Input
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    bg="white"
                    borderColor={
                      validationErrors.endDate ? 'red.500' : 'gray.300'
                    }
                  />
                  {validationErrors.endDate && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      {validationErrors.endDate}
                    </Text>
                  )}
                </Box>
              </Grid>

              {/* Monthly Unit Price and Hourly Unit Price */}
              <Grid
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                gap={4}
              >
                <Box>
                  <HStack mb={2}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      Monthly Unit Price (¥)
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
                    placeholder="0"
                    bg="white"
                    borderColor={
                      validationErrors.monthlyUnitPrice ? 'red.500' : 'gray.300'
                    }
                  />
                  {formData.monthlyUnitPrice && (
                    <Text fontSize="xs" color="gray.600" mt={1}>
                      {formatCurrency(formData.monthlyUnitPrice)}
                    </Text>
                  )}
                  {validationErrors.monthlyUnitPrice && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      {validationErrors.monthlyUnitPrice}
                    </Text>
                  )}
                </Box>

                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.700"
                    mb={2}
                  >
                    Hourly Unit Price (¥)
                  </Text>
                  <Input
                    name="hourlyUnitPrice"
                    type="number"
                    step="0.01"
                    value={formData.hourlyUnitPrice}
                    onChange={handleChange}
                    placeholder="0"
                    bg="white"
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
                <HStack mb={2}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Settlement Method
                  </Text>
                  <Text fontSize="sm" color="red.500">
                    *
                  </Text>
                </HStack>
                <HStack gap={4}>
                  <Button
                    type="button"
                    size="md"
                    variant={
                      formData.settlementMethod === 'FIXED'
                        ? 'solid'
                        : 'outline'
                    }
                    colorScheme={
                      formData.settlementMethod === 'FIXED' ? 'blue' : 'gray'
                    }
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        settlementMethod: 'FIXED',
                      }))
                    }
                    borderWidth="2px"
                  >
                    {formData.settlementMethod === 'FIXED' && '✓ '}Fixed
                  </Button>
                  <Button
                    type="button"
                    size="md"
                    variant={
                      formData.settlementMethod === 'UP_DOWN'
                        ? 'solid'
                        : 'outline'
                    }
                    colorScheme={
                      formData.settlementMethod === 'UP_DOWN'
                        ? 'purple'
                        : 'gray'
                    }
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        settlementMethod: 'UP_DOWN',
                      }))
                    }
                    borderWidth="2px"
                  >
                    {formData.settlementMethod === 'UP_DOWN' && '✓ '}Up/Down
                  </Button>
                </HStack>
              </Box>

              {/* Settlement Range (only if UP_DOWN) */}
              {formData.settlementMethod === 'UP_DOWN' && (
                <Grid
                  templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                  gap={4}
                >
                  <Box>
                    <HStack mb={2}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        Settlement Range Min (hours)
                      </Text>
                      <Text fontSize="sm" color="red.500">
                        *
                      </Text>
                    </HStack>
                    <Input
                      name="settlementRangeMin"
                      type="number"
                      value={formData.settlementRangeMin}
                      onChange={handleChange}
                      placeholder="0"
                      bg="white"
                      borderColor={
                        validationErrors.settlementRangeMin
                          ? 'red.500'
                          : 'gray.300'
                      }
                    />
                    {validationErrors.settlementRangeMin && (
                      <Text fontSize="xs" color="red.500" mt={1}>
                        {validationErrors.settlementRangeMin}
                      </Text>
                    )}
                  </Box>

                  <Box>
                    <HStack mb={2}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        Settlement Range Max (hours)
                      </Text>
                      <Text fontSize="sm" color="red.500">
                        *
                      </Text>
                    </HStack>
                    <Input
                      name="settlementRangeMax"
                      type="number"
                      value={formData.settlementRangeMax}
                      onChange={handleChange}
                      placeholder="0"
                      bg="white"
                      borderColor={
                        validationErrors.settlementRangeMax
                          ? 'red.500'
                          : 'gray.300'
                      }
                    />
                    {validationErrors.settlementRangeMax && (
                      <Text fontSize="xs" color="red.500" mt={1}>
                        {validationErrors.settlementRangeMax}
                      </Text>
                    )}
                  </Box>
                </Grid>
              )}

              {/* Include Paid Leave in Settlement */}
              <Box>
                <HStack gap={3}>
                  <input
                    type="checkbox"
                    name="includePaidLeaveInSettlement"
                    checked={formData.includePaidLeaveInSettlement}
                    onChange={handleChange}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Include Paid Leave in Settlement
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.500" mt={1} ml={7}>
                  Check this if paid leave should be included in settlement
                  calculations
                </Text>
              </Box>

              {/* Action Buttons */}
              <HStack
                justify="flex-end"
                pt={4}
                borderTop="1px solid"
                borderColor="gray.200"
                gap={3}
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  colorScheme="blue"
                  disabled={loading}
                  opacity={loading ? 0.6 : 1}
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </Button>
              </HStack>
            </VStack>
          </form>
        </Card.Root>
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
