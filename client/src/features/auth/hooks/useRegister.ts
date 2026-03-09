import { useState } from 'react';
import { authService } from '../../../services/auth';
import { RegisterData } from '../types';

interface UseRegisterResult {
  register: (data: RegisterData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for registration functionality
 * Handles registration state and error management
 */
export function useRegister(): UseRegisterResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.register(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Đăng ký thất bại';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    isLoading,
    error,
  };
}
