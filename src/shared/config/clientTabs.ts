import {
  LuUsers,
  LuUserPlus,
  LuPencil,
  LuFolderOpen,
  LuClipboardList,
  LuPlus,
  LuCalendar,
} from 'react-icons/lu';
import { IconType } from 'react-icons';
interface Tab {
  label: string;
  href: string;
  icon: IconType;
}
export const clientTabs: Tab[] = [
  { label: 'View All Clients', href: '/sales/clients', icon: LuUsers },
  { label: 'Add New Client', href: '/sales/clients/add', icon: LuUserPlus },
  {
    label: 'Update Client Info',
    href: '/sales/clients/update',
    icon: LuPencil,
  },
  {
    label: 'Client Projects',
    href: '/sales/clients/projects',
    icon: LuFolderOpen,
  },
];
