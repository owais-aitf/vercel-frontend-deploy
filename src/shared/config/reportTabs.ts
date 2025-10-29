/**
 * Report Tabs Configuration
 */

import { LuFileText, LuPlus } from 'react-icons/lu';
import { IconType } from 'react-icons';

export interface ReportTab {
  id: string;
  labelKey: string;
  description: string;
  icon: IconType;
}

export const reportTabs: ReportTab[] = [
  {
    id: 'view-all',
    labelKey: 'sales:reports.tabs.view_all',
    description: 'View and manage all monthly reports',
    icon: LuFileText,
  },
  {
    id: 'generate',
    labelKey: 'sales:reports.tabs.generate',
    description: 'Generate new monthly report for an assignment',
    icon: LuPlus,
  },
];
