/**
 * API-related constants
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Base API URL
 * Automatically detects the Expo development server IP
 */
const getApiBaseUrl = () => {
  // If running on web, use localhost or relative path
  if (Platform.OS === 'web') {
    return 'http://localhost:8080/api';
  }

  // Get the IP address from Expo Constants
  // This works well when developing with Expo Go on a physical device
  const hostUri = Constants.expoConfig?.hostUri;
  
  if (hostUri) {
    // hostUri usually looks like "192.168.1.5:8081" (expo port)
    const ipAddress = hostUri.split(':')[0];
    return `http://${ipAddress}:8080/api`;
  }

  // Fallback for production or builds
  return 'http://192.168.1.5:8080/api';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * API timeout in milliseconds
 */
export const API_TIMEOUT = 30000;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
  },
  
  // Location endpoints
  LOCATION: {
    UPDATE: '/location/update',
    GET_CURRENT: '/location/current',
    GET_NEARBY: '/location/nearby',
  },
  
  // User endpoints
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile/update',
    AVATAR: '/user/avatar',
  },
  
  // Chat endpoints
  CHAT: {
    MESSAGES: '/chat/messages',
    SEND: '/chat/send',
    ROOMS: '/chat/rooms',
  },
  
  // Friends endpoints
  FRIENDS: {
    LIST: '/friends',
    REQUESTS: '/friends/requests',
    ADD: '/friends/add',
    REMOVE: '/friends/remove',
    ACCEPT: '/friends/accept',
    REJECT: '/friends/reject',
  },
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * API error codes
 */
export const API_ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_EXISTS: 'USER_EXISTS',
  INVALID_OTP: 'INVALID_OTP',
  OTP_EXPIRED: 'OTP_EXPIRED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;
