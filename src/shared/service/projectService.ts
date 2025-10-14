import apiClient from '@/shared/lib/api-client';

export interface Project {
  id: string;
  projectName: string;
  clientId: string;
  startDate: string;
  endDate?: string | null;
  monthlyUnitPrice: number;
  hourlyUnitPrice?: number | null;
  settlementRangeMin?: number | null;
  settlementRangeMax?: number | null;
  settlementMethod: 'UP_DOWN' | 'FIXED';
  includePaidLeaveInSettlement: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    contactEmail?: string | null;
    contactPhone?: string | null;
  };
}

export interface CreateProjectData {
  projectName: string;
  clientId: string;
  startDate: string;
  endDate?: string;
  monthlyUnitPrice: number;
  hourlyUnitPrice?: number;
  settlementRangeMin?: number;
  settlementRangeMax?: number;
  settlementMethod: 'UP_DOWN' | 'FIXED';
  includePaidLeaveInSettlement?: boolean;
}

export interface UpdateProjectData {
  projectName?: string;
  startDate?: string;
  endDate?: string;
  monthlyUnitPrice?: number;
  hourlyUnitPrice?: number;
  settlementRangeMin?: number;
  settlementRangeMax?: number;
  settlementMethod?: 'UP_DOWN' | 'FIXED';
  includePaidLeaveInSettlement?: boolean;
  isActive?: boolean;
}

export const projectService = {
  // Get all projects
  getProjects: async (filters?: { clientId?: string; isActive?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.isActive !== undefined)
      params.append('isActive', filters.isActive.toString());

    const response = await apiClient.get(
      `/projects${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  // Get project by ID
  getProjectById: async (id: string) => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  // Create new project
  createProject: async (data: CreateProjectData) => {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },

  // Update project
  updateProject: async (id: string, data: UpdateProjectData) => {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data;
  },

  // Delete project (soft delete)
  deleteProject: async (id: string) => {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  },

  // Get project assignments
  getProjectAssignments: async (id: string) => {
    const response = await apiClient.get(`/projects/${id}/assignments`);
    return response.data;
  },
};
