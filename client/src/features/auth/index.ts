/**
 * Auth Feature Module
 * 
 * Public API for authentication functionality including login, registration,
 * OTP verification, and password reset flows.
 * 
 * @module features/auth
 * 
 * @example
 * ```typescript
 * import { LoginForm, useAuth, useLogin } from '@/features/auth';
 * 
 * function MyComponent() {
 *   const { user, isAuthenticated } = useAuth();
 *   const { login, isLoading } = useLogin();
 *   // ...
 * }
 * ```
 */

// Components
export * from './components';

// Hooks
export * from './hooks';

// Types
export * from './types';
