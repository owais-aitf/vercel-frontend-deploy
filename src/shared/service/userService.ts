import apiClient from '@/shared/lib/api-client';

export interface CreateUserData {
  email: string;
  fullName: string;
  role: 'ENGINEER' | 'SALES';
  slackUserId?: string;
  annualPaidLeaveAllowance?: number;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      fullName: string;
      role: string;
      isActive: boolean;
      createdAt: string;
    };
    temporaryPassword: string;
    instructions: string;
  };
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ENGINEER' | 'SALES' | 'ADMIN';
  isActive: boolean;
  slackUserId?: string;
  annualPaidLeaveAllowance: number;
  paidLeaveUsedThisYear: number;
  createdAt: string;
}

const userService = {
  // Register new user (Admin only)
  registerUser: async (userData: CreateUserData): Promise<CreateUserResponse> => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  // Get all users
  getAllUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, userData: Partial<User>) => {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};

export default userService;
