import { AxiosError } from 'axios';
import {
  AppError,
  ApiError,
  AuthError,
  ValidationError,
  NetworkError,
} from '../types/error.types';

/**
 * Transform various error types into application-specific errors
 */
export function transformError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Axios error
  if (isAxiosError(error)) {
    return transformAxiosError(error);
  }

  // Standard Error
  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR', error);
  }

  // Unknown error type
  return new AppError(
    'Đã xảy ra lỗi không xác định',
    'UNKNOWN_ERROR',
    error
  );
}

/**
 * Transform Axios errors into ApiError or NetworkError
 */
function transformAxiosError(error: AxiosError): AppError {
  // Network error (no response)
  if (!error.response) {
    return new NetworkError(
      'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
      error
    );
  }

  // HTTP error with response
  const status = error.response.status;
  const data = error.response.data as any;
  const message = data?.message || error.message || 'Đã xảy ra lỗi';
  const code = data?.code || `HTTP_${status}`;

  // Map specific status codes to appropriate errors
  if (status === 401 || status === 403) {
    return new AuthError(message, error);
  }

  if (status === 400 && data?.field) {
    return new ValidationError(message, data.field, error);
  }

  return new ApiError(message, code, status, error);
}

/**
 * Type guard for AxiosError
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as any).isAxiosError === true
  );
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Đã xảy ra lỗi không xác định';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof NetworkError;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  return error instanceof AuthError;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  return error instanceof ValidationError;
}

/**
 * Extract error code from error
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof AppError) {
    return error.code;
  }
  return 'UNKNOWN_ERROR';
}

/**
 * Extract HTTP status from error if available
 */
export function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof ApiError) {
    return error.status;
  }
  return undefined;
}
