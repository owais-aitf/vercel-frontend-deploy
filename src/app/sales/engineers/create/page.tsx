'use client';

import { useState, useContext } from 'react';
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
import { engineerService } from '@/shared/service/engineerService';
import { toaster } from '@/components/ui/toaster';
import { useRouter } from 'next/navigation';
import { LuUsers, LuUserPlus, LuCalendar } from 'react-icons/lu';

export default function CreateEngineerPage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const { t } = useTranslation('sales');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    slackUserId: '',
  });
  const [createdPassword, setCreatedPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.fullName) {
      toaster.create({
        title: t('create_engineer.validation.title'),
        description: t('create_engineer.validation.email_required'),
        type: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await engineerService.createEngineer({
        email: formData.email,
        fullName: formData.fullName,
        role: 'ENGINEER',
        slackUserId: formData.slackUserId || undefined,
      });

      if (response.success) {
        setCreatedPassword(response.data.temporaryPassword);
        toaster.create({
          title: t('create_engineer.success.title'),
          description: t('create_engineer.success.description', {
            name: formData.fullName,
          }),
          type: 'success',
          duration: 4000,
        });

        // Reset form
        setFormData({
          email: '',
          fullName: '',
          slackUserId: '',
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toaster.create({
        title: t('create_engineer.error.title'),
        description: errorMessage || t('create_engineer.error.create_failed'),
        type: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(createdPassword);
    toaster.create({
      title: t('create_engineer.password.copied_title'),
      description: t('create_engineer.password.copied_description'),
      type: 'success',
      duration: 2000,
    });
  };

  return (
    <FeatureErrorBoundary featureName="Create Engineer">
      <DashboardLayout
        navigation={salesNavigation}
        pageTitle={t('engineers.title')}
        pageSubtitle={t('engineers.subtitle')}
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
        <TabNavigation
          tabs={[
            {
              label: t('tabs.view_all_engineers'),
              href: '/sales/engineers',
              icon: LuUsers,
            },
            {
              label: t('tabs.create_engineer'),
              href: '/sales/engineers/create',
              icon: LuUserPlus,
            },
            {
              label: t('tabs.engineer_attendance'),
              href: '/sales/engineers/attendance',
              icon: LuCalendar,
            },
          ]}
        />

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          {/* Create Form */}
          <Card.Root p={6}>
            <VStack align="stretch" gap={6}>
              <Box>
                <Text fontSize="xl" fontWeight="bold" mb={2}>
                  ➕ {t('create_engineer.title')}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {t('create_engineer.subtitle')}
                </Text>
              </Box>

              <form onSubmit={handleSubmit}>
                <VStack align="stretch" gap={5}>
                  {/* Email */}
                  <Box>
                    <Text
                      fontSize="sm"
                      mb={2}
                      fontWeight="medium"
                      color="gray.700"
                    >
                      {t('create_engineer.form.email')}{' '}
                      <Text as="span" color="red.500">
                        {t('create_engineer.form.required')}
                      </Text>
                    </Text>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder={t('create_engineer.form.email_placeholder')}
                      required
                      size="lg"
                    />
                  </Box>

                  {/* Full Name */}
                  <Box>
                    <Text
                      fontSize="sm"
                      mb={2}
                      fontWeight="medium"
                      color="gray.700"
                    >
                      {t('create_engineer.form.full_name')}{' '}
                      <Text as="span" color="red.500">
                        {t('create_engineer.form.required')}
                      </Text>
                    </Text>
                    <Input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      placeholder={t(
                        'create_engineer.form.full_name_placeholder'
                      )}
                      required
                      size="lg"
                    />
                  </Box>

                  {/* Slack User ID */}
                  <Box>
                    <Text
                      fontSize="sm"
                      mb={2}
                      fontWeight="medium"
                      color="gray.700"
                    >
                      Slack User ID (Optional)
                    </Text>
                    <Input
                      type="text"
                      value={formData.slackUserId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slackUserId: e.target.value,
                        })
                      }
                      placeholder={t(
                        'create_engineer.form.slack_user_id_placeholder'
                      )}
                      size="lg"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {t('create_engineer.form.slack_user_id_description')}
                    </Text>
                  </Box>

                  {/* Submit Button */}
                  <HStack gap={3} pt={2}>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      loading={loading}
                      loadingText={t('create_engineer.buttons.creating')}
                      flex={1}
                    >
                      {loading
                        ? t('create_engineer.buttons.creating')
                        : t('create_engineer.buttons.create')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => router.push('/sales/engineers')}
                    >
                      {t('create_engineer.buttons.reset')}
                    </Button>
                  </HStack>
                </VStack>
              </form>
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
                    {t('create_engineer.info.title')}
                  </Text>
                </HStack>
                <VStack align="stretch" gap={2} fontSize="sm" color="blue.800">
                  <Text>{t('create_engineer.info.item1')}</Text>
                  <Text>{t('create_engineer.info.item2')}</Text>
                  <Text>{t('create_engineer.info.item3')}</Text>
                  <Text>{t('create_engineer.info.item4')}</Text>
                </VStack>
              </VStack>
            </Card.Root>

            {/* Password Display */}
            {createdPassword && (
              <Card.Root
                p={5}
                bg="green.50"
                borderColor="green.300"
                borderWidth={2}
              >
                <VStack align="stretch" gap={3}>
                  <HStack gap={2}>
                    <Text fontSize="lg">✅</Text>
                    <Text fontSize="md" fontWeight="bold" color="green.900">
                      {t('create_engineer.success.title')}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="green.800">
                    {t('create_engineer.success.description', {
                      name: formData.fullName,
                    })}
                  </Text>
                  <Box
                    p={3}
                    bg="white"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="green.300"
                  >
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      fontFamily="mono"
                      color="green.900"
                      textAlign="center"
                    >
                      {createdPassword}
                    </Text>
                  </Box>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={handleCopyPassword}
                  >
                    {t('create_engineer.password.copy')}
                  </Button>
                  <Text fontSize="xs" color="green.700">
                    {t('create_engineer.password.warning')}
                  </Text>
                </VStack>
              </Card.Root>
            )}

            {/* Requirements */}
            <Card.Root p={5}>
              <VStack align="stretch" gap={3}>
                <Text fontSize="md" fontWeight="bold">
                  📋 Requirements
                </Text>
                <VStack align="stretch" gap={2} fontSize="sm" color="gray.700">
                  <Text>✓ Valid email address</Text>
                  <Text>✓ Full name (min 2 characters)</Text>
                  <Text>✓ Unique email (not already registered)</Text>
                </VStack>
              </VStack>
            </Card.Root>
          </VStack>
        </Grid>
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
