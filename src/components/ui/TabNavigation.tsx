'use client';

import { Box, HStack } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TabItem {
  label: string;
  href: string;
  icon?: string;
}

interface TabNavigationProps {
  tabs: TabItem[];
  basePath?: string;
}

export function TabNavigation({ tabs, basePath = '' }: TabNavigationProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    const fullPath = basePath ? `${basePath}${href}` : href;
    return pathname === fullPath || pathname?.startsWith(`${fullPath}/`);
  };

  return (
    <Box
      bg="white"
      borderBottom="2px solid"
      borderColor="gray.200"
      mb={6}
      overflowX="auto"
    >
      <HStack gap={0} minW="max-content">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const fullHref = basePath ? `${basePath}${tab.href}` : tab.href;

          return (
            <Link key={tab.href} href={fullHref} style={{ textDecoration: 'none' }}>
              <Box
                px={6}
                py={4}
                cursor="pointer"
                borderBottom="3px solid"
                borderColor={active ? 'blue.500' : 'transparent'}
                color={active ? 'blue.600' : 'gray.600'}
                fontWeight={active ? 'semibold' : 'medium'}
                fontSize="sm"
                transition="all 0.2s"
                _hover={{
                  color: 'blue.600',
                  bg: 'blue.50',
                }}
                whiteSpace="nowrap"
              >
                {tab.icon && <span style={{ marginRight: '8px' }}>{tab.icon}</span>}
                {tab.label}
              </Box>
            </Link>
          );
        })}
      </HStack>
    </Box>
  );
}
