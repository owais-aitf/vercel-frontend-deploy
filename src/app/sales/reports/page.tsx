'use client';

import { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import { Box, HStack } from '@chakra-ui/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { salesNavigation } from '@/shared/config/navigation';
import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { AuthContext } from '@/context/AuthContext';
import { reportTabs } from '@/shared/config/reportTabs';
import { ViewAllReports } from './components/ViewAllReports';
import { GenerateReport } from './components/GenerateReport';

export default function ReportsPage() {
  const { user } = useContext(AuthContext);
  const { t, i18n } = useTranslation('sales');
  const [activeTab, setActiveTab] = useState(() => {
    // Initialize from sessionStorage to persist across language changes
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('reports-active-tab') || 'view-all';
    }
    return 'view-all';
  });

  // Persist active tab to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('reports-active-tab', activeTab);
    }
  }, [activeTab]);

  const getUserInitials = () => {
    if (!user?.fullName) return 'SU';
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.fullName.slice(0, 2).toUpperCase();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'view-all':
        return <ViewAllReports />;
      case 'generate':
        return <GenerateReport />;
      default:
        return <ViewAllReports />;
    }
  };

  return (
    <FeatureErrorBoundary featureName="Reports">
      <DashboardLayout
        navigation={salesNavigation}
        pageTitle={t('reports.page_title')}
        pageSubtitle={t('reports.page_subtitle')}
        userName={user?.fullName || 'Sales User'}
        userInitials={getUserInitials()}
        notificationCount={0}
      >
        {/* Tab Navigation */}
        <HStack
          gap={2}
          mb={6}
          borderBottom="2px solid"
          borderColor="gray.200"
          pb={0}
          overflowX="auto"
          css={{
            '&::-webkit-scrollbar': {
              height: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#CBD5E0',
              borderRadius: '4px',
            },
          }}
        >
          {reportTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Box
                key={tab.id}
                as="button"
                px={6}
                py={3}
                fontSize="sm"
                fontWeight="medium"
                color={activeTab === tab.id ? 'blue.600' : 'gray.600'}
                borderBottom="2px solid"
                borderColor={activeTab === tab.id ? 'blue.600' : 'transparent'}
                bg={activeTab === tab.id ? 'blue.50' : 'transparent'}
                _hover={{
                  bg: activeTab === tab.id ? 'blue.100' : 'gray.100',
                  color: activeTab === tab.id ? 'blue.700' : 'gray.900',
                  borderBottomColor:
                    activeTab === tab.id ? 'blue.700' : 'gray.400',
                  transform: 'translateY(-1px)',
                }}
                transition="all 0.2s ease-in-out"
                cursor="pointer"
                whiteSpace="nowrap"
                onClick={() => setActiveTab(tab.id)}
                mb="-2px"
              >
                <HStack gap={2}>
                  <Icon size={16} />
                  <span>{t(tab.labelKey)}</span>
                </HStack>
              </Box>
            );
          })}
        </HStack>

        {/* Tab Content */}
        <Box>{renderTabContent()}</Box>
      </DashboardLayout>
    </FeatureErrorBoundary>
  );
}
