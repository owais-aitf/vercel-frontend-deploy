import { IconType } from "react-icons";
import { LuUsers, LuUserPlus, LuPencil, LuCalendar } from 'react-icons/lu';

export interface EngineerTab {
  label: string;
  href: string;
  icon: string | IconType;
}

export const engineerTabs: EngineerTab[] = [
  { label: 'View All Engineers', href: '/sales/engineers', icon: LuUsers },
  {
    label: 'Create New Engineer',
    href: '/sales/engineers/create',
    icon: LuUserPlus,
  },
  {
    label: 'Update Engineer',
    href: '/sales/engineers/update',
    icon: LuPencil ,
  },
  {
    label: 'Manage Attendance',
    href: '/sales/engineers/attendance',
    icon: LuCalendar,
  },
];
