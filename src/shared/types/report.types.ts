/**
 * Report Types for Monthly Reports
 */

export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED';

export interface MonthlyReport {
  id: string;
  reportYear: number;
  reportMonth: number;
  totalWorkDays: number;
  totalWorkHours: string;
  totalAmount: string;
  settlementAdjustment: string;
  finalBillingAmount: string;
  excessHours: string;
  shortageHours: string;
  excessUnitPrice: string;
  shortageUnitPrice: string;
  status: ReportStatus;
  remarks?: string;
  generatedAt: string;
  updatedAt: string;
  projectAssignmentId: string;
  projectAssignment?: {
    id: string;
    assignmentStart: string;
    assignmentEnd?: string;
    engineer: {
      id: string;
      fullName: string;
      email: string;
    };
    project: {
      id: string;
      projectName: string;
      monthlyUnitPrice: string;
      settlementMethod: string;
      settlementRangeMin: number;
      settlementRangeMax: number;
      client: {
        id: string;
        name: string;
      };
    };
  };
  generatedById: string;
  generatedBy?: {
    id: string;
    fullName: string;
  };
}

export interface GenerateReportRequest {
  assignmentId: string;
  year: number;
  month: number;
}

export interface UpdateReportStatusRequest {
  status: ReportStatus;
}

export interface ReportFilters {
  engineerId?: string;
  projectId?: string;
  status?: ReportStatus;
  year?: number;
  month?: number;
  last12Months?: boolean;
}

export interface EngineerTotalHours {
  engineerId: string;
  year: number;
  month: number;
  totalHours: number;
  recordCount: number;
}
