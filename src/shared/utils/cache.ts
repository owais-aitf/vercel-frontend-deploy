/**
 * Cache utility functions for dashboard data
 */

export const CACHE_KEYS = {
  DASHBOARD: 'dashboardCache',
  DASHBOARD_TIME: 'dashboardCacheTime',
};

/**
 * Get user-specific cache key
 */
export const getUserCacheKey = (baseKey: string, userId?: string) => {
  if (!userId) return baseKey;
  return `${baseKey}_${userId}`;
};

/**
 * Clear dashboard cache for a specific user or all users
 */
export const clearDashboardCache = (userId?: string) => {
  if (typeof window === 'undefined') return;

  if (userId) {
    // Clear specific user's cache
    localStorage.removeItem(getUserCacheKey(CACHE_KEYS.DASHBOARD, userId));
    localStorage.removeItem(getUserCacheKey(CACHE_KEYS.DASHBOARD_TIME, userId));
  } else {
    // Clear all dashboard caches (fallback for backward compatibility)
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith(CACHE_KEYS.DASHBOARD) ||
          key.startsWith(CACHE_KEYS.DASHBOARD_TIME))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }
};

/**
 * Clear all app caches
 */
export const clearAllCaches = () => {
  clearDashboardCache();
  // Add more cache clearing functions here as needed
};
