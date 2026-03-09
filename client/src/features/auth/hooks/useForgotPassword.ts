import { useState } from 'react';
import { apiClient } from '../../../services/api/client';

interface UseForgotPasswordResult {
  sendOTP: (email: string) => Promise<void>;
  resetPassword: (data: { email: string; otpCode: string; newPassword: string }) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for forgot password functionality
 * Handles password reset flow
 */
export function useForgotPassword(): UseForgotPasswordResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOTP = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apiClient.post('/auth/forgot-password', { email });
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể gửi mã OTP';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: { email: string; otpCode: string; newPassword: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apiClient.post('/auth/reset-password', data);
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể đặt lại mật khẩu';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendOTP,
    resetPassword,
    isLoading,
    error,
  };
}
