import { useState } from 'react';
import { authService } from '../../../services/auth';

interface UseOTPResult {
  verifyOTP: (otpCode: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  isVerifying: boolean;
  isResending: boolean;
  error: string | null;
}

/**
 * Custom hook for OTP functionality
 * Handles OTP verification and resend operations
 */
export function useOTP(): UseOTPResult {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyOTP = async (otpCode: string) => {
    setIsVerifying(true);
    setError(null);
    
    try {
      await authService.verifyOTP(otpCode);
    } catch (err: any) {
      const errorMessage = err.message || 'Mã OTP không hợp lệ';
      setError(errorMessage);
      throw err;
    } finally {
      setIsVerifying(false);
    }
  };

  const resendOTP = async (email: string) => {
    setIsResending(true);
    setError(null);
    
    try {
      await authService.resendOTP(email);
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể gửi lại mã OTP';
      setError(errorMessage);
      throw err;
    } finally {
      setIsResending(false);
    }
  };

  return {
    verifyOTP,
    resendOTP,
    isVerifying,
    isResending,
    error,
  };
}
