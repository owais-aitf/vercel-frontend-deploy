import apiClient from '../lib/api-client';
import { AxiosError } from 'axios';

export interface ChatbotQuery {
  questionId: string;
  userQuery: string;
  parameters?: Record<string, string | number>;
}

export interface ChatbotResponse {
  success: boolean;
  data?: {
    questionId: string;
    response: string;
    timestamp: string;
  };
  error?: string;
}

export interface QuestionTemplate {
  id: string;
  question: string;
  category: string;
  parameters: string[];
}

class ChatbotService {
  /**
   * Send query to chatbot
   */
  async sendQuery(query: ChatbotQuery): Promise<ChatbotResponse> {
    try {
      const response = await apiClient.post('/chatbot/query', query);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        return {
          success: false,
          error: error.response.data.error || 'Failed to process query',
        };
      }
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to process query',
      };
    }
  }

  /**
   * Get available question templates
   */
  async getQuestions(): Promise<{
    success: boolean;
    data?: QuestionTemplate[];
    error?: string;
  }> {
    try {
      const response = await apiClient.get('/chatbot/questions');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        return {
          success: false,
          error: error.response.data.error || 'Failed to fetch questions',
        };
      }
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch questions',
      };
    }
  }

  /**
   * Build natural language query from parameters
   */
  buildUserQuery(questionId: string, params: Record<string, string>): string {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    switch (questionId) {
      case 'attendance_summary_month':
        if (params.month) {
          const [year, month] = params.month.split('-');
          return `Show my attendance for ${monthNames[parseInt(month, 10) - 1]} ${year}`;
        }
        return 'Show my attendance';

      case 'overtime_analysis_month':
        if (params.month) {
          const [year, month] = params.month.split('-');
          return `Show my overtime for ${monthNames[parseInt(month, 10) - 1]} ${year}`;
        }
        return 'Show my overtime';

      case 'leave_balance':
        return 'What is my remaining leave balance?';

      case 'project_hours_month':
        return `Show hours for ${params.project || 'my project'} in ${params.month || 'this month'}`;

      case 'monthly_comparison':
        return `Compare my attendance between ${params.month1} and ${params.month2}`;

      case 'attendance_on_date':
        return `What was my attendance on ${params.date}?`;

      case 'last_day_off':
        return 'When was my last day off?';

      default:
        return 'Help me with my attendance';
    }
  }

  /**
   * Format parameters for backend (convert string dates to month/year numbers)
   */
  formatParameters(
    questionId: string,
    rawParams: Record<string, string>
  ): Record<string, string | number> {
    const formatted: Record<string, string | number> = {};

    switch (questionId) {
      case 'attendance_summary_month':
      case 'overtime_analysis_month':
        if (rawParams.month) {
          const [year, month] = rawParams.month.split('-');
          formatted.month = parseInt(month, 10);
          formatted.year = parseInt(year, 10);
        }
        break;

      case 'project_hours_month':
        if (rawParams.month) {
          const [year, month] = rawParams.month.split('-');
          formatted.month = parseInt(month, 10);
          formatted.year = parseInt(year, 10);
        }
        if (rawParams.project) {
          formatted.project = rawParams.project;
        }
        break;

      case 'monthly_comparison':
        if (rawParams.month1) {
          const [year1, month1] = rawParams.month1.split('-');
          formatted.month1 = parseInt(month1, 10);
          formatted.year1 = parseInt(year1, 10);
        }
        if (rawParams.month2) {
          const [year2, month2] = rawParams.month2.split('-');
          formatted.month2 = parseInt(month2, 10);
          formatted.year2 = parseInt(year2, 10);
        }
        break;

      case 'attendance_on_date':
        if (rawParams.date) {
          formatted.date = rawParams.date;
        }
        break;

      // Questions without parameters
      case 'leave_balance':
      case 'last_day_off':
        // No parameters needed
        break;
    }

    return formatted;
  }
}

const chatbotServiceInstance = new ChatbotService();
export default chatbotServiceInstance;
