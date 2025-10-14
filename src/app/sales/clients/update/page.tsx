'use client';

import { useState, useEffect, useContext, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Grid,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  Input,
  Textarea,
  Badge,
} from '@chakra-ui/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { salesNavigation } from '@/shared/config/navigation';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { AuthContext } from '@/context/AuthContext';
import { clientService, Client } from '@/shared/service/clientService';

const clientTabs = [
  { label: 'View All Clients', href: '/sales/clients', icon: '👥' },
  { label: 'Add New Client', href: '/sales/clients/add', icon: '➕' },
  { label: 'Update Client', href: '/sales/clients/update', icon: '✏️' },
  { label: 'Client Projects', href: '/sales/clients/projects', icon: '📁' },
];

export default function UpdateClientPage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  // State for client list
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [loadingClients, setLoadingClients] = useState(true);
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  const [showDeactivateWarning, setShowDeactivateWarning] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    isActive: true,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Helper function to get user initials
  const getUserInitials = () => {
    if (!user?.fullName) return 'SR';
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.fullName.slice(0, 2).toUpperCase();
  };

  // Fetch all clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      console.log('🔄 Fetching clients...');
      const response = await clientService.getClients();
      console.log('✅ Clients fetched:', response.data);
      setClients(response.data || []);
    } catch (err: any) {
      console.error('❌ Error fetching clients:', err);
      setError('Failed to load clients');
      setClients([]);
    } finally {
      setLoadingClients(false);
      console.log('✅ Loading complete');
    }
  };

  // Load selected client data
  const handleClientSelect = async (clientId: string) => {
    setSelectedClientId(clientId);
    setError('');
    setSuccess(false);
    setValidationErrors({});
    setActiveProjectsCount(0);

    if (!clientId) {
      setFormData({
        name: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        isActive: true,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await clientService.getClientById(clientId);
      const client = response.data;

      setFormData({
        name: client.name || '',
        contactEmail: client.contactEmail || '',
        contactPhone: client.contactPhone || '',
        address: client.address || '',
        isActive: client.isActive,
      });

      // Count active projects
      if (client.projects) {
        const activeCount = client.projects.filter(
          (p: any) => p.isActive
        ).length;
        setActiveProjectsCount(activeCount);
      }
    } catch (err: any) {
      setError('Failed to load client details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = (newStatus: boolean) => {
    // If trying to deactivate and has active projects, show warning
    if (!newStatus && activeProjectsCount > 0) {
      setShowDeactivateWarning(true);
      return;
    }

    setFormData((prev) => ({ ...prev, isActive: newStatus }));
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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

    if (!selectedClientId) {
      setError('Please select a client to update');
      return false;
    }

    if (!formData.name.trim()) {
      errors.name = 'Client name is required';
    }

    if (formData.contactEmail && !isValidEmail(formData.contactEmail)) {
      errors.contactEmail = 'Please enter a valid email address';
    }

    if (formData.contactPhone && !isValidPhone(formData.contactPhone)) {
      errors.contactPhone = 'Please enter a valid phone number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
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

      const dataToSubmit: any = {
        name: formData.name.trim(),
        isActive: formData.isActive,
      };

      if (formData.contactEmail.trim()) {
        dataToSubmit.contactEmail = formData.contactEmail.trim();
      }

      if (formData.contactPhone.trim()) {
        dataToSubmit.contactPhone = formData.contactPhone.trim();
      }

      if (formData.address.trim()) {
        dataToSubmit.address = formData.address.trim();
      }

      console.log('📤 Updating client:', selectedClientId, dataToSubmit);

      const response = await clientService.updateClient(
        selectedClientId,
        dataToSubmit
      );

      if (response.success) {
        setSuccess(true);

        // Refresh clients list
        await fetchClients();

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/sales/clients');
        }, 2000);
      }
    } catch (err: any) {
      console.error('❌ Error updating client:', err);
      setError(
        err.response?.data?.message ||
          'Failed to update client. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/sales/clients');
  };

  const handleReset = () => {
    if (selectedClientId) {
      handleClientSelect(selectedClientId);
    } else {
      setFormData({
        name: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        isActive: true,
      });
    }
    setValidationErrors({});
    setError('');
    setSuccess(false);
  };

  return (
    <FeatureErrorBoundary featureName="Update Client">
      <DashboardLayout
        navigation={salesNavigation}
        pageTitle="Update Client"
        pageSubtitle="Modify existing client information"
        userName={user?.fullName || 'Sales Representative'}
        userInitials={getUserInitials()}
        notificationCount={0}
      >
        <TabNavigation tabs={clientTabs} />

        {/* Success Popup/Toast */}
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
                    Client updated successfully
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Redirecting to clients list...
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
            <VStack align="stretch" gap={3}>
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

              {error.toLowerCase().includes('email') &&
                error.toLowerCase().includes('already') && (
                  <Box
                    pl={12}
                    pt={2}
                    borderTop="1px solid"
                    borderColor="red.200"
                  >
                    <Text fontSize="xs" color="red.700">
                      💡 Tip: Each client must have a unique email address. Try
                      using a different email or leaving it blank.
                    </Text>
                  </Box>
                )}

              {error.toLowerCase().includes('active projects') && (
                <Box pl={12} pt={2} borderTop="1px solid" borderColor="red.200">
                  <Text fontSize="xs" color="red.700">
                    💡 Tip: You need to complete or deactivate all active
                    projects before making this client inactive.
                  </Text>
                </Box>
              )}
            </VStack>
          </Card.Root>
        )}

        {/* Warning Popup for Deactivation */}
        {showDeactivateWarning && (
          <>
            <Box
              position="fixed"
              inset={0}
              bg="blackAlpha.400"
              zIndex={999}
              onClick={() => setShowDeactivateWarning(false)}
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
              minW="450px"
              maxW="90%"
            >
              <VStack gap={4} align="stretch">
                <HStack gap={3}>
                  <Box
                    w="50px"
                    h="50px"
                    borderRadius="full"
                    bg="orange.100"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="2xl">⚠️</Text>
                  </Box>
                  <VStack align="start" gap={1}>
                    <Text fontSize="lg" fontWeight="bold">
                      Cannot Deactivate Client
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      This client has {activeProjectsCount} active{' '}
                      {activeProjectsCount === 1 ? 'project' : 'projects'}
                    </Text>
                  </VStack>
                </HStack>

                <Box
                  p={4}
                  bg="orange.50"
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderColor="orange.400"
                >
                  <Text fontSize="sm" color="gray.700">
                    Please complete or deactivate all active projects before
                    setting this client to inactive.
                  </Text>
                </Box>

                <Button
                  colorScheme="blue"
                  onClick={() => setShowDeactivateWarning(false)}
                  w="full"
                >
                  Got it
                </Button>
              </VStack>
            </Box>
          </>
        )}

        {/* Info Card */}
        {/* <Card.Root p={6} mt={6} mb={6} bg="blue.50">
          <VStack align="start" gap={2}>
            <HStack gap={2}>
              <Text fontSize="lg">ℹ️</Text>
              <Text fontSize="md" fontWeight="bold" color="blue.900">
                Update Guidelines
              </Text>
            </HStack>
            <VStack align="start" gap={1} pl={7}>
              <Text fontSize="sm" color="blue.700">
                • Select a client from the dropdown to begin
              </Text>
              <Text fontSize="sm" color="blue.700">
                • Client name must be unique across all clients
              </Text>
              <Text fontSize="sm" color="blue.700">
                • Changing status affects project assignment eligibility
              </Text>
            </VStack>
          </VStack>
        </Card.Root> */}

        {/* Client Selection Card - Custom Dropdown */}
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
                    Select Client to Update
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  Choose a client from the dropdown to edit their information
                </Text>
              </VStack>
              {clients.length > 0 && (
                <Badge
                  colorScheme="blue"
                  fontSize="xs"
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  {clients.length} Clients
                </Badge>
              )}
            </HStack>

            <Box position="relative" ref={dropdownRef}>
              {/* Dropdown Button */}
              <Button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={loadingClients}
                w="full"
                h="auto"
                p={4}
                bg="white"
                border="2px solid"
                borderColor={isDropdownOpen ? 'blue.400' : 'gray.200'}
                borderRadius="12px"
                _hover={{ borderColor: 'blue.300', bg: 'blue.50' }}
                _active={{ bg: 'blue.100' }}
                boxShadow={
                  isDropdownOpen ? '0 0 0 4px rgba(66, 153, 225, 0.15)' : 'sm'
                }
                transition="all 0.3s ease"
                textAlign="left"
                justifyContent="space-between"
              >
                <HStack justify="space-between" w="full">
                  <HStack gap={2}>
                    {selectedClientId && (
                      <Box
                        w="8px"
                        h="8px"
                        borderRadius="full"
                        bg="green.500"
                        animation="pulse 2s infinite"
                      />
                    )}
                    <Text
                      fontSize="15px"
                      fontWeight="500"
                      color={selectedClientId ? 'gray.800' : 'gray.500'}
                    >
                      {selectedClientId
                        ? `${clients.find((c) => c.id === selectedClientId)?.isActive ? '●' : '○'} ${
                            clients.find((c) => c.id === selectedClientId)?.name
                          }`
                        : '-- Click to select a client --'}
                    </Text>
                  </HStack>
                  <Box
                    color={isDropdownOpen ? 'blue.500' : 'gray.400'}
                    transform={
                      isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }
                    transition="all 0.3s ease"
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
                </HStack>
              </Button>

              {/* Dropdown List */}
              {isDropdownOpen && !loadingClients && (
                <Box
                  position="absolute"
                  top="calc(100% + 8px)"
                  left={0}
                  right={0}
                  bg="white"
                  borderRadius="12px"
                  border="2px solid"
                  borderColor="blue.400"
                  boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  zIndex={1000}
                  maxH="280px"
                  overflowY="auto"
                  animation="slideDown 0.3s ease"
                >
                  {clients.length === 0 ? (
                    <Box p={6} textAlign="center">
                      <Text fontSize="sm" color="gray.500">
                        No clients found
                      </Text>
                    </Box>
                  ) : (
                    clients
                      .sort((a, b) => {
                        if (a.isActive === b.isActive) {
                          return a.name.localeCompare(b.name);
                        }
                        return a.isActive ? -1 : 1;
                      })
                      .map((client, index) => (
                        <Box
                          key={client.id}
                          p={4}
                          bg={index % 2 === 0 ? '#EBF8FF' : 'white'}
                          borderBottom={
                            index < clients.length - 1
                              ? '1px solid #BEE3F8'
                              : 'none'
                          }
                          cursor="pointer"
                          transition="all 0.2s ease"
                          _hover={{
                            bg: '#BEE3F8',
                            paddingLeft: 6,
                          }}
                          onClick={() => {
                            handleClientSelect(client.id);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <HStack justify="space-between">
                            <HStack gap={2}>
                              <Text
                                fontSize="15px"
                                fontWeight={client.isActive ? '600' : '500'}
                                color={client.isActive ? '#1A365D' : '#718096'}
                              >
                                {client.isActive ? '●' : '○'} {client.name}
                              </Text>
                            </HStack>
                            {!client.isActive && (
                              <Badge colorScheme="red" fontSize="xs">
                                Inactive
                              </Badge>
                            )}
                          </HStack>
                        </Box>
                      ))
                  )}
                </Box>
              )}

              {/* Scroll Indicator */}
              {isDropdownOpen && clients.length > 5 && (
                <HStack
                  position="absolute"
                  bottom="-10"
                  left="50%"
                  transform="translateX(-50%)"
                  gap={1}
                  bg="white"
                  px={3}
                  py={1}
                  borderRadius="full"
                  boxShadow="md"
                  fontSize="xs"
                  color="gray.500"
                  border="1px solid"
                  borderColor="gray.200"
                  zIndex={1001}
                >
                  <Text fontWeight="medium">Scroll for more</Text>
                  <Box animation="bounce 1s infinite">↓</Box>
                </HStack>
              )}
            </Box>

            {/* Loading State */}
            {loadingClients && (
              <HStack justify="center" p={8}>
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
              </HStack>
            )}

            {/* Custom Styles */}
            <style jsx>{`
              @keyframes pulse {
                0%,
                100% {
                  opacity: 1;
                }
                50% {
                  opacity: 0.5;
                }
              }

              @keyframes bounce {
                0%,
                100% {
                  transform: translateY(0);
                }
                50% {
                  transform: translateY(-6px);
                }
              }

              @keyframes slideDown {
                from {
                  opacity: 0;
                  transform: translateY(-10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }

              div::-webkit-scrollbar {
                width: 8px;
              }

              div::-webkit-scrollbar-track {
                background: #ebf8ff;
                border-radius: 0 12px 12px 0;
              }

              div::-webkit-scrollbar-thumb {
                background: #90cdf4;
                border-radius: 10px;
              }

              div::-webkit-scrollbar-thumb:hover {
                background: #63b3ed;
              }
            `}</style>
          </VStack>
        </Card.Root>

        {/* Form Card */}
        {selectedClientId && (
          <Card.Root p={6}>
            <form onSubmit={handleSubmit}>
              <VStack align="stretch" gap={6}>
                <VStack align="start" gap={1}>
                  <Text fontSize="lg" fontWeight="bold">
                    Client Information
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Update the client details below
                  </Text>
                </VStack>

                {/* Client Name */}
                <Box>
                  <HStack mb={2}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      Client Name
                    </Text>
                    <Text fontSize="sm" color="red.500">
                      *
                    </Text>
                  </HStack>
                  <Input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter client name"
                    bg="white"
                    borderColor={validationErrors.name ? 'red.500' : 'gray.300'}
                  />
                  {validationErrors.name && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      {validationErrors.name}
                    </Text>
                  )}
                </Box>

                {/* Contact Email */}
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.700"
                    mb={2}
                  >
                    Contact Email
                  </Text>
                  <Input
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    bg="white"
                    borderColor={
                      validationErrors.contactEmail ? 'red.500' : 'gray.300'
                    }
                  />
                  {validationErrors.contactEmail && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      {validationErrors.contactEmail}
                    </Text>
                  )}
                </Box>

                {/* Contact Phone */}
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.700"
                    mb={2}
                  >
                    Contact Phone
                  </Text>
                  <Input
                    name="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="+1-234-567-8900"
                    bg="white"
                    borderColor={
                      validationErrors.contactPhone ? 'red.500' : 'gray.300'
                    }
                  />
                  {validationErrors.contactPhone && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      {validationErrors.contactPhone}
                    </Text>
                  )}
                </Box>

                {/* Address */}
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.700"
                    mb={2}
                  >
                    Address
                  </Text>
                  <Textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter client address"
                    bg="white"
                    rows={3}
                    resize="vertical"
                  />
                </Box>

                {/* Status Toggle */}
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.700"
                    mb={2}
                  >
                    Status
                  </Text>
                  <HStack gap={4}>
                    <Button
                      type="button"
                      size="md"
                      variant={formData.isActive ? 'solid' : 'outline'}
                      colorScheme={formData.isActive ? 'green' : 'gray'}
                      onClick={() => handleStatusToggle(true)}
                      borderWidth="2px"
                    >
                      {formData.isActive && '✓ '}Active
                    </Button>
                    <Button
                      type="button"
                      size="md"
                      variant={!formData.isActive ? 'solid' : 'outline'}
                      colorScheme={!formData.isActive ? 'red' : 'gray'}
                      onClick={() => handleStatusToggle(false)}
                      borderWidth="2px"
                    >
                      {!formData.isActive && '✓ '}Inactive
                    </Button>
                  </HStack>
                  <Box mt={2} p={2} bg="gray.50" borderRadius="md">
                    <Text fontSize="xs" fontWeight="medium" color="gray.700">
                      Currently:{' '}
                      <strong
                        style={{ color: formData.isActive ? 'green' : 'red' }}
                      >
                        {formData.isActive ? 'Active' : 'Inactive'}
                      </strong>
                      {activeProjectsCount > 0 && formData.isActive && (
                        <Text as="span" color="orange.600" ml={2}>
                          • Has {activeProjectsCount} active{' '}
                          {activeProjectsCount === 1 ? 'project' : 'projects'}
                        </Text>
                      )}
                    </Text>
                  </Box>
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
                    {loading ? 'Updating...' : 'Update Client'}
                  </Button>
                </HStack>
              </VStack>
            </form>
          </Card.Root>
        )}
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
