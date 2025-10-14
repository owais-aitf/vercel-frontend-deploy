'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  Input,
  Textarea,
} from '@chakra-ui/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { salesNavigation } from '@/shared/config/navigation';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { AuthContext } from '@/context/AuthContext';
import { clientService } from '@/shared/service/clientService';

const clientTabs = [
  { label: 'View All Clients', href: '/sales/clients', icon: '👥' },
  { label: 'Add New Client', href: '/sales/clients/add', icon: '➕' },
  { label: 'Update Client Info', href: '/sales/clients/update', icon: '✏️' },
  { label: 'Client Projects', href: '/sales/clients/projects', icon: '📁' },
];

export default function AddClientPage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

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

    // Client name is required
    if (!formData.name.trim()) {
      errors.name = 'Client name is required';
    }

    // Email validation (if provided)
    if (formData.contactEmail && !isValidEmail(formData.contactEmail)) {
      errors.contactEmail = 'Please enter a valid email address';
    }

    // Phone validation (if provided)
    if (formData.contactPhone && !isValidPhone(formData.contactPhone)) {
      errors.contactPhone = 'Please enter a valid phone number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Email validation helper
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation helper
  const isValidPhone = (phone: string) => {
    // Basic phone validation - at least 10 digits
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      // Prepare data for API - ALWAYS include ALL fields
      const dataToSubmit: {
        name: string;
        isActive: boolean;
        contactEmail?: string;
        contactPhone?: string;
        address?: string;
      } = {
        name: formData.name.trim(),
        isActive: formData.isActive, // ✅ This is the key - always send it
      };

      // Add optional fields
      if (formData.contactEmail.trim()) {
        dataToSubmit.contactEmail = formData.contactEmail.trim();
      }

      if (formData.contactPhone.trim()) {
        dataToSubmit.contactPhone = formData.contactPhone.trim();
      }

      if (formData.address.trim()) {
        dataToSubmit.address = formData.address.trim();
      }

      // Debug log
      console.log('📤 Submitting client data:', dataToSubmit);

      // Call API
      const response = await clientService.createClient(dataToSubmit);

      console.log('✅ Response from API:', response);

      if (response.success) {
        setSuccess(true);

        // Reset form to default (active)
        setFormData({
          name: '',
          contactEmail: '',
          contactPhone: '',
          address: '',
          isActive: true,
        });

        // Redirect to view clients after 2 seconds
        setTimeout(() => {
          router.push('/sales/clients');
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Error creating client:', error);

      // Extract the actual error message from the response
      let errorMessage = 'Failed to create client. Please try again.';

      const err = error as {
        response?: { data?: { error?: string; message?: string } };
        message?: string;
      };
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/sales/clients');
  };

  // Handle reset
  const handleReset = () => {
    setFormData({
      name: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      isActive: true,
    });
    setValidationErrors({});
    setError('');
    setSuccess(false);
  };

  return (
    <FeatureErrorBoundary featureName="Add Client">
      <DashboardLayout
        navigation={salesNavigation}
        pageTitle="Add New Client"
        pageSubtitle="Register a new client in the system"
        userName={user?.fullName || 'Sales Representative'}
        userInitials={getUserInitials()}
        notificationCount={0}
      >
        {/* Tab Navigation */}
        <TabNavigation tabs={clientTabs} />

        {/* Success Popup/Toast */}
        {success && (
          <>
            {/* Backdrop */}
            <Box
              position="fixed"
              inset={0}
              bg="blackAlpha.400"
              zIndex={999}
              animation="fadeIn 0.3s ease"
            />

            {/* Success Popup */}
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
                {/* Success Icon */}
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

                {/* Success Message */}
                <VStack gap={2} textAlign="center">
                  <Text fontSize="xl" fontWeight="bold" color="gray.800">
                    Success!
                  </Text>
                  <Text fontSize="md" color="gray.600">
                    Client Created successfully
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Redirecting to clients list...
                  </Text>
                </VStack>

                {/* Loading Bar */}
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

            {/* CSS Animations */}
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
          <>
            {/* Backdrop */}
            <Box
              position="fixed"
              inset={0}
              bg="blackAlpha.500"
              zIndex={999}
              animation="fadeIn 0.3s ease"
              onClick={() => setError('')}
            />

            {/* Error Popup */}
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
              animation="slideIn 0.3s ease"
            >
              <VStack gap={4} align="stretch">
                {/* Error Icon & Title */}
                <HStack gap={3}>
                  <Box
                    w="50px"
                    h="50px"
                    borderRadius="full"
                    bg="red.100"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="2xl">❌</Text>
                  </Box>
                  <VStack align="start" gap={0}>
                    <Text fontSize="lg" fontWeight="bold" color="red.800">
                      Failed to Create Client
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {error.toLowerCase().includes('email') &&
                      error.toLowerCase().includes('already')
                        ? 'Duplicate Email Address'
                        : error.toLowerCase().includes('name') &&
                            error.toLowerCase().includes('already')
                          ? 'Duplicate Client Name'
                          : 'Unable to process request'}
                    </Text>
                  </VStack>
                </HStack>

                {/* Error Message */}
                <Box
                  p={4}
                  bg="red.50"
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderColor="red.400"
                >
                  <Text fontSize="sm" color="gray.700" fontWeight="medium">
                    {error}
                  </Text>
                </Box>

                {/* Helpful Tips */}
                <Box p={4} bg="blue.50" borderRadius="md">
                  <Text fontSize="xs" fontWeight="bold" color="blue.800" mb={2}>
                    💡 How to fix this:
                  </Text>

                  {error.toLowerCase().includes('email') &&
                  error.toLowerCase().includes('already') ? (
                    <VStack align="start" gap={1}>
                      <Text fontSize="xs" color="blue.700">
                        • Use a different email address for this client
                      </Text>
                      <Text fontSize="xs" color="blue.700">
                        • Or leave the email field empty (it&apos;s optional)
                      </Text>
                      <Text fontSize="xs" color="blue.700">
                        • You can add the email later when updating the client
                      </Text>
                    </VStack>
                  ) : error.toLowerCase().includes('name') &&
                    error.toLowerCase().includes('already') ? (
                    <VStack align="start" gap={1}>
                      <Text fontSize="xs" color="blue.700">
                        • Use a different name for this client
                      </Text>
                      <Text fontSize="xs" color="blue.700">
                        • Or add additional details to make it unique (e.g.,
                        location, department)
                      </Text>
                      <Text fontSize="xs" color="blue.700">
                        • Check the existing clients list to avoid duplicates
                      </Text>
                    </VStack>
                  ) : (
                    <VStack align="start" gap={1}>
                      <Text fontSize="xs" color="blue.700">
                        • Check all required fields are filled correctly
                      </Text>
                      <Text fontSize="xs" color="blue.700">
                        • Ensure email format is valid (e.g., user@example.com)
                      </Text>
                      <Text fontSize="xs" color="blue.700">
                        • Try again in a few moments
                      </Text>
                    </VStack>
                  )}
                </Box>

                {/* Action Button */}
                <Button
                  colorScheme="blue"
                  onClick={() => setError('')}
                  w="full"
                  size="lg"
                >
                  Got it, I&apos;ll fix this
                </Button>
              </VStack>
            </Box>

            {/* CSS Animations */}
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
            `}</style>
          </>
        )}
        {/* Info Card */}
        <Card.Root p={6} mt={6} mb={6} bg="blue.50">
          <VStack align="start" gap={2}>
            <HStack gap={2}>
              <Text fontSize="lg">ℹ️</Text>
              <Text fontSize="md" fontWeight="bold" color="blue.900">
                Important Information
              </Text>
            </HStack>
            <VStack align="start" gap={1} pl={7}>
              <Text fontSize="sm" color="blue.700">
                • Client name is required (minimum 2 characters)
              </Text>
              {/* <Text fontSize="sm" color="blue.700">
                • Multiple clients can have the same name
              </Text> */}
              <Text fontSize="sm" color="blue.700">
                • Email must be unique - cannot have duplicate emails
              </Text>
              {/* <Text fontSize="sm" color="blue.700">
                • Contact information is optional but recommended
              </Text> */}
              {/* <Text fontSize="sm" color="blue.700">
                • Active status determines if client can be assigned to projects
              </Text> */}
            </VStack>
          </VStack>
        </Card.Root>

        {/* Form Card */}
        <Card.Root p={6}>
          <form onSubmit={handleSubmit}>
            <VStack align="stretch" gap={6}>
              {/* Form Title */}
              <VStack align="start" gap={1}>
                <Text fontSize="lg" fontWeight="bold">
                  Client Information
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Enter the details of the new client below
                </Text>
              </VStack>

              {/* Client Name - Required */}
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
                  _hover={{
                    borderColor: validationErrors.name ? 'red.600' : 'gray.400',
                  }}
                  _focus={{
                    borderColor: validationErrors.name ? 'red.500' : 'blue.500',
                    boxShadow: validationErrors.name
                      ? '0 0 0 1px red'
                      : '0 0 0 1px blue',
                  }}
                />
                {validationErrors.name && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    {validationErrors.name}
                  </Text>
                )}
              </Box>

              {/* Contact Email - Optional */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
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
                  _hover={{
                    borderColor: validationErrors.contactEmail
                      ? 'red.600'
                      : 'gray.400',
                  }}
                  _focus={{
                    borderColor: validationErrors.contactEmail
                      ? 'red.500'
                      : 'blue.500',
                    boxShadow: validationErrors.contactEmail
                      ? '0 0 0 1px red'
                      : '0 0 0 1px blue',
                  }}
                />
                {validationErrors.contactEmail && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    {validationErrors.contactEmail}
                  </Text>
                )}
              </Box>

              {/* Contact Phone - Optional */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
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
                  _hover={{
                    borderColor: validationErrors.contactPhone
                      ? 'red.600'
                      : 'gray.400',
                  }}
                  _focus={{
                    borderColor: validationErrors.contactPhone
                      ? 'red.500'
                      : 'blue.500',
                    boxShadow: validationErrors.contactPhone
                      ? '0 0 0 1px red'
                      : '0 0 0 1px blue',
                  }}
                />
                {validationErrors.contactPhone && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    {validationErrors.contactPhone}
                  </Text>
                )}
              </Box>

              {/* Address - Optional */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
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
                  borderColor="gray.300"
                  _hover={{ borderColor: 'gray.400' }}
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px blue',
                  }}
                />
              </Box>

              {/* Status Toggle - FIXED VERSION */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                  Status
                </Text>
                <HStack gap={4}>
                  <Button
                    type="button"
                    size="md"
                    variant={formData.isActive ? 'solid' : 'outline'}
                    colorScheme={formData.isActive ? 'green' : 'gray'}
                    onClick={() => {
                      console.log('🟢 Setting to ACTIVE');
                      setFormData((prev) => ({ ...prev, isActive: true }));
                    }}
                    borderWidth="2px"
                  >
                    {formData.isActive && '✓ '}Active
                  </Button>
                  <Button
                    type="button"
                    size="md"
                    variant={!formData.isActive ? 'solid' : 'outline'}
                    colorScheme={!formData.isActive ? 'red' : 'gray'}
                    onClick={() => {
                      console.log('🔴 Setting to INACTIVE');
                      setFormData((prev) => ({ ...prev, isActive: false }));
                    }}
                    borderWidth="2px"
                  >
                    {!formData.isActive && '✓ '}Inactive
                  </Button>
                </HStack>
                <Box mt={2} p={2} bg="gray.50" borderRadius="md">
                  <Text fontSize="xs" fontWeight="medium" color="gray.700">
                    Currently selected:{' '}
                    <strong
                      style={{ color: formData.isActive ? 'green' : 'red' }}
                    >
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </strong>
                  </Text>
                  {/* <Text fontSize="xs" color="gray.500" mt={1}>
                    {formData.isActive 
                      ? '✓ This client can be assigned to new projects' 
                      : '✗ This client cannot be assigned to new projects'}
                  </Text> */}
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
                  {loading ? 'Creating...' : 'Create Client'}
                </Button>
              </HStack>
            </VStack>
          </form>
        </Card.Root>
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
