import apiClient from '@/shared/lib/api-client';

export interface DashboardStats {
  totalClients: number;
  activeProjects: number;
  totalEngineers: number;
  pendingReports: number;
  newClientsThisMonth: number;
  projectsEndingSoon: number;
  availableEngineers: number;
}

export interface RecentProject {
  id: string;
  projectName: string;
  clientName: string;
  startDate: string;
  settlementMethod: string;
  isActive: boolean;
}

export interface RecentAssignment {
  id: string;
  engineerName: string;
  engineerEmail: string;
  projectName: string;
  assignmentStart: string;
  assignmentEnd: string | null;
  isActive: boolean;
}

export interface PendingReport {
  id: string;
  engineerName: string;
  projectName: string;
  reportMonth: number;
  reportYear: number;
  finalBillingAmount: number;
  status: string;
  generatedAt: string;
}

export interface EngineerWithAssignment {
  id: string;
  fullName: string;
  email: string;
  projectName: string;
  hoursThisMonth: number;
  status: 'Complete' | 'Partial' | 'Missing';
  hasActiveAssignment: boolean;
}

export const salesService = {
  // Get dashboard statistics (aggregated from multiple APIs)
  getDashboardStats: async () => {
    try {
      // Fetch data from existing APIs in parallel
      const [clientsRes, projectsRes, usersRes, reportsRes] =
        await Promise.allSettled([
          apiClient.get('/clients'),
          apiClient.get('/projects'),
          apiClient.get('/users?role=ENGINEER'),
          apiClient.get('/monthly-reports?status=SUBMITTED'),
        ]);

      // Calculate stats from responses
      const totalClients =
        clientsRes.status === 'fulfilled'
          ? clientsRes.value.data?.data?.length || 0
          : 0;

      interface Project {
        isActive: boolean;
        endDate?: string;
        createdAt: string;
      }

      const allProjects: Project[] =
        projectsRes.status === 'fulfilled'
          ? projectsRes.value.data?.data || []
          : [];
      const activeProjects = allProjects.filter(
        (p) => p.isActive === true
      ).length;

      // Calculate projects ending soon (within 30 days)
      const today = new Date();
      const thirtyDaysFromNow = new Date(
        today.getTime() + 30 * 24 * 60 * 60 * 1000
      );
      const projectsEndingSoon = allProjects.filter((p) => {
        if (!p.endDate || !p.isActive) return false;
        const endDate = new Date(p.endDate);
        return endDate >= today && endDate <= thirtyDaysFromNow;
      }).length;

      const allEngineers =
        usersRes.status === 'fulfilled' ? usersRes.value.data?.data || [] : [];
      const totalEngineers = allEngineers.length;

      const pendingReports =
        reportsRes.status === 'fulfilled'
          ? reportsRes.value.data?.data?.length || 0
          : 0;

      // Calculate new clients this month (if createdAt is available)
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

      interface Client {
        createdAt: string;
      }

      const newClientsThisMonth =
        clientsRes.status === 'fulfilled'
          ? (clientsRes.value.data?.data || []).filter((c: Client) => {
              const createdAt = new Date(c.createdAt);
              return createdAt >= firstDayOfMonth;
            }).length
          : 0;

      return {
        success: true,
        data: {
          totalClients,
          activeProjects,
          totalEngineers,
          pendingReports,
          newClientsThisMonth,
          projectsEndingSoon,
          availableEngineers: 0, // Will be calculated from assignments
        },
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        data: null,
      };
    }
  },

  // Get recent projects
  getRecentProjects: async (limit = 5) => {
    interface ProjectResponse {
      id: string;
      projectName: string;
      client?: { name: string };
      startDate: string;
      settlementMethod: string;
      isActive: boolean;
      createdAt: string;
    }

    const response = await apiClient.get('/projects');
    const projects: ProjectResponse[] = response.data?.data || [];
    // Sort by createdAt desc and limit
    const recentProjects = projects
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit)
      .map((p) => ({
        id: p.id,
        projectName: p.projectName,
        clientName: p.client?.name || 'Unknown Client',
        startDate: p.startDate,
        settlementMethod: p.settlementMethod,
        isActive: p.isActive,
      }));
    return {
      success: true,
      data: recentProjects,
    };
  },

  // Get recent assignments
  getRecentAssignments: async (limit = 5) => {
    interface AssignmentResponse {
      id: string;
      engineer?: { fullName: string; email: string };
      project?: { projectName: string };
      assignmentStart: string;
      assignmentEnd: string | null;
      isActive: boolean;
      createdAt: string;
    }

    const response = await apiClient.get('/assignments');
    const assignments: AssignmentResponse[] = response.data?.data || [];
    // Sort by createdAt desc and limit
    const recentAssignments = assignments
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit)
      .map((a) => ({
        id: a.id,
        engineerName: a.engineer?.fullName || 'Unknown',
        engineerEmail: a.engineer?.email || '',
        projectName: a.project?.projectName || 'Unknown Project',
        assignmentStart: a.assignmentStart,
        assignmentEnd: a.assignmentEnd,
        isActive: a.isActive,
      }));
    return {
      success: true,
      data: recentAssignments,
    };
  },

  // Get pending reports
  getPendingReports: async () => {
    interface ReportResponse {
      id: string;
      projectAssignment?: {
        engineer?: { fullName: string };
        project?: { projectName: string };
      };
      reportMonth: number;
      reportYear: number;
      finalBillingAmount: string;
      status: string;
      generatedAt: string;
    }

    const response = await apiClient.get('/monthly-reports?status=SUBMITTED');
    const reports = (response.data?.data || []).map((r: ReportResponse) => ({
      id: r.id,
      engineerName:
        r.projectAssignment?.engineer?.fullName || 'Unknown Engineer',
      projectName:
        r.projectAssignment?.project?.projectName || 'Unknown Project',
      reportMonth: r.reportMonth,
      reportYear: r.reportYear,
      finalBillingAmount: parseFloat(r.finalBillingAmount),
      status: r.status,
      generatedAt: r.generatedAt,
    }));
    return {
      success: true,
      data: reports,
    };
  },

  // Get engineers with assignments (aggregated from users and assignments)
  getEngineersWithAssignments: async () => {
    try {
      interface Engineer {
        id: string;
        fullName: string;
        email: string;
      }

      interface Assignment {
        engineerId: string;
        isActive: boolean;
        project?: { projectName: string };
      }

      // Get all engineers and their assignments
      const [engineersRes, assignmentsRes] = await Promise.allSettled([
        apiClient.get('/users?role=ENGINEER'),
        apiClient.get('/assignments'),
      ]);

      const engineers: Engineer[] =
        engineersRes.status === 'fulfilled'
          ? engineersRes.value.data?.data || []
          : [];
      const assignments: Assignment[] =
        assignmentsRes.status === 'fulfilled'
          ? assignmentsRes.value.data?.data || []
          : [];

      // Map engineers with their active assignments
      const engineersWithAssignments = engineers.map((eng) => {
        // Find active assignment for this engineer
        const activeAssignment = assignments.find(
          (a) => a.engineerId === eng.id && a.isActive === true
        );

        return {
          id: eng.id,
          fullName: eng.fullName,
          email: eng.email,
          projectName: activeAssignment?.project?.projectName || 'No Project',
          hoursThisMonth: 0, // Will need attendance API to calculate
          status: 'Missing' as 'Complete' | 'Partial' | 'Missing',
          hasActiveAssignment: !!activeAssignment,
        };
      });

      return {
        success: true,
        data: engineersWithAssignments,
      };
    } catch (error) {
      console.error('Error fetching engineers with assignments:', error);
      return {
        success: false,
        data: [],
      };
    }
  },

  // Send reminder to engineer
  sendReminder: async (engineerId: string) => {
    const response = await apiClient.post(`/slack/send-reminder/${engineerId}`);
    return response.data;
  },

  // Approve report
  approveReport: async (reportId: string) => {
    const response = await apiClient.put(
      `/monthly-reports/${reportId}/status`,
      {
        status: 'APPROVED',
      }
    );
    return response.data;
  },

  // ===== MONTHLY REPORTS API =====

  // Generate monthly report
  generateReport: async (assignmentId: string, year: number, month: number) => {
    const response = await apiClient.post('/monthly-reports/generate', {
      assignmentId,
      year,
      month,
    });
    return response.data;
  },

  // Get all monthly reports with filters
  getAllReports: async (filters?: {
    engineerId?: string;
    projectId?: string;
    status?: string;
    year?: number;
    month?: number;
    last12Months?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters?.engineerId) params.append('engineerId', filters.engineerId);
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.last12Months) params.append('last12Months', 'true');

    const response = await apiClient.get(
      `/monthly-reports${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  // Get report by ID
  getReportById: async (reportId: string) => {
    const response = await apiClient.get(`/monthly-reports/${reportId}`);
    return response.data;
  },

  // Update report status
  updateReportStatus: async (reportId: string, status: string) => {
    const response = await apiClient.put(
      `/monthly-reports/${reportId}/status`,
      { status }
    );
    return response.data;
  },

  // Get engineer total hours
  getEngineerTotalHours: async (
    engineerId: string,
    year: number,
    month: number
  ) => {
    const response = await apiClient.get(
      `/monthly-reports/engineer/${engineerId}/total-hours?year=${year}&month=${month}`
    );
    return response.data;
  },

  // Download Excel report
  downloadReportExcel: async (reportId: string) => {
    const response = await apiClient.get(
      `/monthly-reports/${reportId}/download`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  // Download PDF report
  downloadReportPDF: async (reportId: string) => {
    const response = await apiClient.get(
      `/monthly-reports/${reportId}/download-pdf`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  // Delete report
  deleteReport: async (reportId: string) => {
    const response = await apiClient.delete(`/monthly-reports/${reportId}`);
    return response.data;
  },
};
