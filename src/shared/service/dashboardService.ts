import apiClient from '@/shared/lib/api-client';

export interface DashboardStats {
  month: string;
  totalDays: number;
  presentDays: number;
  paidLeaveDays: number;
  absentDays: number;
  legalHolidayDays: number;
  totalWorkHours: number;
  totalSettlementHours: number;
  averageWorkHours: number;
  projectBreakdown: {
    [projectName: string]: {
      days: number;
      hours: number;
    };
  };
  expectedHours: number;
  settlementRangeMin: number | null;
  settlementRangeMax: number | null;
}

export interface RecentActivity {
  id: string;
  workDate: string;
  attendanceType: string;
  workLocation: string | null;
  startTime: string | null;
  endTime: string | null;
  breakHours: string;
  projectAssignment: {
    project: {
      projectName: string;
    };
  };
}

export interface ActiveProject {
  id: string;
  assignmentId: string;
  projectName: string;
  clientName: string;
}

export const dashboardService = {
  getStats: async (month: string) => {
    const response = await apiClient.get(`/attendance/stats/${month}`);
    return response.data;
  },

  getRecentActivities: async (limit: number = 3) => {
    const response = await apiClient.get('/attendance', {
      params: { limit },
    });
    return response.data;
  },

  getActiveProjects: async () => {
    const response = await apiClient.get('/attendance/projects');
    return response.data;
  },
};
