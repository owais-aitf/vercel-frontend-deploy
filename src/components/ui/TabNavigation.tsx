'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Box } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { IconType } from 'react-icons';

// UPDATED: Accept both string and React Icon component
interface Tab {
  label: string;
  href: string;
  icon?: string | IconType; // Can be string (emoji) or React Icon component
}

interface TabNavigationProps {
  tabs: Tab[];
}

export function TabNavigation({ tabs }: TabNavigationProps) {
  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLAnchorElement>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Find the index of the current active tab
  const activeIndex = tabs.findIndex((tab) => pathname === tab.href);

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
      const scrollPosition = tabLeft - containerWidth / 2 + tabWidth / 2;

      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, [activeIndex, pathname]);

  const handleTabClick = (href: string) => {
    if (href !== pathname) {
      setIsNavigating(true);
      // Reset navigation state after a short delay
      setTimeout(() => setIsNavigating(false), 300);
    }
  };

  // UPDATED: Helper function to render icon (string or React component)
  const renderIcon = (icon: string | IconType, isActive: boolean) => {
    // Check if it's a React component (function)
    if (typeof icon === 'function') {
      const IconComponent = icon as IconType;
      return <IconComponent size={16} />;
    }
    // Otherwise it's a string (emoji)
    return icon;
  };

  return (
    <Box mb={6} overflowX="auto" overflowY="hidden" ref={scrollContainerRef}>
      <Box
        display="flex"
        flexWrap="nowrap"
        minW="min-content"
        borderBottom="1px solid"
        borderColor="gray.200"
        position="relative"
      >
        {tabs.map((tab, index) => {
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              ref={isActive ? activeTabRef : null}
              onClick={() => handleTabClick(tab.href)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 20px',
                cursor: 'pointer',
                textDecoration: 'none',
                color: isActive ? '#3182CE' : '#718096',
                fontWeight: isActive ? '600' : '500',
                fontSize: '14px',
                position: 'relative',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderBottom: '2px solid transparent',
                borderRadius: '8px 8px 0 0',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#3182CE';
                  e.currentTarget.style.backgroundColor =
                    'rgba(49, 130, 206, 0.06)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(49, 130, 206, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#718096';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* Hover Underline (shows on hover for non-active tabs) */}
              <Box
                position="absolute"
                bottom="-1px"
                left="0"
                right="0"
                height="2px"
                bg="blue.300"
                borderRadius="1px"
                transform="scaleX(0)"
                transformOrigin="center"
                transition="transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                className="hover-underline"
              />

              {/* Active Underline */}
              <Box
                position="absolute"
                bottom="-1px"
                left="0"
                right="0"
                height="2px"
                bg="blue.500"
                borderRadius="1px"
                transform={isActive ? 'scaleX(1)' : 'scaleX(0)'}
                transformOrigin="center"
                transition="transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              />

              {/* Loading indicator */}
              {isNavigating && isActive && (
                <Box
                  position="absolute"
                  bottom="-1px"
                  left="0"
                  height="2px"
                  bg="blue.300"
                  borderRadius="1px"
                  animation="loading 1s ease-in-out infinite"
                />
              )}

              {/* UPDATED: Render icon using helper function */}
              {tab.icon && (
                <Box
                  fontSize="16px"
                  display="flex"
                  alignItems="center"
                  opacity={isActive ? 1 : 0.7}
                  transition="all 0.3s ease"
                  className="tab-icon"
                >
                  {renderIcon(tab.icon, isActive)}
                </Box>
              )}

              <Box 
                opacity={isActive ? 1 : 0.8} 
                transition="all 0.3s ease"
                className="tab-text"
              >
                {tab.label}
              </Box>
            </Link>
          );
        })}
      </Box>

      {/* Custom styles */}
      <style jsx>{`
        .tab-link {
          position: relative;
          overflow: hidden;
        }

        .tab-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(49, 130, 206, 0.1),
            transparent
          );
          transition: left 0.6s;
        }

        .tab-link:hover::before {
          left: 100%;
        }

        .tab-link:hover {
          color: #3182ce !important;
          background-color: rgba(49, 130, 206, 0.06);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(49, 130, 206, 0.15);
        }

        .tab-link:hover .hover-underline {
          transform: scaleX(0.7) !important;
        }

        .tab-link:active {
          transform: translateY(0px);
          transition: transform 0.1s;
        }

        /* Icon hover animation */
        .tab-link:hover .tab-icon {
          transform: scale(1.1);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Text shimmer effect on hover */
        .tab-link:hover .tab-text {
          background: linear-gradient(45deg, #3182ce, #63b3ed, #3182ce);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shimmer 2s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* Ripple effect */
        .tab-link:active::after {
          content: '';
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: rgba(49, 130, 206, 0.3);
          transform: scale(0);
          animation: ripple 0.6s linear;
          top: 50%;
          left: 50%;
          margin-left: -50px;
          margin-top: -50px;
        }

        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }

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

          .tab-link:hover {
            transform: translateY(-1px);
          }
        }

        @keyframes loading {
          0% {
            width: 0%;
          }
          50% {
            width: 50%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </Box>
  );
}
