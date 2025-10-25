'use client';

import { useCallback } from 'react';
import { toaster } from '@/components/ui/toaster';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface EnhancedToastOptions {
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  position?:
    | 'top'
    | 'bottom'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';
}

export const useEnhancedToast = () => {
  const showToast = useCallback(
    (type: ToastType, options: EnhancedToastOptions) => {
      const { title, description, duration = 4000, action } = options;

      const getIcon = () => {
        switch (type) {
          case 'success':
            return '✅';
          case 'error':
            return '❌';
          case 'warning':
            return '⚠️';
          case 'info':
            return 'ℹ️';
          case 'loading':
            return '⏳';
          default:
            return '';
        }
      };

      return toaster.create({
        title: `${getIcon()} ${title}`,
        description,
        type: type === 'loading' ? 'info' : type,
        duration: type === 'loading' ? 0 : duration,
        action: action
          ? {
              label: action.label,
              onClick: action.onClick,
            }
          : undefined,
      });
    },
    []
  );

  const success = useCallback(
    (options: Omit<EnhancedToastOptions, 'type'>) => {
      return showToast('success', options);
    },
    [showToast]
  );

  const error = useCallback(
    (options: Omit<EnhancedToastOptions, 'type'>) => {
      return showToast('error', options);
    },
    [showToast]
  );

  const warning = useCallback(
    (options: Omit<EnhancedToastOptions, 'type'>) => {
      return showToast('warning', options);
    },
    [showToast]
  );

  const info = useCallback(
    (options: Omit<EnhancedToastOptions, 'type'>) => {
      return showToast('info', options);
    },
    [showToast]
  );

  const loading = useCallback(
    (options: Omit<EnhancedToastOptions, 'type'>) => {
      return showToast('loading', options);
    },
    [showToast]
  );

  // Quick toast methods
  const quickSuccess = useCallback(
    (title: string, description?: string) => {
      return success({ title, description });
    },
    [success]
  );

  const quickError = useCallback(
    (title: string, description?: string) => {
      return error({ title, description });
    },
    [error]
  );

  const quickInfo = useCallback(
    (title: string, description?: string) => {
      return info({ title, description });
    },
    [info]
  );

  return {
    showToast,
    success,
    error,
    warning,
    info,
    loading,
    quickSuccess,
    quickError,
    quickInfo,
  };
};
