'use client';

import { useCallback } from 'react';

type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error';

export const useHapticFeedback = () => {
  const triggerHaptic = useCallback((type: HapticType = 'light') => {
    // Check if device supports haptic feedback
    if (typeof window !== 'undefined' && 'navigator' in window) {
      // For devices that support the Vibration API
      if ('vibrate' in navigator) {
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [30],
          success: [10, 50, 10],
          warning: [20, 100, 20],
          error: [50, 100, 50],
        };

        navigator.vibrate(patterns[type]);
      }

      // For iOS devices with haptic feedback
      if ('hapticFeedback' in window) {
        const hapticTypes = {
          light: 'impactLight',
          medium: 'impactMedium',
          heavy: 'impactHeavy',
          success: 'notificationSuccess',
          warning: 'notificationWarning',
          error: 'notificationError',
        };

        // @ts-expect-error - iOS specific API
        window.hapticFeedback?.(hapticTypes[type]);
      }
    }
  }, []);

  const withHaptic = useCallback(
    (callback: () => void, hapticType: HapticType = 'light') => {
      return () => {
        triggerHaptic(hapticType);
        callback();
      };
    },
    [triggerHaptic]
  );

  return { triggerHaptic, withHaptic };
};
