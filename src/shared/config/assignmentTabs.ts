import { LuClipboardList, LuPlus } from 'react-icons/lu';
import { IconType } from 'react-icons';

interface Tab {
  label: string;
  href: string;
  icon: IconType;
}

export const assignmentTabs: Tab[] = [
  {
    label: 'View All Assignments',
    href: '/sales/assignments',
    icon: LuClipboardList,
  },
  {
    label: 'Create Assignment',
    href: '/sales/assignments/create',
    icon: LuPlus,
  },
];
