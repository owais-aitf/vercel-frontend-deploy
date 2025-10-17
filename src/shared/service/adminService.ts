import apiClient from '@/shared/lib/api-client';

export interface AdminDashboardStats {
  totalUsers: number;
  totalEngineers: number;
  totalSalesReps: number;
  totalAdmins: number;
  totalClients: number;
  activeClients: number;
  totalProjects: number;
  activeProjects: number;
  inactiveProjects: number;
  totalAssignments: number;
  activeAssignments: number;
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
}

const adminService = {
  // Get comprehensive dashboard statistics
  getDashboardStats: async (): Promise<{ success: boolean; data: AdminDashboardStats }> => {
    try {
      // Fetch all required data in parallel
      const [usersStatsRes, clientsRes, projectsRes, assignmentsRes, reportsRes] = await Promise.all([
        apiClient.get('/users/stats'),  // ✅ CORRECT ENDPOINT
        apiClient.get('/clients'),
        apiClient.get('/projects'),
        apiClient.get('/assignments'),
        apiClient.get('/monthly-reports'),
      ]);

      // Process users data from /users/stats
      const userStats = usersStatsRes.data.data || {};
      const totalUsers = userStats.total || 0;
      const totalEngineers = userStats.byRole?.ENGINEER || 0;
      const totalSalesReps = userStats.byRole?.SALES || 0;
      const totalAdmins = userStats.byRole?.ADMIN || 0;
      
      // Process clients data
      const clients = clientsRes.data.data || [];
      const activeClients = clients.filter((c: any) => c.isActive).length;
      
      // Process projects data
      const projects = projectsRes.data.data || [];
      const activeProjects = projects.filter((p: any) => p.isActive).length;
      const inactiveProjects = projects.length - activeProjects;
      
      // Process assignments data
      const assignments = assignmentsRes.data.data || [];
      const activeAssignments = assignments.filter((a: any) => a.isActive).length;
      
      // Process reports data
      const reports = reportsRes.data.data || [];
      const pendingReports = reports.filter((r: any) => r.status === 'SUBMITTED').length;
      const approvedReports = reports.filter((r: any) => r.status === 'APPROVED').length;

      const stats: AdminDashboardStats = {
        totalUsers,
        totalEngineers,
        totalSalesReps,
        totalAdmins,
        totalClients: clients.length,
        activeClients,
        totalProjects: projects.length,
        activeProjects,
        inactiveProjects,
        totalAssignments: assignments.length,
        activeAssignments,
        totalReports: reports.length,
        pendingReports,
        approvedReports,
      };

      console.log('✅ Dashboard stats processed:', stats);

      return {
        success: true,
        data: stats,
      };
    } catch (error: any) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get all users
  getAllUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  // Get user statistics
  getUserStatistics: async () => {
    const response = await apiClient.get('/users/stats');
    return response.data;
  },
};

export default adminService;
