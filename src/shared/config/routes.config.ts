export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',

  // Engineer Routes
  ENGINEER: {
    DASHBOARD: '/engineer/dashboard',
    ATTENDANCE: '/engineer/attendance',
    SETTINGS: '/engineer/settings',
  },

  // Sales Routes
  SALES: {
    DASHBOARD: '/sales/dashboard',
    ENGINEERS: '/sales/engineers',
    PROJECTS: '/sales/projects',
    REPORTS: '/sales/reports',
  },

  // Admin Routes
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
  },
} as const;
