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
    { label: 'Dashboard', icon: '📊', path: '/engineer/dashboard' },
    { label: 'Attendance', icon: '📅', path: '/engineer/attendance' },
    { label: 'View Assigned Projects', icon: '💼', path: '/engineer/projects' },
    { label: 'View Daily Report', icon: '📄', path: '/engineer/reports/view' },
    {
      label: 'Update Daily Report',
      icon: '✏️',
      path: '/engineer/reports/update',
    },
  ],
};

// Sales Navigation
export const salesNavigation: NavigationConfig = {
  portalName: 'Sales Portal',
  items: [
    { label: 'Dashboard', icon: '📊', path: '/sales/dashboard' },
    { label: 'Projects', icon: '📁', path: '/sales/projects' },
    { label: 'Clients', icon: '👥', path: '/sales/clients' },
    { label: 'Engineers', icon: '👨‍💼', path: '/sales/engineers' },
    { label: 'Assignments', icon: '🔗', path: '/sales/assignments' },
    { label: 'Reports', icon: '📈', path: '/sales/reports' },
  ],
};

// Admin Navigation
export const adminNavigation: NavigationConfig = {
  portalName: 'Admin Portal',
  items: [
    { label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
    { label: 'Users', icon: '👤', path: '/admin/users' },
    { label: 'Projects', icon: '📁', path: '/admin/projects' },
    { label: 'Reports', icon: '📈', path: '/admin/reports' },
    { label: 'Settings', icon: '⚙️', path: '/admin/settings' },
  ],
};
