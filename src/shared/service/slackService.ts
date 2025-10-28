// src/shared/service/slackService.ts
import apiClient from '@/shared/lib/api-client';

export interface SlackConnectionStatus {
  success: boolean;
  connected: boolean;
  slackUserId?: string;
  message: string;
}

export const slackService = {
  /**
   * Get Slack connection status for the current user
   */
  getConnectionStatus: async (): Promise<SlackConnectionStatus> => {
    try {
      const response = await apiClient.get('/slack/status');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Disconnect Slack account
   */
  disconnectSlack: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post('/slack/disconnect');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
