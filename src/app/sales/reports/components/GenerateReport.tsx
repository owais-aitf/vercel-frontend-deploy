'use client';

import { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Text,
  Card,
  Button,
  Spinner,
  Box,
} from '@chakra-ui/react';
import { toaster } from '@/components/ui/toaster';
import { salesService } from '@/shared/service/salesService';
import apiClient from '@/shared/lib/api-client';

interface Assignment {
  id: string;
  engineer: {
    fullName: string;
    email: string;
  };
  project: {
    projectName: string;
    client: {
      name: string;
    };
  };
  assignmentStart: string;
  assignmentEnd: string | null;
  isActive: boolean;
}

export function GenerateReport() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [fetchingAssignments, setFetchingAssignments] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setFetchingAssignments(true);
      const response = await apiClient.get('/assignments');
      if (response.data?.success) {
        setAssignments(response.data.data || []);
      }
    } catch {
      toaster.create({
        title: 'Error',
        description: 'Failed to fetch assignments',
        type: 'error',
      });
    } finally {
      setFetchingAssignments(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedAssignment) {
      toaster.create({
        title: 'Validation Error',
        description: 'Please select an assignment',
        type: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await salesService.generateReport(
        selectedAssignment,
        year,
        month
      );

      if (response.success) {
        toaster.create({
          title: 'Success',
          description: response.message || 'Report generated successfully',
          type: 'success',
        });
        // Reset form
        setSelectedAssignment('');
        setYear(new Date().getFullYear());
        setMonth(new Date().getMonth() + 1);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toaster.create({
        title: 'Error',
        description: errorMessage || 'Failed to generate report',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedAssignmentData = assignments.find(
    (a) => a.id === selectedAssignment
  );

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <Card.Root>
      <Card.Body p={6}>
        <VStack align="stretch" gap={6}>
          {/* Header */}
          <VStack align="start" gap={2}>
            <Text fontSize="xl" fontWeight="bold">
              Generate Monthly Report
            </Text>
            <Text color="gray.600" fontSize="sm">
              Select an assignment and period to generate a monthly billing
              report
            </Text>
          </VStack>

          {/* Form */}
          <VStack align="stretch" gap={4}>
            {/* Assignment Selection */}
            <Box>
              <Text fontSize="sm" mb={2} fontWeight="medium">
                Assignment{' '}
                <Text as="span" color="red.500">
                  *
                </Text>
              </Text>
              {fetchingAssignments ? (
                <HStack p={3} borderWidth="1px" borderRadius="md">
                  <Spinner size="sm" />
                  <Text fontSize="sm">Loading assignments...</Text>
                </HStack>
              ) : (
                <select
                  value={selectedAssignment}
                  onChange={(e) => setSelectedAssignment(e.target.value)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Select assignment</option>
                  {assignments.map((assignment) => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.engineer.fullName} -{' '}
                      {assignment.project.projectName} (
                      {assignment.project.client.name})
                    </option>
                  ))}
                </select>
              )}
            </Box>

            {/* Selected Assignment Details */}
            {selectedAssignmentData && (
              <Card.Root bg="blue.50" borderColor="blue.200">
                <Card.Body p={4}>
                  <VStack align="start" gap={2}>
                    <Text fontSize="sm" fontWeight="bold" color="blue.900">
                      Selected Assignment Details
                    </Text>
                    <HStack gap={4} flexWrap="wrap">
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color="blue.700">
                          Engineer
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {selectedAssignmentData.engineer.fullName}
                        </Text>
                      </VStack>
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color="blue.700">
                          Project
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {selectedAssignmentData.project.projectName}
                        </Text>
                      </VStack>
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color="blue.700">
                          Client
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {selectedAssignmentData.project.client.name}
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </Card.Body>
              </Card.Root>
            )}

            {/* Period Selection */}
            <HStack gap={4} align="start">
              <Box flex={1}>
                <Text fontSize="sm" mb={2} fontWeight="medium">
                  Year{' '}
                  <Text as="span" color="red.500">
                    *
                  </Text>
                </Text>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </Box>

              <Box flex={1}>
                <Text fontSize="sm" mb={2} fontWeight="medium">
                  Month{' '}
                  <Text as="span" color="red.500">
                    *
                  </Text>
                </Text>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </Box>
            </HStack>

            {/* Info Box */}
            <Card.Root bg="gray.50" borderColor="gray.200">
              <Card.Body p={4}>
                <VStack align="start" gap={2}>
                  <Text fontSize="sm" fontWeight="bold" color="gray.700">
                    ℹ️ Report Generation Notes
                  </Text>
                  <VStack align="start" gap={1} fontSize="xs" color="gray.600">
                    <Text>
                      • Report will be generated based on attendance records for
                      the selected period
                    </Text>
                    <Text>
                      • If a report already exists, it will be regenerated with
                      status reset to DRAFT
                    </Text>
                    <Text>
                      • Settlement calculations will be based on the
                      project&apos;s billing configuration
                    </Text>
                    <Text>
                      • Generated reports can be reviewed and approved from the
                      &quot;View All Reports&quot; tab
                    </Text>
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          </VStack>

          {/* Actions */}
          <HStack justify="flex-end" gap={3}>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedAssignment('');
                setYear(new Date().getFullYear());
                setMonth(new Date().getMonth() + 1);
              }}
              disabled={loading}
            >
              Reset
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleGenerate}
              loading={loading}
              disabled={!selectedAssignment || loading}
            >
              Generate Report
            </Button>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
