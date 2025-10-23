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
  projectAssignmentId: string;
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
  startDate?: string;
  endDate?: string;
  attendanceType?: string;
  projectAssignmentId?: string;
  engineerId?: string;
}

export interface AttendanceData {
  projectAssignmentId: string;
  workDate: string;
  attendanceType: string;
  workDescription: string | null;
  workLocation?: string;
  startTime?: string;
  endTime?: string;
  breakHours?: number;
}

export const attendanceService = {
  getAttendance: async (filters?: AttendanceFilters) => {
    const params = new URLSearchParams();
    if (filters?.month) params.append('month', filters.month);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.attendanceType)
      params.append('attendanceType', filters.attendanceType);
    if (filters?.projectAssignmentId)
      params.append('projectAssignmentId', filters.projectAssignmentId);
    if (filters?.engineerId) params.append('engineerId', filters.engineerId);

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

  createAttendance: async (data: AttendanceData) => {
    const response = await apiClient.post('/attendance', data);
    return response.data;
  },

  updateAttendance: async (
    id: string,
    data: Partial<AttendanceData>,
    engineerId?: string
  ) => {
    const url = engineerId
      ? `/attendance/${id}?engineerId=${engineerId}`
      : `/attendance/${id}`;
    const response = await apiClient.put(url, data);
    return response.data;
  },

  deleteAttendance: async (id: string, engineerId?: string) => {
    const url = engineerId
      ? `/attendance/${id}?engineerId=${engineerId}`
      : `/attendance/${id}`;
    const response = await apiClient.delete(url);
    return response.data;
  },
  getAllProjects: async () => {
    const response = await apiClient.get('/attendance/all-projects');
    return response.data;
  },
};
