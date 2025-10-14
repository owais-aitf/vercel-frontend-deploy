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
  { label: 'Update Client', href: '/sales/clients/update', icon: '✏️' },
  { label: 'Client Projects', href: '/sales/clients/projects', icon: '📁' },
];

export default function ClientsPage() {
  const { user } = useContext(AuthContext);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...clients];

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((client) => client.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((client) => !client.isActive);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.contactPhone?.includes(searchTerm)
      );
    }

    setFilteredClients(filtered);
  }, [searchTerm, statusFilter, clients]);

  const activeCount = clients.filter((c) => c.isActive).length;
  const inactiveCount = clients.length - activeCount;

  return (
    <FeatureErrorBoundary featureName="Clients">
      <DashboardLayout
        navigation={salesNavigation}
        pageTitle="Client Management"
        pageSubtitle="Manage clients and their project associations"
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
        <TabNavigation tabs={clientTabs} />

        {/* Stats Cards */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4} mb={6}>
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

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
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
                    onChange={(e) => setStatusFilter(e.target.value as any)}
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
        {!loading && !error && filteredClients.length > 0 && (
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
            gap={6}
          >
            {filteredClients.map((client) => (
              <Card.Root
                key={client.id}
                p={5}
                _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                <VStack align="stretch" gap={3}>
                  <HStack justify="space-between" align="start">
                    <Text fontSize="lg" fontWeight="bold" flex={1}>
                      {client.name}
                    </Text>
                    <Badge colorScheme={client.isActive ? 'green' : 'red'} fontSize="xs">
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
                    <HStack gap={2}>
                      <Text fontSize="sm" color="gray.500">
                        📍
                      </Text>
                      <Text 
                        fontSize="sm" 
                        color="gray.700"
                        lineClamp={2}
                      >
                        {client.address}
                      </Text>
                    </HStack>
                  )}

                  <HStack gap={2} mt={2}>
                    <Button size="sm" colorScheme="blue" variant="outline" flex={1}>
                      View Details
                    </Button>
                    <Button size="sm" colorScheme="green" variant="ghost">
                      ✏️
                    </Button>
                  </HStack>
                </VStack>
              </Card.Root>
            ))}
          </Grid>
        )}
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
