import { useAuth as useAuthContext } from '../../../store/contexts';

/**
 * Custom hook for accessing auth context
 * Provides access to authentication state and methods
 */
export function useAuth() {
  return useAuthContext();
}
