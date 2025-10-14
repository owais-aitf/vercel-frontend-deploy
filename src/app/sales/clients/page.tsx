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
  { label: 'Update Client Info', href: '/sales/clients/update', icon: '✏️' },
  { label: 'Client Projects', href: '/sales/clients/projects', icon: '📁' },
];

export default function ClientsPage() {
  const { user } = useContext(AuthContext);
  console.log('User from AuthContext:', user);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');

  // Modal state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [clientsPerPage] = useState(9); // 3x3 grid

  // Helper function to get user initials
  const getUserInitials = () => {
    if (!user?.fullName) return 'SR';
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.fullName.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await clientService.getClients();
      const clientsData = response.data || [];
      setClients(clientsData);
      setFilteredClients(clientsData);
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      setError(errorMessage || 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...clients];

    if (statusFilter === 'active') {
      filtered = filtered.filter((client) => client.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((client) => !client.isActive);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.contactEmail
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          client.contactPhone?.includes(searchTerm)
      );
    }

    setFilteredClients(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, clients]);

  // Pagination calculations
  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(
    indexOfFirstClient,
    indexOfLastClient
  );
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openClientModal = (client: Client) => {
    setSelectedClient(client);
  };

  const closeClientModal = () => {
    setSelectedClient(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const activeCount = clients.filter((c) => c.isActive).length;
  const inactiveCount = clients.length - activeCount;

  return (
    <FeatureErrorBoundary featureName="Clients">
      <DashboardLayout
        navigation={salesNavigation}
        pageTitle="Client Management"
        pageSubtitle="Manage clients and their project associations"
        userName={user?.fullName || 'Sales Representative'}
        userInitials={getUserInitials()}
        notificationCount={0}
      >
        {/* Tab Navigation */}
        <TabNavigation tabs={clientTabs} />

        {/* Stats Cards */}
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
          gap={4}
          mb={6}
        >
          <Card.Root p={4} bg="blue.50">
            <VStack align="start" gap={2}>
              <Text fontSize="sm" color="blue.700" fontWeight="medium">
                Total Clients
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.900">
                {clients.length}
              </Text>
            </VStack>
          </Card.Root>

          <Card.Root p={4} bg="green.50">
            <VStack align="start" gap={2}>
              <Text fontSize="sm" color="green.700" fontWeight="medium">
                Active Clients
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.900">
                {activeCount}
              </Text>
            </VStack>
          </Card.Root>

          <Card.Root p={4} bg="red.50">
            <VStack align="start" gap={2}>
              <Text fontSize="sm" color="red.700" fontWeight="medium">
                Inactive Clients
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="red.900">
                {inactiveCount}
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
                  placeholder="Search by name, email, or phone..."
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
                    <option value="all">All Clients</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </Box>
              </Box>
            </Grid>

            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">
                Showing <strong>{filteredClients.length}</strong> clients
              </Text>
              <Button
                onClick={fetchClients}
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
              <Text color="gray.600">Loading clients...</Text>
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

        {!loading && !error && filteredClients.length === 0 && (
          <Card.Root p={8}>
            <VStack gap={4}>
              <Text fontSize="4xl">📭</Text>
              <Text fontSize="lg" fontWeight="bold">
                No Clients Found
              </Text>
              <Text color="gray.600">
                {clients.length === 0
                  ? 'No clients have been added yet.'
                  : 'No clients match your filters.'}
              </Text>
            </VStack>
          </Card.Root>
        )}

        {/* Clients Grid */}
        {!loading && !error && currentClients.length > 0 && (
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
              {currentClients.map((client) => (
                <Card.Root
                  key={client.id}
                  p={5}
                  _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
                  cursor="pointer"
                  onClick={() => openClientModal(client)}
                >
                  <VStack align="stretch" gap={3}>
                    <HStack justify="space-between" align="start">
                      <Text fontSize="lg" fontWeight="bold" flex={1}>
                        {client.name}
                      </Text>
                      <Badge
                        colorScheme={client.isActive ? 'green' : 'red'}
                        fontSize="xs"
                      >
                        {client.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </HStack>

                    {client.contactEmail && (
                      <HStack gap={2}>
                        <Text fontSize="sm" color="gray.500">
                          📧
                        </Text>
                        <Text fontSize="sm" color="gray.700">
                          {client.contactEmail}
                        </Text>
                      </HStack>
                    )}

                    {client.contactPhone && (
                      <HStack gap={2}>
                        <Text fontSize="sm" color="gray.500">
                          📱
                        </Text>
                        <Text fontSize="sm" color="gray.700">
                          {client.contactPhone}
                        </Text>
                      </HStack>
                    )}

                    {client.address && (
                      <HStack gap={2} align="start">
                        <Text fontSize="sm" color="gray.500">
                          📍
                        </Text>
                        <Text
                          fontSize="sm"
                          color="gray.700"
                          lineClamp={2}
                          flex={1}
                        >
                          {client.address}
                        </Text>
                      </HStack>
                    )}

                    <Button
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      w="full"
                      mt={2}
                    >
                      View Details
                    </Button>
                  </VStack>
                </Card.Root>
              ))}
            </Grid>

            {/* Pagination */}
            <Card.Root p={4}>
              <HStack
                justify="space-between"
                align="center"
                flexWrap="wrap"
                gap={4}
              >
                <Text fontSize="sm" color="gray.600">
                  Showing {indexOfFirstClient + 1} to{' '}
                  {Math.min(indexOfLastClient, filteredClients.length)} of{' '}
                  {filteredClients.length} clients
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

        {/* Client Details Modal */}
        {selectedClient && (
          <>
            {/* Backdrop */}
            <Box
              position="fixed"
              inset={0}
              bg="blackAlpha.600"
              zIndex={999}
              onClick={closeClientModal}
            />

            {/* Modal */}
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
                {/* Header */}
                <HStack
                  justify="space-between"
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  pb={4}
                >
                  <VStack align="start" gap={1}>
                    <Text fontSize="xl" fontWeight="bold">
                      Client Details
                    </Text>
                    <Badge
                      colorScheme={selectedClient.isActive ? 'green' : 'red'}
                      fontSize="sm"
                    >
                      {selectedClient.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </VStack>
                  <Box
                    as="button"
                    onClick={closeClientModal}
                    cursor="pointer"
                    fontSize="24px"
                    color="gray.500"
                    _hover={{ color: 'gray.700' }}
                  >
                    ✕
                  </Box>
                </HStack>

                {/* Content */}
                <VStack align="stretch" gap={4} pt={2}>
                  {/* Client Name */}
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Client Name
                    </Text>
                    <Text fontSize="md" fontWeight="medium">
                      {selectedClient.name}
                    </Text>
                  </Box>

                  {/* Contact Email */}
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Contact Email
                    </Text>
                    <HStack gap={2}>
                      <Text fontSize="sm">📧</Text>
                      <Text fontSize="md">
                        {selectedClient.contactEmail || 'Not provided'}
                      </Text>
                    </HStack>
                  </Box>

                  {/* Contact Phone */}
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Contact Phone
                    </Text>
                    <HStack gap={2}>
                      <Text fontSize="sm">📱</Text>
                      <Text fontSize="md">
                        {selectedClient.contactPhone || 'Not provided'}
                      </Text>
                    </HStack>
                  </Box>

                  {/* Address */}
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Address
                    </Text>
                    <Box
                      p={3}
                      bg="gray.50"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                    >
                      <HStack gap={2} align="start">
                        <Text fontSize="sm">📍</Text>
                        <Text fontSize="sm" color="gray.700">
                          {selectedClient.address || 'Not provided'}
                        </Text>
                      </HStack>
                    </Box>
                  </Box>

                  {/* Timestamps */}
                  <Box pt={4} borderTop="1px solid" borderColor="gray.200">
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          Created At
                        </Text>
                        <Text fontSize="sm">
                          {formatDate(selectedClient.createdAt)}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          Last Updated
                        </Text>
                        <Text fontSize="sm">
                          {formatDate(selectedClient.updatedAt)}
                        </Text>
                      </Box>
                    </Grid>
                  </Box>

                  {/* Client ID */}
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Client ID
                    </Text>
                    <Text fontSize="xs" fontFamily="mono" color="gray.600">
                      {selectedClient.id}
                    </Text>
                  </Box>
                </VStack>

                {/* Footer */}
                <HStack
                  justify="flex-end"
                  pt={4}
                  borderTop="1px solid"
                  borderColor="gray.200"
                >
                  <Button onClick={closeClientModal} colorScheme="blue">
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
