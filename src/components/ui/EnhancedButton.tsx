'use client';

import { Button, ButtonProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface EnhancedButtonProps extends Omit<ButtonProps, 'variant'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'slide';
  loading?: boolean;
}

export const EnhancedButton = ({
  children,
  variant = 'primary',
  hoverEffect = 'lift',
  loading = false,
  ...props
}: EnhancedButtonProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: 'blue.500',
          color: 'white',
          _hover: { bg: 'blue.600' },
          _active: { bg: 'blue.700' },
        };
      case 'secondary':
        return {
          bg: 'gray.100',
          color: 'gray.800',
          _hover: { bg: 'gray.200' },
          _active: { bg: 'gray.300' },
        };
      case 'ghost':
        return {
          bg: 'transparent',
          color: 'blue.500',
          border: '1px solid',
          borderColor: 'blue.500',
          _hover: { bg: 'blue.50' },
          _active: { bg: 'blue.100' },
        };
      case 'danger':
        return {
          bg: 'red.500',
          color: 'white',
          _hover: { bg: 'red.600' },
          _active: { bg: 'red.700' },
        };
      default:
        return {};
    }
  };

  const getHoverEffect = () => {
    const baseHover = getVariantStyles()._hover || {};

    switch (hoverEffect) {
      case 'lift':
        return {
          ...baseHover,
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        };
      case 'glow':
        return {
          ...baseHover,
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
        };
      case 'scale':
        return {
          ...baseHover,
          transform: 'scale(1.05)',
        };
      case 'slide':
        return {
          ...baseHover,
          _before: {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transition: 'left 0.5s',
          },
          _hover: {
            ...baseHover,
            _before: {
              left: '100%',
            },
          },
        };
      default:
        return baseHover;
    }
  };

  return (
    <Button
      {...getVariantStyles()}
      _hover={getHoverEffect()}
      _active={{
        ...getVariantStyles()._active,
        transform: 'translateY(0) scale(0.98)',
      }}
      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      position="relative"
      overflow="hidden"
      loading={loading}
      {...props}
    >
      {children}
    </Button>
  );
};
