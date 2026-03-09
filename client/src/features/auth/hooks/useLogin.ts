import { useState } from 'react';
import { useAuth } from './useAuth';
import { LoginCredentials } from '../types';

interface UseLoginResult {
  login: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for login functionality
 * Handles login state and error management
 */
export function useLogin(): UseLoginResult {
  const { login: authLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authLogin(credentials);
    } catch (err: any) {
      const errorMessage = err.message || 'Sai tài khoản hoặc mật khẩu';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
    error,
  };
}
