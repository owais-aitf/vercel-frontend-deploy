import apiClient from '@/shared/lib/api-client';

export interface AttendanceRecord {
  id: string;
  workDate: string;
  attendanceType: 'PRESENT' | 'PAID_LEAVE' | 'ABSENT' | 'LEGAL_HOLIDAY';
  workLocation: string | null;
  startTime: string | null;
  endTime: string | null;
  breakHours: string;
  workDescription: string | null;
  projectAssignment: {
    project: {
      projectName: string;
      client: {
        name: string;
      };
    };
  };
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}


export interface AttendanceFilters {
  month?: string;
  attendanceType?: string;
  projectAssignmentId?: string;
}

export const attendanceService = {
  getAttendance: async (filters?: AttendanceFilters) => {
    const params = new URLSearchParams();
    if (filters?.month) params.append('month', filters.month);
    if (filters?.attendanceType) params.append('attendanceType', filters.attendanceType);
    if (filters?.projectAssignmentId) params.append('projectAssignmentId', filters.projectAssignmentId);

    const response = await apiClient.get(`/attendance?${params.toString()}`);
    return response.data;
  },

  getAttendanceById: async (id: string) => {
    const response = await apiClient.get(`/attendance/${id}`);
    return response.data;
  },

  getStats: async (month: string) => {
    const response = await apiClient.get(`/attendance/stats/${month}`);
    return response.data;
  },

  getActiveProjects: async () => {
    const response = await apiClient.get('/attendance/projects');
    return response.data;
  },

  createAttendance: async (data: any) => {
    const response = await apiClient.post('/attendance', data);
    return response.data;
  },

  updateAttendance: async (id: string, data: any) => {
    const response = await apiClient.put(`/attendance/${id}`, data);
    return response.data;
  },

  deleteAttendance: async (id: string) => {
    const response = await apiClient.delete(`/attendance/${id}`);
    return response.data;
  },
};
