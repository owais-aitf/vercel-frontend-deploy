import { LuUsers, LuUserPlus, LuPencil, LuFolderOpen, LuClipboardList, LuPlus, LuCalendarClock,LuSettings } from 'react-icons/lu';
import { IconType } from 'react-icons';
interface Tab {
  label: string;
  href: string;
  icon: IconType;
}
export const assignmentTabs: Tab[] = [
  { label: 'View All Assignments', href: '/sales/assignments', icon: LuClipboardList },
  { label: 'Create Assignment', href: '/sales/assignments/create', icon: LuPlus},
  {
    label: 'Manage Assignments',
    href: '/sales/assignments/manage',
    icon: LuSettings,
  },
];