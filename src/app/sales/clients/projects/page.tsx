'use client';

import { useState, useEffect, useContext,useRef } from 'react';
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
import { clientService, Client } from '@/shared/service/clientService';

const clientTabs = [
  { label: 'View All Clients', href: '/sales/clients', icon: '👥' },
  { label: 'Add New Client', href: '/sales/clients/add', icon: '➕' },
  { label: 'Update Client Info', href: '/sales/clients/update', icon: '✏️' },
  { label: 'Client Projects', href: '/sales/clients/projects', icon: '📁' },
];

interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string | null;
  budget: number;
  isActive: boolean;
  clientId: string;
  createdAt: string;
  updatedAt: string;
}

interface ClientWithProjects extends Client {
  projects: Project[];
}

export default function ClientProjectsPage() {
  const { user } = useContext(AuthContext);

  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientProjects, setClientProjects] = useState<Project[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const dropdownRef = useRef<HTMLDivElement>(null);


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

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await clientService.getClients();
      setClients(response.data || []);
    } catch (err: any) {
      setError('Failed to load clients');
    } finally {
      setLoadingClients(false);
    }
  };

  // Close dropdown when clicking outside
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);


  // Fetch projects for selected client
  const handleClientSelect = async (clientId: string) => {
    setSelectedClientId(clientId);
    setError('');
    setClientProjects([]);
    setSelectedClient(null);
    setSearchQuery('');
    setFilterStatus('all');

    if (!clientId) return;

    try {
      setLoadingProjects(true);

      // Get client details with projects
      const response = await clientService.getClientById(clientId);
      const client = response.data as ClientWithProjects;

      setSelectedClient(client);

      // ✅ Map backend field names to frontend field names
      const mappedProjects = (client.projects || []).map((project: any) => ({
        id: project.id || '',
        name: project.name || project.projectName || 'Untitled Project',
        description: project.description || '',
        startDate: project.startDate || new Date().toISOString(),
        endDate: project.endDate || null,
        budget: typeof project.budget === 'number' ? project.budget : 0,
        isActive: project.isActive !== undefined ? project.isActive : true,
        clientId: project.clientId || clientId,
        createdAt: project.createdAt || new Date().toISOString(),
        updatedAt: project.updatedAt || new Date().toISOString(),
      }));

      setClientProjects(mappedProjects);
      console.log('✅ Mapped projects:', mappedProjects);
    } catch (err: any) {
      console.error('❌ Error loading projects:', err);
      setError('Failed to load client projects');
    } finally {
      setLoadingProjects(false);
    }
  };

  // Filter projects based on search and status
  const filteredProjects = clientProjects.filter((project) => {
    const projectName = (project.name || '').toLowerCase();
    const projectDesc = (project.description || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      projectName.includes(query) || projectDesc.includes(query);

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && project.isActive) ||
      (filterStatus === 'inactive' && !project.isActive);

    return matchesSearch && matchesStatus;
  });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate project stats (without total budget)
  const projectStats = {
    total: clientProjects.length,
    active: clientProjects.filter((p) => p.isActive).length,
    inactive: clientProjects.filter((p) => !p.isActive).length,
  };

  return (
    <FeatureErrorBoundary featureName="Client Projects">
      <DashboardLayout
        navigation={salesNavigation}
        pageTitle="Client Projects"
        pageSubtitle="View all projects for each client"
        userName={user?.fullName || 'Sales Representative'}
        userInitials={getUserInitials()}
        notificationCount={0}
      >
        <TabNavigation tabs={clientTabs} />

        {/* Error Popup */}
        {error && (
          <>
            <Box
              position="fixed"
              inset={0}
              bg="blackAlpha.500"
              zIndex={999}
              onClick={() => setError('')}
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
            >
              <VStack gap={4}>
                <Box
                  w="60px"
                  h="60px"
                  borderRadius="full"
                  bg="red.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="2xl">⚠️</Text>
                </Box>
                <Text fontSize="lg" fontWeight="bold">
                  Error
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  {error}
                </Text>
                <Button
                  colorScheme="blue"
                  onClick={() => setError('')}
                  w="full"
                >
                  Close
                </Button>
              </VStack>
            </Box>
          </>
        )}

        {/* Client Selection */}
        <Card.Root p={6} mb={6} bg="gradient.to-br" bgGradient="linear(to-br, blue.50, white)">
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
            Select Client
          </Text>
        </HStack>
        <Text fontSize="sm" color="gray.600">
          Choose a client to view their projects
        </Text>
      </VStack>
      {clients.length > 0 && (
        <Badge colorScheme="blue" fontSize="xs" px={3} py={1} borderRadius="full">
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
        borderColor={isDropdownOpen ? 'blue.500' : 'gray.200'}
        borderRadius="12px"
        _hover={{ borderColor: 'blue.300', bg: 'gray.50' }}
        _active={{ bg: 'blue.50' }}
        boxShadow={isDropdownOpen ? '0 0 0 4px rgba(66, 153, 225, 0.15)' : 'sm'}
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
            <Text fontSize="15px" fontWeight="500" color={selectedClientId ? 'gray.800' : 'gray.500'}>
              {selectedClientId
                ? `${clients.find((c) => c.id === selectedClientId)?.isActive ? '●' : '○'} ${
                    clients.find((c) => c.id === selectedClientId)?.name
                  }`
                : '-- Click to select a client --'}
            </Text>
          </HStack>
          <Box
            color={isDropdownOpen ? 'blue.500' : 'gray.400'}
            transform={isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
            transition="all 0.3s ease"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
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
          borderColor="blue.500"
          boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          zIndex={1000}
          maxH="280px"
          overflowY="auto"
          animation="slideDown 0.3s ease"
        >
          {clients
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
                borderBottom={index < clients.length - 1 ? '1px solid #E2E8F0' : 'none'}
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
                    <Text fontSize="15px" fontWeight={client.isActive ? '600' : '500'} color={client.isActive ? '#1A365D' : '#718096'}>
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
            ))}
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

      /* Custom Scrollbar */
      div::-webkit-scrollbar {
        width: 8px;
      }

      div::-webkit-scrollbar-track {
        background: #f7fafc;
        border-radius: 0 12px 12px 0;
      }

      div::-webkit-scrollbar-thumb {
        background: #cbd5e0;
        border-radius: 10px;
      }

      div::-webkit-scrollbar-thumb:hover {
        background: #a0aec0;
      }
    `}</style>
  </VStack>
</Card.Root>

        {/* Client & Project Details */}
        {selectedClient && (
          <>
            {/* Client Info Card */}
            <Card.Root p={6} mb={6} bg="blue.50">
              <HStack justify="space-between" w="full">
                <VStack align="start" gap={1}>
                  <HStack gap={2}>
                    <Text fontSize="xl" fontWeight="bold">
                      {selectedClient.name}
                    </Text>
                    <Badge
                      colorScheme={selectedClient.isActive ? 'green' : 'red'}
                    >
                      {selectedClient.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    {selectedClient.contactEmail || 'No email provided'}
                  </Text>
                  {selectedClient.contactPhone && (
                    <Text fontSize="sm" color="gray.600">
                      📞 {selectedClient.contactPhone}
                    </Text>
                  )}
                </VStack>
              </HStack>
            </Card.Root>

            {/* Stats Cards - 3 cards only */}
            <Grid templateColumns="repeat(3, 1fr)" gap={4} mb={6}>
              <Card.Root p={5} bg="white" borderWidth="1px">
                <VStack align="start" gap={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Total Projects
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                    {projectStats.total}
                  </Text>
                </VStack>
              </Card.Root>

              <Card.Root p={5} bg="white" borderWidth="1px">
                <VStack align="start" gap={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Active Projects
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="green.600">
                    {projectStats.active}
                  </Text>
                </VStack>
              </Card.Root>

              <Card.Root p={5} bg="white" borderWidth="1px">
                <VStack align="start" gap={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Inactive Projects
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="red.600">
                    {projectStats.inactive}
                  </Text>
                </VStack>
              </Card.Root>
            </Grid>

            {/* Search and Filter */}
            <Card.Root p={6} mb={6}>
              <HStack gap={4} wrap="wrap">
                <Box flex={1} minW="300px">
                  <Input
                    placeholder="Search projects by name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg="white"
                  />
                </Box>
                <HStack gap={2}>
                  <Button
                    size="sm"
                    variant={filterStatus === 'all' ? 'solid' : 'outline'}
                    colorScheme={filterStatus === 'all' ? 'blue' : 'gray'}
                    onClick={() => setFilterStatus('all')}
                  >
                    All ({projectStats.total})
                  </Button>
                  <Button
                    size="sm"
                    variant={filterStatus === 'active' ? 'solid' : 'outline'}
                    colorScheme={filterStatus === 'active' ? 'green' : 'gray'}
                    onClick={() => setFilterStatus('active')}
                  >
                    Active ({projectStats.active})
                  </Button>
                  <Button
                    size="sm"
                    variant={filterStatus === 'inactive' ? 'solid' : 'outline'}
                    colorScheme={filterStatus === 'inactive' ? 'red' : 'gray'}
                    onClick={() => setFilterStatus('inactive')}
                  >
                    Inactive ({projectStats.inactive})
                  </Button>
                </HStack>
              </HStack>
            </Card.Root>

            {/* Projects List */}
            {loadingProjects ? (
              <Card.Root p={12}>
                <VStack gap={3}>
                  <Text fontSize="2xl">⏳</Text>
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
                    {searchQuery || filterStatus !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'This client has no projects yet'}
                  </Text>
                </VStack>
              </Card.Root>
            ) : (
              <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                {filteredProjects.map((project) => (
                  <Card.Root
                    key={project.id}
                    p={6}
                    _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                    borderWidth="1px"
                  >
                    <VStack align="stretch" gap={4}>
                      {/* Project Header */}
                      <HStack justify="space-between" align="start">
                        <Text
                          fontSize="lg"
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
                          {project.name}
                        </Text>
                        <Badge
                          colorScheme={project.isActive ? 'green' : 'red'}
                          flexShrink={0}
                        >
                          {project.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </HStack>

                      {/* Project Description */}
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        minH="60px"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        display="-webkit-box"
                        css={{
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {project.description || 'No description provided'}
                      </Text>

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
                            Budget:
                          </Text>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="green.600"
                          >
                            {formatCurrency(project.budget)}
                          </Text>
                        </HStack>
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
            )}
          </>
        )}
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
