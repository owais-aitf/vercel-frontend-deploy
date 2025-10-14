import apiClient from '@/shared/lib/api-client';

export interface Engineer {
  id: string;
  email: string;
  fullName: string;
  role: 'ENGINEER';
  slackUserId?: string | null;
  isActive: boolean;
  isFirstLogin: boolean;
  mustResetPassword: boolean;
  annualPaidLeaveAllowance: number;
  paidLeaveUsedThisYear: number;
  paidLeaveYear?: number | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
}

export interface CreateEngineerData {
  email: string;
  fullName: string;
  role: 'ENGINEER';
  slackUserId?: string;
}

export interface UpdateEngineerData {
  fullName?: string;
  slackUserId?: string;
  annualPaidLeaveAllowance?: number;
  isActive?: boolean; // Only for ADMIN
}

export interface CreateEngineerResponse {
  success: boolean;
  message: string;
  data: {
    user: Engineer;
    temporaryPassword: string;
    instructions: string;
  };
}

export const engineerService = {
  // Get all engineers
  getAllEngineers: async () => {
    const response = await apiClient.get('/users?role=ENGINEER');
    return response.data;
  },

  // Get engineer by ID
  getEngineerById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Create new engineer
  createEngineer: async (
    data: CreateEngineerData
  ): Promise<CreateEngineerResponse> => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  // Update engineer
  updateEngineer: async (id: string, data: UpdateEngineerData) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  // Delete engineer (soft delete)
  deleteEngineer: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await apiClient.get('/users/stats');
    return response.data;
  },

  // Send reminder to engineer
  sendReminder: async (engineerId: string) => {
    const response = await apiClient.post(`/slack/send-reminder/${engineerId}`);
    return response.data;
  },
};
