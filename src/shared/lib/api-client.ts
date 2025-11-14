import axios from 'axios';
import { navigateTo } from './navigation';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 30000, // Increased to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Use Next.js navigation instead of hard redirect
        navigateTo('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
