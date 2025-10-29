'use client';

import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import {
  Box,
  Grid,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  Input,
} from '@chakra-ui/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { salesNavigation } from '@/shared/config/navigation';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { TabNavigation } from '@/components/ui/TabNavigation';
import { AuthContext } from '@/context/AuthContext';
import { assignmentService } from '@/shared/service/assignmentService';
import { engineerService, Engineer } from '@/shared/service/engineerService';
import { projectService, Project } from '@/shared/service/projectService';
import { toaster } from '@/components/ui/toaster';
import { useRouter } from 'next/navigation';
import { assignmentTabs } from '@/shared/config/assignmentTabs';

export default function CreateAssignmentPage() {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation('sales');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    engineerId: '',
    projectId: '',
    assignmentStart: '',
    assignmentEnd: '',
  });

  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(
    null
  );
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [engineersRes, projectsRes] = await Promise.all([
        engineerService.getAllEngineers(),
        projectService.getProjects(),
      ]);

      // Filter active engineers and projects
      const activeEngineers = (engineersRes.data || []).filter(
        (e: Engineer) => e.isActive
      );
      const activeProjects = (projectsRes.data || []).filter(
        (p: Project) => p.isActive
      );

      setEngineers(activeEngineers);
      setProjects(activeProjects);
    } catch {
      toaster.create({
        title: t('assignments.error'),
        description: t('assignments.create.error_load'),
        type: 'error',
        duration: 4000,
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleEngineerSelect = (engineerId: string) => {
    setFormData({ ...formData, engineerId });
    const engineer = engineers.find((e) => e.id === engineerId);
    setSelectedEngineer(engineer || null);
  };

  const handleProjectSelect = (projectId: string) => {
    setFormData({ ...formData, projectId });
    const project = projects.find((p) => p.id === projectId);
    setSelectedProject(project || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.engineerId ||
      !formData.projectId ||
      !formData.assignmentStart
    ) {
      toaster.create({
        title: t('assignments.create.validation_error'),
        description: t('assignments.create.validation_message'),
        type: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await assignmentService.createAssignment({
        engineerId: formData.engineerId,
        projectId: formData.projectId,
        assignmentStart: formData.assignmentStart,
        assignmentEnd: formData.assignmentEnd || undefined,
      });

      // Check if response indicates success
      if (response.success || response.data) {
        toaster.create({
          title: t('assignments.create.success_title'),
          description: t('assignments.create.success_description', {
            engineer: selectedEngineer?.fullName,
            project: selectedProject?.projectName,
          }),
          type: 'success',
          duration: 4000,
        });

        // Redirect to assignments list
        router.push('/sales/assignments');
      } else {
        throw new Error(response.error || 'Failed to create assignment');
      }
    } catch (error: unknown) {
      console.error('Error creating assignment:', error);

      // Extract error information
      const err = error as {
        response?: {
          data?: {
            error?: string;
            message?: string;
            code?: string;
            details?: { engineerName?: string; projectName?: string };
          };
        };
        message?: string;
      };
      const errorData = err?.response?.data;
      const errorMessage =
        errorData?.error ||
        errorData?.message ||
        err?.message ||
        'Failed to create assignment';

      // Check if it's a duplicate assignment error
      const isDuplicateError =
        errorData?.code === 'DUPLICATE_ASSIGNMENT' ||
        errorMessage.toLowerCase().includes('already has') ||
        errorMessage.toLowerCase().includes('duplicate assignment');

      // Show appropriate toast message
      toaster.create({
        title: isDuplicateError
          ? t('assignments.create.duplicate_title')
          : t('assignments.create.error_title'),
        description: errorMessage,
        type: 'error',
        duration: isDuplicateError ? 8000 : 5000,
      });

      // Log additional details if available
      if (errorData?.details) {
        console.log('Assignment conflict details:', errorData.details);
      }
    }
  };

  return (
    <FeatureErrorBoundary featureName="Create Assignment">
      <DashboardLayout
        navigation={salesNavigation}
        pageTitle={t('assignments.page_title')}
        pageSubtitle={t('assignments.page_subtitle')}
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
        <TabNavigation tabs={assignmentTabs} />

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          {/* Create Form */}
          <Card.Root p={6}>
            <VStack align="stretch" gap={6}>
              <Box>
                <Text fontSize="xl" fontWeight="bold" mb={2}>
                  {t('assignments.create.title')}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {t('assignments.create.subtitle')}
                </Text>
              </Box>

              {loadingData ? (
                <VStack py={8}>
                  <Text fontSize="2xl">⏳</Text>
                  <Text color="gray.600">{t('assignments.loading_data')}</Text>
                </VStack>
              ) : (
                <form onSubmit={handleSubmit}>
                  <VStack align="stretch" gap={5}>
                    {/* Engineer Selection */}
                    <Box>
                      <Text
                        fontSize="sm"
                        mb={2}
                        fontWeight="medium"
                        color="gray.700"
                      >
                        {t('assignments.create.select_engineer')}{' '}
                        <Text as="span" color="red.500">
                          {t('assignments.create.required')}
                        </Text>
                      </Text>
                      <Box position="relative">
                        <select
                          value={formData.engineerId}
                          onChange={(e) => handleEngineerSelect(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            border: '2px solid #E2E8F0',
                            backgroundColor: 'white',
                            fontSize: '14px',
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            fontWeight: '500',
                            color: '#2D3748',
                          }}
                        >
                          <option value="">
                            {t(
                              'assignments.create.select_engineer_placeholder'
                            )}
                          </option>
                          {engineers.map((engineer) => (
                            <option key={engineer.id} value={engineer.id}>
                              {engineer.fullName} ({engineer.email})
                            </option>
                          ))}
                        </select>
                      </Box>
                      {selectedEngineer && (
                        <Card.Root p={3} mt={2} bg="blue.50">
                          <VStack align="start" gap={1}>
                            <Text
                              fontSize="xs"
                              fontWeight="bold"
                              color="blue.900"
                            >
                              {t('assignments.create.selected_engineer')}
                            </Text>
                            <Text fontSize="sm" color="blue.800">
                              {selectedEngineer.fullName}
                            </Text>
                            <Text fontSize="xs" color="blue.700">
                              {selectedEngineer.email}
                            </Text>
                          </VStack>
                        </Card.Root>
                      )}
                    </Box>

                    {/* Project Selection */}
                    <Box>
                      <Text
                        fontSize="sm"
                        mb={2}
                        fontWeight="medium"
                        color="gray.700"
                      >
                        {t('assignments.create.select_project')}{' '}
                        <Text as="span" color="red.500">
                          {t('assignments.create.required')}
                        </Text>
                      </Text>
                      <Box position="relative">
                        <select
                          value={formData.projectId}
                          onChange={(e) => handleProjectSelect(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: '10px',
                            border: '2px solid #E2E8F0',
                            backgroundColor: 'white',
                            fontSize: '14px',
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            fontWeight: '500',
                            color: '#2D3748',
                          }}
                        >
                          <option value="">
                            {t('assignments.create.select_project_placeholder')}
                          </option>
                          {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.projectName} - {project.client?.name}
                            </option>
                          ))}
                        </select>
                      </Box>
                      {selectedProject && (
                        <Card.Root p={3} mt={2} bg="green.50">
                          <VStack align="start" gap={1}>
                            <Text
                              fontSize="xs"
                              fontWeight="bold"
                              color="green.900"
                            >
                              {t('assignments.create.selected_project')}
                            </Text>
                            <Text fontSize="sm" color="green.800">
                              {selectedProject.projectName}
                            </Text>
                            <Text fontSize="xs" color="green.700">
                              {t('assignments.client')}:{' '}
                              {selectedProject.client?.name}
                            </Text>
                            <Text fontSize="xs" color="green.700">
                              {t('assignments.create.monthly_price', {
                                price:
                                  selectedProject.monthlyUnitPrice?.toLocaleString(),
                              })}
                            </Text>
                          </VStack>
                        </Card.Root>
                      )}
                    </Box>

                    {/* Assignment Start Date */}
                    <Box>
                      <Text
                        fontSize="sm"
                        mb={2}
                        fontWeight="medium"
                        color="gray.700"
                      >
                        {t('assignments.create.start_date')}{' '}
                        <Text as="span" color="red.500">
                          {t('assignments.create.required')}
                        </Text>
                      </Text>
                      <Input
                        type="date"
                        value={formData.assignmentStart}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            assignmentStart: e.target.value,
                          })
                        }
                        required
                        size="lg"
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        {t('assignments.create.start_date_note')}
                      </Text>
                    </Box>

                    {/* Assignment End Date */}
                    <Box>
                      <Text
                        fontSize="sm"
                        mb={2}
                        fontWeight="medium"
                        color="gray.700"
                      >
                        {t('assignments.create.end_date')}
                      </Text>
                      <Input
                        type="date"
                        value={formData.assignmentEnd}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            assignmentEnd: e.target.value,
                          })
                        }
                        size="lg"
                        min={formData.assignmentStart}
                        max={
                          selectedProject?.endDate
                            ? new Date(selectedProject.endDate)
                                .toISOString()
                                .split('T')[0]
                            : undefined
                        }
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        {selectedProject?.endDate
                          ? t('assignments.create.end_date_note_project', {
                              date: new Date(
                                selectedProject.endDate
                              ).toLocaleDateString(),
                            })
                          : t('assignments.create.end_date_note')}
                      </Text>
                    </Box>

                    {/* Submit Button */}
                    <HStack gap={3} pt={2}>
                      <Button
                        type="submit"
                        colorScheme="blue"
                        size="lg"
                        loading={loading}
                        loadingText={t('assignments.create.creating')}
                        flex={1}
                      >
                        {t('assignments.create.create_button')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => router.push('/sales/assignments')}
                      >
                        {t('assignments.create.cancel')}
                      </Button>
                    </HStack>
                  </VStack>
                </form>
              )}
            </VStack>
          </Card.Root>

          {/* Info Panel */}
          <VStack align="stretch" gap={6}>
            {/* Instructions */}
            <Card.Root p={5} bg="blue.50">
              <VStack align="stretch" gap={3}>
                <HStack gap={2}>
                  <Text fontSize="lg">ℹ️</Text>
                  <Text fontSize="md" fontWeight="bold" color="blue.900">
                    {t('assignments.create.info_title')}
                  </Text>
                </HStack>
                <VStack align="stretch" gap={2} fontSize="sm" color="blue.800">
                  <Text>{t('assignments.create.info_1')}</Text>
                  <Text>{t('assignments.create.info_2')}</Text>
                  <Text>{t('assignments.create.info_3')}</Text>
                  <Text>{t('assignments.create.info_4')}</Text>
                </VStack>
              </VStack>
            </Card.Root>

            {/* Important Notes */}
            <Card.Root p={5} bg="yellow.50">
              <VStack align="stretch" gap={3}>
                <HStack gap={2}>
                  <Text fontSize="lg">⚠️</Text>
                  <Text fontSize="md" fontWeight="bold" color="yellow.900">
                    {t('assignments.create.notes_title')}
                  </Text>
                </HStack>
                <VStack
                  align="stretch"
                  gap={2}
                  fontSize="sm"
                  color="yellow.800"
                >
                  <Text>{t('assignments.create.notes_1')}</Text>
                  <Text>{t('assignments.create.notes_2')}</Text>
                  <Text>{t('assignments.create.notes_3')}</Text>
                  <Text>{t('assignments.create.notes_4')}</Text>
                </VStack>
              </VStack>
            </Card.Root>

            {/* Data Summary */}
            <Card.Root p={5}>
              <VStack align="stretch" gap={3}>
                <Text fontSize="md" fontWeight="bold">
                  {t('assignments.create.data_summary')}
                </Text>
                <VStack align="stretch" gap={2} fontSize="sm" color="gray.700">
                  <HStack justify="space-between">
                    <Text>{t('assignments.create.active_engineers')}</Text>
                    <Text fontWeight="bold">{engineers.length}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>{t('assignments.create.active_projects')}</Text>
                    <Text fontWeight="bold">{projects.length}</Text>
                  </HStack>
                </VStack>
              </VStack>
            </Card.Root>
          </VStack>
        </Grid>
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
