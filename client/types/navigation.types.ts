/**
 * Navigation type definitions for Expo Router
 * Defines route parameters for type-safe navigation
 */

/**
 * Auth stack route parameters
 */
export type AuthStackParamList = {
  login: undefined;
  register: undefined;
  'verify-otp': {
    email: string;
  };
  'forgot-password': undefined;
  'reset-password': {
    email: string;
  };
};
