// src/shared/service/slackService.ts
import apiClient from '@/shared/lib/api-client';
import { AxiosError } from 'axios';

export interface SlackConnectionStatus {
  success: boolean;
  connected: boolean;
  authorized?: boolean;
  slackUserId?: string;
  message: string;
}

export const slackService = {
  /**
   * Get Slack connection status for the current user
   */
  getConnectionStatus: async (
    userId: string | number
  ): Promise<SlackConnectionStatus> => {
    try {
      const response = await apiClient.get(`/slack/status?userId=${userId}`);

      const data = response.data;
      return {
        ...data,
        connected: data.authorized || data.connected || false,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      console.error('Error fetching Slack status:', error);
      return {
        success: false,
        connected: false,
        message: axiosError.response?.data?.error || 'Unable to check status',
      };
    }
  },

  /**
   * Disconnect Slack account
   */
  disconnectSlack: async (
    userId: string | number
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post('/slack/revoke', { userId });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      throw new Error(
        axiosError.response?.data?.error || 'Failed to disconnect'
      );
    }
  },
};
