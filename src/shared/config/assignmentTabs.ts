import { LuClipboardList, LuPlus } from 'react-icons/lu';
import { IconType } from 'react-icons';

interface Tab {
  labelKey: string;
  href: string;
  icon: IconType;
}

export const assignmentTabs: Tab[] = [
  {
    labelKey: 'sales:assignments.tabs.view_all',
    href: '/sales/assignments',
    icon: LuClipboardList,
  },
  {
    labelKey: 'sales:assignments.tabs.create',
    href: '/sales/assignments/create',
    icon: LuPlus,
  },
];
