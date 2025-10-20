// src/shared/service/authService.ts

import apiClient from '@/shared/lib/api-client';

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

interface VerifyOTPResponse {
  success: boolean;
  message: string;
  valid: boolean;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

interface FirstLoginResetResponse {
  success: boolean;
  message: string;
}

const authService = {
  /**
   * Request password reset OTP
   * POST /api/auth/forgot-password
   */
  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Verify OTP (without resetting password)
   * This calls the resetPassword endpoint but doesn't actually change password
   * Just validates OTP
   */
  verifyOTP: async (email: string, otp: string): Promise<VerifyOTPResponse> => {
    try {
      // We'll call a backend verification endpoint
      // For now, we can use the reset password endpoint with a dummy check
      const response = await apiClient.post('/auth/verify-otp', {
        email,
        otp,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset password with OTP
   * POST /api/auth/reset-password
   */
  resetPassword: async (
    email: string,
    otp: string,
    newPassword: string
  ): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post('/auth/reset-password', {
      email,
      otp,
      newPassword,
    });
    return response.data;
  },

  /**
   * Reset password on the first login
   * POST /api/auth/first-login-reset
   */

  firstLoginPasswordReset: async (
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<FirstLoginResetResponse> => {
    const response = await apiClient.post('/auth/first-login-reset', {
      userId,
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

export default authService;
