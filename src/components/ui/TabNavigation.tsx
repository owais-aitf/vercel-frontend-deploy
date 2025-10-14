'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Tabs } from '@chakra-ui/react';

interface Tab {
  label: string;
  href: string;
  icon?: string;
}

interface TabNavigationProps {
  tabs: Tab[];
}

export function TabNavigation({ tabs }: TabNavigationProps) {
  const pathname = usePathname();

  // Find the index of the current active tab
  const activeIndex = tabs.findIndex((tab) => pathname === tab.href);
  const defaultIndex = activeIndex !== -1 ? activeIndex : 0;

  return (
    <Tabs.Root defaultValue={String(defaultIndex)} variant="line" mb={6}>
      <Tabs.List>
        {tabs.map((tab, index) => {
          const isActive = pathname === tab.href;

          return (
            <Tabs.Trigger key={tab.href} value={String(index)} asChild>
              <Link
                href={tab.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  color: isActive ? '#3182CE' : '#4A5568',
                  fontWeight: isActive ? '600' : '500',
                  borderBottom: isActive
                    ? '2px solid #3182CE'
                    : '2px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
              </Link>
            </Tabs.Trigger>
          );
        })}
      </Tabs.List>
    </Tabs.Root>
  );
}
