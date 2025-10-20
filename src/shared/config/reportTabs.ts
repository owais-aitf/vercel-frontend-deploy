/**
 * Report Tabs Configuration
 */

import { LuFileText, LuPlus } from 'react-icons/lu';
import { IconType } from 'react-icons';

export interface ReportTab {
  id: string;
  label: string;
  description: string;
  icon: IconType;
}

export const reportTabs: ReportTab[] = [
  {
    id: 'view-all',
    label: 'View All Reports',
    description: 'View and manage all monthly reports',
    icon: LuFileText,
  },
  {
    id: 'generate',
    label: 'Generate Report',
    description: 'Generate new monthly report for an assignment',
    icon: LuPlus,
  },
];
