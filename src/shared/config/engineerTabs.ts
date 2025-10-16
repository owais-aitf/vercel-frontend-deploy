export interface EngineerTab {
  label: string;
  href: string;
  icon: string;
}

export const engineerTabs: EngineerTab[] = [
  { label: 'View All Engineers', href: '/sales/engineers', icon: 'Users' },
  {
    label: 'Create New Engineer',
    href: '/sales/engineers/create',
    icon: 'UserPlus',
  },
  {
    label: 'Update Engineer',
    href: '/sales/engineers/update',
    icon: 'PenTool',
  },
  {
    label: 'Manage Attendance',
    href: '/sales/engineers/attendance',
    icon: 'Calendar',
  },
];
