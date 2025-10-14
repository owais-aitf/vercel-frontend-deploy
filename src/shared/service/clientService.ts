import apiClient from '@/shared/lib/api-client';

export interface Client {
  id: string;
  name: string;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientWithProjects extends Client {
  projects: Array<{
    id: string;
    projectName: string;
    startDate: string;
    endDate: string | null;
    isActive: boolean;
  }>;
}

export interface ClientFilters {
  isActive?: boolean;
  search?: string;
}

export interface ClientData {
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  isActive?: boolean;
}

export const clientService = {
  // Get all clients with optional filters
  getClients: async (filters?: ClientFilters) => {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined) {
      params.append('isActive', filters.isActive.toString());
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const response = await apiClient.get(`/clients?${params.toString()}`);
    return response.data;
  },

  // Get single client by ID
  getClientById: async (id: string) => {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data;
  },

  // Get client with all related projects
  getClientWithProjects: async (id: string) => {
    const response = await apiClient.get(`/clients/${id}/projects`);
    return response.data;
  },

  // Create new client
  createClient: async (data: ClientData) => {
    const response = await apiClient.post('/clients', data);
    return response.data;
  },

  // Update client
  updateClient: async (id: string, data: Partial<ClientData>) => {
    const response = await apiClient.put(`/clients/${id}`, data);
    return response.data;
  },

  // Delete client (soft delete)
  deleteClient: async (id: string) => {
    const response = await apiClient.delete(`/clients/${id}`);
    return response.data;
  },

  // Toggle client active status
  toggleClientStatus: async (id: string) => {
    const response = await apiClient.patch(`/clients/${id}/toggle-status`);
    return response.data;
  },
};
