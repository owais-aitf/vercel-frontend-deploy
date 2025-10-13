/**
 * Cache utility functions for dashboard data
 */

export const CACHE_KEYS = {
  DASHBOARD: 'dashboardCache',
  DASHBOARD_TIME: 'dashboardCacheTime',
};

/**
 * Clear dashboard cache to force refresh on next visit
 */
export const clearDashboardCache = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CACHE_KEYS.DASHBOARD);
  localStorage.removeItem(CACHE_KEYS.DASHBOARD_TIME);
};

/**
 * Clear all app caches
 */
export const clearAllCaches = () => {
  clearDashboardCache();
  // Add more cache clearing functions here as needed
};
