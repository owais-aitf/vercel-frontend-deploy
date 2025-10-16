export interface NavItem {
  label: string;
  icon: string;
  path: string;
}

export interface NavigationConfig {
  portalName: string;
  items: NavItem[];
}

// Engineer Navigation
export const engineerNavigation: NavigationConfig = {
  portalName: 'Engineer Portal',
  items: [
    { label: 'Dashboard', icon: 'Activity', path: '/engineer/dashboard' },
    { label: 'Attendance', icon: 'Calendar', path: '/engineer/attendance' },
    {
      label: 'View Assigned Projects',
      icon: 'Briefcase',
      path: '/engineer/projects',
    },
    {
      label: 'View Daily Report',
      icon: 'FileText',
      path: '/engineer/reports/view',
    },
    {
      label: 'Update Daily Report',
      icon: 'PenTool',
      path: '/engineer/reports/update',
    },
  ],
};

// Sales Navigation
export const salesNavigation: NavigationConfig = {
  portalName: 'Sales Portal',
  items: [
    { label: 'Dashboard', icon: 'Activity', path: '/sales/dashboard' },
    { label: 'Projects', icon: 'FolderOpen', path: '/sales/projects' },
    { label: 'Clients', icon: 'Users', path: '/sales/clients' },
    { label: 'Engineers', icon: 'UserCheck', path: '/sales/engineers' },
    { label: 'Assignments', icon: 'Link', path: '/sales/assignments' },
    { label: 'Reports', icon: 'TrendingUp', path: '/sales/reports' },
  ],
};

// Admin Navigation
export const adminNavigation: NavigationConfig = {
  portalName: 'Admin Portal',
  items: [
    { label: 'Dashboard', icon: 'Activity', path: '/admin/dashboard' },
    { label: 'Users', icon: 'User', path: '/admin/users' },
    { label: 'Projects', icon: 'FolderOpen', path: '/admin/projects' },
    { label: 'Reports', icon: 'TrendingUp', path: '/admin/reports' },
    { label: 'Settings', icon: 'Settings', path: '/admin/settings' },
  ],
};
