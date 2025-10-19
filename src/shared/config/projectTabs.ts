import { LuClipboardList, LuPlus } from 'react-icons/lu';
import { IconType } from 'react-icons';
interface Tab {
  label: string;
  href: string;
  icon: IconType;
}
export const projectTabs: Tab[] = [
  {
    label: 'View All Projects',
    href: '/sales/projects',
    icon: LuClipboardList,
  },
  { label: 'Create New Project', href: '/sales/projects/add', icon: LuPlus },
];
