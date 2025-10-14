import apiClient from '@/shared/lib/api-client';

export interface ProjectAssignment {
  id: string;
  engineerId: string;
  projectId: string;
  assignmentStart: string;
  assignmentEnd?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  engineer: {
    id: string;
    fullName: string;
    email: string;
    slackUserId?: string | null;
  };
  project: {
    id: string;
    projectName: string;
    clientId: string;
    startDate: string;
    endDate?: string | null;
    monthlyUnitPrice: number;
    isActive: boolean;
    client: {
      id: string;
      name: string;
    };
  };
}

export interface CreateAssignmentData {
  engineerId: string;
  projectId: string;
  assignmentStart: string;
  assignmentEnd?: string;
}

export interface UpdateAssignmentData {
  assignmentStart?: string;
  assignmentEnd?: string;
  isActive?: boolean;
}

export interface AssignmentFilters {
  engineerId?: string;
  projectId?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export const assignmentService = {
  // Get all assignments with optional filtering
  getAllAssignments: async (filters?: AssignmentFilters) => {
    const params = new URLSearchParams();
    if (filters?.engineerId) params.append('engineerId', filters.engineerId);
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.isActive !== undefined)
      params.append('isActive', filters.isActive.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get(
      `/assignments${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  // Get assignments for a specific engineer
  getEngineerAssignments: async (engineerId: string) => {
    const response = await apiClient.get(`/assignments/engineer/${engineerId}`);
    return response.data;
  },

  // Get assignments for a specific project
  getProjectAssignments: async (projectId: string) => {
    const response = await apiClient.get(`/assignments/project/${projectId}`);
    return response.data;
  },

  // Get assignment by ID
  getAssignmentById: async (id: string) => {
    const response = await apiClient.get(`/assignments/${id}`);
    return response.data;
  },

  // Create new assignment
  createAssignment: async (data: CreateAssignmentData) => {
    const response = await apiClient.post('/assignments', data);
    return response.data;
  },

  // Update assignment
  updateAssignment: async (id: string, data: UpdateAssignmentData) => {
    const response = await apiClient.put(`/assignments/${id}`, data);
    return response.data;
  },

  // Delete assignment (soft delete)
  deleteAssignment: async (id: string) => {
    const response = await apiClient.delete(`/assignments/${id}`);
    return response.data;
  },
};
