'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
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
  const { t } = useTranslation('sales');
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
        title: t('reports.generate.error_title'),
        description: t('reports.generate.error_fetch'),
        type: 'error',
      });
    } finally {
      setFetchingAssignments(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedAssignment) {
      toaster.create({
        title: t('reports.generate.validation_error'),
        description: t('reports.generate.validation_message'),
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
          title: t('reports.generate.success_title'),
          description:
            response.message || t('reports.generate.success_message'),
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
        title: t('reports.generate.error_title'),
        description: errorMessage || t('reports.generate.error_generate'),
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
    { value: 1, label: t('reports.months.january') },
    { value: 2, label: t('reports.months.february') },
    { value: 3, label: t('reports.months.march') },
    { value: 4, label: t('reports.months.april') },
    { value: 5, label: t('reports.months.may') },
    { value: 6, label: t('reports.months.june') },
    { value: 7, label: t('reports.months.july') },
    { value: 8, label: t('reports.months.august') },
    { value: 9, label: t('reports.months.september') },
    { value: 10, label: t('reports.months.october') },
    { value: 11, label: t('reports.months.november') },
    { value: 12, label: t('reports.months.december') },
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
              {t('reports.generate.title')}
            </Text>
            <Text color="gray.600" fontSize="sm">
              {t('reports.generate.subtitle')}
            </Text>
          </VStack>

          {/* Form */}
          <VStack align="stretch" gap={4}>
            {/* Assignment Selection */}
            <Box>
              <Text fontSize="sm" mb={2} fontWeight="medium">
                {t('reports.generate.assignment_label')}{' '}
                <Text as="span" color="red.500">
                  {t('reports.generate.assignment_required')}
                </Text>
              </Text>
              {fetchingAssignments ? (
                <HStack p={3} borderWidth="1px" borderRadius="md">
                  <Spinner size="sm" />
                  <Text fontSize="sm">
                    {t('reports.generate.loading_assignments')}
                  </Text>
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
                  <option value="">
                    {t('reports.generate.assignment_placeholder')}
                  </option>
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
                      {t('reports.generate.selected_details')}
                    </Text>
                    <HStack gap={4} flexWrap="wrap">
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color="blue.700">
                          {t('reports.generate.engineer')}
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {selectedAssignmentData.engineer.fullName}
                        </Text>
                      </VStack>
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color="blue.700">
                          {t('reports.generate.project')}
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {selectedAssignmentData.project.projectName}
                        </Text>
                      </VStack>
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color="blue.700">
                          {t('reports.generate.client')}
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
                  {t('reports.generate.year_label')}{' '}
                  <Text as="span" color="red.500">
                    {t('reports.generate.year_required')}
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
                  {t('reports.generate.month_label')}{' '}
                  <Text as="span" color="red.500">
                    {t('reports.generate.month_required')}
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
            <Card.Root bg="blue.50" borderColor="blue.200">
              <Card.Body p={4}>
                <VStack align="start" gap={3}>
                  <Text fontSize="sm" fontWeight="bold" color="blue.900">
                    ℹ️ {t('reports.generate.info_title')}
                  </Text>
                  <VStack align="start" gap={1} fontSize="xs" color="blue.800">
                    <Text>{t('reports.generate.info_1')}</Text>
                    <Text>{t('reports.generate.info_2')}</Text>
                    <Text>{t('reports.generate.info_3')}</Text>
                    <Text>{t('reports.generate.info_4')}</Text>
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>

            {/* Important Notes */}
            <Card.Root bg="yellow.50" borderColor="yellow.200">
              <Card.Body p={4}>
                <VStack align="start" gap={3}>
                  <Text fontSize="sm" fontWeight="bold" color="yellow.900">
                    ⚠️ {t('reports.generate.notes_title')}
                  </Text>
                  <VStack
                    align="start"
                    gap={1}
                    fontSize="xs"
                    color="yellow.800"
                  >
                    <Text>{t('reports.generate.notes_1')}</Text>
                    <Text>{t('reports.generate.notes_2')}</Text>
                    <Text>{t('reports.generate.notes_3')}</Text>
                    <Text>{t('reports.generate.notes_4')}</Text>
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
              {t('reports.generate.cancel')}
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleGenerate}
              loading={loading}
              loadingText={t('reports.generate.generating')}
              disabled={!selectedAssignment || loading}
            >
              {t('reports.generate.generate_button')}
            </Button>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
