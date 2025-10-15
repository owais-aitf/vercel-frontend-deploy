'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Tabs, Box } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLAnchorElement>(null);

  // Find the index of the current active tab
  const activeIndex = tabs.findIndex((tab) => pathname === tab.href);
  const [value, setValue] = useState(String(activeIndex !== -1 ? activeIndex : 0));

  // Update the active tab when pathname changes
  useEffect(() => {
    const currentIndex = tabs.findIndex((tab) => pathname === tab.href);
    if (currentIndex !== -1) {
      setValue(String(currentIndex));
    }
  }, [pathname, tabs]);

  // Scroll active tab into view on mount and when active tab changes
  useEffect(() => {
    if (activeTabRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const activeTab = activeTabRef.current;
      
      // Calculate scroll position to center the active tab
      const containerWidth = container.offsetWidth;
      const tabLeft = activeTab.offsetLeft;
      const tabWidth = activeTab.offsetWidth;
      
      // Center the active tab
      const scrollPosition = tabLeft - (containerWidth / 2) + (tabWidth / 2);
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [activeIndex, pathname]);

  // Handle tab value change
  const handleValueChange = (details: { value: string }) => {
    setValue(details.value);
  };

  return (
    <Box mb={6} overflowX="auto" overflowY="hidden" ref={scrollContainerRef}>
      <Tabs.Root value={value} onValueChange={handleValueChange} variant="line">
        <Tabs.List
          style={{
            display: 'flex',
            flexWrap: 'nowrap',
            minWidth: 'min-content',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          {tabs.map((tab, index) => {
            const isActive = pathname === tab.href;

            return (
              <Tabs.Trigger
                key={tab.href}
                value={String(index)}
                asChild
                style={{
                  flex: '0 0 auto',
                  minWidth: 'fit-content',
                }}
              >
                <Link
                  href={tab.href}
                  ref={isActive ? activeTabRef : null}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    color: isActive ? '#3182CE' : '#4A5568',
                    fontWeight: isActive ? '600' : '500',
                    fontSize: '14px',
                    borderBottom: isActive ? '2px solid #3182CE' : '2px solid transparent',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.icon && (
                    <span
                      style={{
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {tab.icon}
                    </span>
                  )}
                  <span
                    style={{
                      display: 'inline-block',
                    }}
                  >
                    {tab.label}
                  </span>
                </Link>
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>
      </Tabs.Root>

      {/* Custom scrollbar styling */}
      <style jsx>{`
        div::-webkit-scrollbar {
          height: 4px;
        }

        div::-webkit-scrollbar-track {
          background: #f7fafc;
        }

        div::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 10px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }

        @media (max-width: 768px) {
          div::-webkit-scrollbar {
            height: 3px;
          }
        }
      `}</style>
    </Box>
  );
}
