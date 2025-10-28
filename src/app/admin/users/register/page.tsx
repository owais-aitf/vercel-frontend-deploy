'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  Text,
  VStack,
  HStack,
  Input,
  Button,
  Grid,
  Spinner,
  Portal,
  Fieldset,
} from '@chakra-ui/react';
import {
  LuUser,
  LuMail,
  LuUserCog,
  LuMessageSquare,
  LuCalendarDays,
  LuArrowLeft,
  LuSave,
  LuShieldCheck,
  LuCheck,
  LuCopy,
  LuEye,
  LuEyeOff,
  LuX,
  LuBriefcase,
} from 'react-icons/lu';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { adminNavigation } from '@/shared/config/navigation';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { AuthContext } from '@/context/AuthContext';
import userService from '@/shared/service/userService';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import { toaster } from '@/components/ui/toaster';

export default function RegisterUserPage() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createdUserData, setCreatedUserData] = useState({
    fullName: '',
    email: '',
    role: '',
  });
  const { t } = useTranslation('admin');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'ENGINEER' as 'ENGINEER' | 'SALES' | 'ADMIN',
    slackUserId: '',
    annualPaidLeaveAllowance: 10,
  });

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
  });

  const getUserInitials = () => {
    if (!user?.fullName) return 'AD';
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.fullName.slice(0, 2).toUpperCase();
  };

  const validateForm = () => {
    const newErrors = { fullName: '', email: '' };
    let isValid = true;

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('registerUser.validation.name_required');
      isValid = false;
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = t('registerUser.validation.name_min_length');
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = t('registerUser.validation.email_required');
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t('registerUser.validation.email_invalid');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      toaster.create({
        title: t('registerUser.toast.copied_title'),
        description: t('registerUser.toast.copied_desc'),
        type: 'success',
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toaster.create({
        title: t('registerUser.toast.copy_failed_title'),
        description: t('registerUser.toast.copy_failed_desc'),
        type: 'error',
        duration: 3000,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toaster.create({
        title: t('registerUser.validation.validation_error_title'),
        description: t('registerUser.validation.validation_error_desc'),
        type: 'error',
        duration: 4000,
      });
      return;
    }

    try {
      setLoading(true);

      const userData = {
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        role: formData.role,
        ...(formData.slackUserId.trim() && {
          slackUserId: formData.slackUserId.trim(),
        }),
        annualPaidLeaveAllowance: Number(formData.annualPaidLeaveAllowance),
      };

      const response = await userService.registerUser(userData);

      if (response.success) {
        setTemporaryPassword(response.data.temporaryPassword);
        setCreatedUserData({
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
        });
        setShowModal(true);

        toaster.create({
          title: t('registerUser.toast.success_title'),
          description: `${formData.fullName} ${t('registerUser.success.user_registered')}`,
          type: 'success',
          duration: 5000,
        });
      }
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        t('registerUser.toast.failed_desc');

      toaster.create({
        title: t('registerUser.toast.failed_title'),
        description: errorMessage,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTemporaryPassword('');
    setShowPassword(false);
    setCopied(false);
    setFormData({
      fullName: '',
      email: '',
      role: 'ENGINEER',
      slackUserId: '',
      annualPaidLeaveAllowance: 10,
    });
    setErrors({ fullName: '', email: '' });
  };

  // const handleViewUsers = () => {
  //   handleCloseModal();
  //   router.push('/admin/users');
  // };

  return (
    <FeatureErrorBoundary featureName="Register User">
      <DashboardLayout
        navigation={adminNavigation}
        pageTitle={t('registerUser.page_title')}
        pageSubtitle={t('registerUser.page_subtitle')}
        userName={user?.fullName || 'Admin User'}
        userInitials={getUserInitials()}
        notificationCount={0}
      >
        <Button variant="ghost" size="sm" onClick={() => router.back()} mb={3}>
          <HStack gap={2}>
            <LuArrowLeft size={16} />
            <Text fontSize="sm">{t('registerUser.back')}</Text>
          </HStack>
        </Button>

        {/* Compact Registration Form */}
        <Card.Root maxW="800px" mx="auto" boxShadow="md">
          <Card.Body p={{ base: 4, md: 5 }}>
            <form onSubmit={handleSubmit}>
              <VStack align="stretch" gap={4}>
                {/* Compact Header */}
                <VStack align="start" gap={0}>
                  <Text fontSize="lg" fontWeight="bold">
                    {t('registerUser.user_information')}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {t('registerUser.complete_fields')}
                  </Text>
                </VStack>

                {/* Form Fields in 2 Columns */}
                <Grid
                  templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                  gap={4}
                >
                  {/* Full Name */}
                  <Fieldset.Root invalid={!!errors.fullName}>
                    <Fieldset.Legend fontSize="xs" fontWeight="600" mb={1}>
                      <HStack gap={1}>
                        <LuUser size={14} />
                        <Text>{t('registerUser.form.full_name')} *</Text>
                      </HStack>
                    </Fieldset.Legend>
                    <Input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange('fullName', e.target.value)
                      }
                      placeholder={t('registerUser.form.placeholder_name')}
                      size="md"
                      _focus={{ borderColor: 'blue.500' }}
                    />
                    {errors.fullName && (
                      <Text fontSize="2xs" color="red.500" mt={0.5}>
                        {errors.fullName}
                      </Text>
                    )}
                  </Fieldset.Root>

                  {/* Email */}
                  <Fieldset.Root invalid={!!errors.email}>
                    <Fieldset.Legend fontSize="xs" fontWeight="600" mb={1}>
                      <HStack gap={1}>
                        <LuMail size={14} />
                        <Text>{t('registerUser.form.email')} *</Text>
                      </HStack>
                    </Fieldset.Legend>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange('email', e.target.value)
                      }
                      placeholder={t('registerUser.form.placeholder_email')}
                      size="md"
                      _focus={{ borderColor: 'blue.500' }}
                    />
                    {errors.email && (
                      <Text fontSize="2xs" color="red.500" mt={0.5}>
                        {errors.email}
                      </Text>
                    )}
                  </Fieldset.Root>
                </Grid>

                {/* Role Selection - Extra Compact */}
                <Fieldset.Root>
                  <Fieldset.Legend fontSize="xs" fontWeight="600" mb={1.5}>
                    <HStack gap={1}>
                      <LuBriefcase size={14} />
                      <Text>{t('registerUser.form.user_role')} *</Text>
                    </HStack>
                  </Fieldset.Legend>
                  <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                    {' '}
                    {/* Changed from repeat(2, 1fr) to repeat(3, 1fr) */}
                    {/* Engineer Button */}
                    <Card.Root
                      cursor="pointer"
                      onClick={() => handleInputChange('role', 'ENGINEER')}
                      bg={formData.role === 'ENGINEER' ? 'blue.50' : 'white'}
                      borderWidth="2px"
                      borderColor={
                        formData.role === 'ENGINEER' ? 'blue.500' : 'gray.200'
                      }
                      _hover={{
                        borderColor: 'blue.400',
                        transform: 'translateY(-1px)',
                      }}
                      transition="all 0.2s"
                    >
                      <Card.Body p={2}>
                        <HStack gap={2} justify="center">
                          <Box
                            p={1.5}
                            bg={
                              formData.role === 'ENGINEER'
                                ? 'blue.100'
                                : 'gray.100'
                            }
                            borderRadius="full"
                            color={
                              formData.role === 'ENGINEER'
                                ? 'blue.600'
                                : 'gray.600'
                            }
                          >
                            <LuUserCog size={16} />
                          </Box>
                          <VStack gap={0} align="start">
                            <Text fontSize="xs" fontWeight="bold">
                              {t('registerUser.roles.engineer')}
                            </Text>
                            <Text fontSize="2xs" color="gray.600">
                              {t('registerUser.roles.engineer_desc')}
                            </Text>
                          </VStack>
                          {formData.role === 'ENGINEER' && (
                            <Box color="blue.500" ml="auto">
                              <LuCheck size={14} />
                            </Box>
                          )}
                        </HStack>
                      </Card.Body>
                    </Card.Root>
                    {/* Sales Rep Button */}
                    <Card.Root
                      cursor="pointer"
                      onClick={() => handleInputChange('role', 'SALES')}
                      bg={formData.role === 'SALES' ? 'blue.50' : 'white'}
                      borderWidth="2px"
                      borderColor={
                        formData.role === 'SALES' ? 'blue.500' : 'gray.200'
                      }
                      _hover={{
                        borderColor: 'blue.400',
                        transform: 'translateY(-1px)',
                      }}
                      transition="all 0.2s"
                    >
                      <Card.Body p={2}>
                        <HStack gap={2} justify="center">
                          <Box
                            p={1.5}
                            bg={
                              formData.role === 'SALES'
                                ? 'blue.100'
                                : 'gray.100'
                            }
                            borderRadius="full"
                            color={
                              formData.role === 'SALES'
                                ? 'blue.600'
                                : 'gray.600'
                            }
                          >
                            <LuBriefcase size={16} />
                          </Box>
                          <VStack gap={0} align="start">
                            <Text fontSize="xs" fontWeight="bold">
                              {t('registerUser.roles.sales')}
                            </Text>
                            <Text fontSize="2xs" color="gray.600">
                              {t('registerUser.roles.sales_desc')}
                            </Text>
                          </VStack>
                          {formData.role === 'SALES' && (
                            <Box color="blue.500" ml="auto">
                              <LuCheck size={14} />
                            </Box>
                          )}
                        </HStack>
                      </Card.Body>
                    </Card.Root>
                    {/* Admin Button - NEW */}
                    <Card.Root
                      cursor="pointer"
                      onClick={() => handleInputChange('role', 'ADMIN')}
                      bg={formData.role === 'ADMIN' ? 'purple.50' : 'white'}
                      borderWidth="2px"
                      borderColor={
                        formData.role === 'ADMIN' ? 'purple.500' : 'gray.200'
                      }
                      _hover={{
                        borderColor: 'purple.400',
                        transform: 'translateY(-1px)',
                      }}
                      transition="all 0.2s"
                    >
                      <Card.Body p={2}>
                        <HStack gap={2} justify="center">
                          <Box
                            p={1.5}
                            bg={
                              formData.role === 'ADMIN'
                                ? 'purple.100'
                                : 'gray.100'
                            }
                            borderRadius="full"
                            color={
                              formData.role === 'ADMIN'
                                ? 'purple.600'
                                : 'gray.600'
                            }
                          >
                            <LuShieldCheck size={16} />
                          </Box>
                          <VStack gap={0} align="start">
                            <Text fontSize="xs" fontWeight="bold">
                              {t('registerUser.roles.admin')}
                            </Text>
                            <Text fontSize="2xs" color="gray.600">
                              {t('registerUser.roles.admin_desc')}
                            </Text>
                          </VStack>
                          {formData.role === 'ADMIN' && (
                            <Box color="purple.500" ml="auto">
                              <LuCheck size={14} />
                            </Box>
                          )}
                        </HStack>
                      </Card.Body>
                    </Card.Root>
                  </Grid>
                </Fieldset.Root>

                {/* Optional Fields - 2 Columns */}
                <Grid
                  templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                  gap={4}
                >
                  {/* Slack User ID */}
                  <Fieldset.Root>
                    <Fieldset.Legend fontSize="xs" fontWeight="600" mb={1}>
                      <HStack gap={1}>
                        <LuMessageSquare size={14} />
                        <Text>{t('registerUser.form.slack_user_id')}</Text>
                        <Text fontSize="2xs" color="gray.400">
                          {t('registerUser.form.optional')}
                        </Text>
                      </HStack>
                    </Fieldset.Legend>
                    <Input
                      type="text"
                      value={formData.slackUserId}
                      onChange={(e) =>
                        handleInputChange('slackUserId', e.target.value)
                      }
                      placeholder={t('registerUser.form.placeholder_slack')}
                      size="md"
                      _focus={{ borderColor: 'blue.500' }}
                    />
                    <Text fontSize="2xs" color="gray.500" mt={0.5}>
                      {t('registerUser.form.slack_help')}
                    </Text>
                  </Fieldset.Root>

                  {/* Annual Leave */}
                  <Fieldset.Root>
                    <Fieldset.Legend fontSize="xs" fontWeight="600" mb={1}>
                      <HStack gap={1}>
                        <LuCalendarDays size={14} />
                        <Text>{t('registerUser.form.annual_leave')}</Text>
                      </HStack>
                    </Fieldset.Legend>
                    <Input
                      type="number"
                      value={formData.annualPaidLeaveAllowance}
                      onChange={(e) =>
                        handleInputChange(
                          'annualPaidLeaveAllowance',
                          Number(e.target.value) || 0
                        )
                      }
                      min={0}
                      max={365}
                      size="md"
                      _focus={{ borderColor: 'blue.500' }}
                    />
                    <Text fontSize="2xs" color="gray.500" mt={0.5}>
                      {t('registerUser.form.leave_help')}
                    </Text>
                  </Fieldset.Root>
                </Grid>

                {/* Action Buttons */}
                <HStack
                  gap={3}
                  pt={3}
                  borderTop="1px solid"
                  borderColor="gray.200"
                  justify="flex-end"
                >
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    {t('registerUser.buttons.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="md"
                    disabled={loading}
                  >
                    {loading ? (
                      <HStack gap={2}>
                        <Spinner size="sm" />
                        <Text>{t('registerUser.buttons.creating')}</Text>
                      </HStack>
                    ) : (
                      <HStack gap={2}>
                        <LuSave size={18} />
                        <Text>{t('registerUser.buttons.create_user')}</Text>
                      </HStack>
                    )}
                  </Button>
                </HStack>
              </VStack>
            </form>
          </Card.Body>
        </Card.Root>

        {/* Info Banner - Compact */}
        <Card.Root
          maxW="800px"
          mx="auto"
          mt={3}
          bg="blue.50"
          borderWidth="1px"
          borderColor="blue.200"
        >
          <Card.Body p={3}>
            <HStack gap={2} align="start">
              <Box color="blue.600" mt={0.5}>
                <LuShieldCheck size={16} />
              </Box>
              <Text fontSize="2xs" color="blue.800" lineHeight="1.5">
                {t('registerUser.info_banner')}
              </Text>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Success Modal - Same as before */}
        {showModal && (
          <Portal>
            <Box
              position="fixed"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="blackAlpha.600"
              backdropFilter="blur(4px)"
              zIndex={1000}
              onClick={handleCloseModal}
            />

            <Box
              position="fixed"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              zIndex={1001}
              w={{ base: '90%', sm: '85%', md: '550px' }}
              maxH="90vh"
              overflowY="auto"
            >
              <Card.Root bg="white" boxShadow="2xl" borderRadius="xl">
                <Card.Body p={{ base: 5, md: 6 }}>
                  <VStack align="stretch" gap={4}>
                    <HStack justify="space-between">
                      <Box color="green.500">
                        <LuCheck size={28} />
                      </Box>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCloseModal}
                      >
                        <LuX size={18} />
                      </Button>
                    </HStack>

                    <VStack gap={1}>
                      <Text fontSize="xl" fontWeight="bold" color="green.700">
                        {t('registerUser.success.title')}
                      </Text>
                      <Text fontSize="xs" color="gray.600" textAlign="center">
                        {t('registerUser.success.subtitle')}
                      </Text>
                    </VStack>

                    <Card.Root bg="blue.50">
                      <Card.Body p={3}>
                        <VStack align="stretch" gap={1.5}>
                          <HStack justify="space-between">
                            <Text fontSize="xs" color="gray.600">
                              {t('registerUser.success.name')}
                            </Text>
                            <Text fontSize="xs" fontWeight="bold">
                              {createdUserData.fullName}
                            </Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontSize="xs" color="gray.600">
                              {t('registerUser.success.email')}
                            </Text>
                            <Text fontSize="xs" fontWeight="bold">
                              {createdUserData.email}
                            </Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontSize="xs" color="gray.600">
                              {t('registerUser.success.role')}
                            </Text>
                            <Text fontSize="xs" fontWeight="bold">
                              {createdUserData.role}
                            </Text>
                          </HStack>
                        </VStack>
                      </Card.Body>
                    </Card.Root>

                    <Card.Root
                      bg="yellow.50"
                      borderColor="yellow.400"
                      borderWidth="2px"
                    >
                      <Card.Body p={3}>
                        <VStack align="stretch" gap={2}>
                          <HStack gap={2}>
                            <LuShieldCheck size={18} color="orange" />
                            <Text
                              fontSize="xs"
                              fontWeight="bold"
                              color="yellow.900"
                            >
                              {t('registerUser.success.temp_password')}
                            </Text>
                          </HStack>

                          <Box position="relative">
                            <Input
                              value={temporaryPassword}
                              type={showPassword ? 'text' : 'password'}
                              readOnly
                              size="md"
                              fontFamily="monospace"
                              fontWeight="bold"
                              fontSize="sm"
                              bg="white"
                              pr="90px"
                            />
                            <HStack
                              position="absolute"
                              right="6px"
                              top="50%"
                              transform="translateY(-50%)"
                              gap={0.5}
                            >
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <LuEyeOff size={16} />
                                ) : (
                                  <LuEye size={16} />
                                )}
                              </Button>
                              <Button
                                size="xs"
                                colorScheme={copied ? 'green' : 'blue'}
                                onClick={handleCopyPassword}
                              >
                                {copied ? (
                                  <LuCheck size={16} />
                                ) : (
                                  <LuCopy size={16} />
                                )}
                              </Button>
                            </HStack>
                          </Box>

                          <Text fontSize="2xs" color="yellow.800">
                            {t('registerUser.success.save_warning')}
                          </Text>
                        </VStack>
                      </Card.Body>
                    </Card.Root>

                    <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                      <Button
                        colorScheme="blue"
                        size="md"
                        onClick={handleCloseModal}
                      >
                        <HStack gap={2}>
                          <LuUser size={16} />
                          <Text fontSize="sm">
                            {t('registerUser.success.create_another')}
                          </Text>
                        </HStack>
                      </Button>
                      {/* <Button
                        variant="outline"
                        size="md"
                        onClick={handleViewUsers}
                      >
                        <HStack gap={2}>
                          <LuArrowLeft size={16} />
                          <Text fontSize="sm">View Users</Text>
                        </HStack>
                      </Button> */}
                    </Grid>
                  </VStack>
                </Card.Body>
              </Card.Root>
            </Box>
          </Portal>
        )}
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
