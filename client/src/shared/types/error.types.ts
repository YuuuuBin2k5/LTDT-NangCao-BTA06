/**
 * Error type hierarchy
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export class ApiError extends AppError {
  constructor(
    message: string,
    code: string,
    public status: number,
    originalError?: unknown
  ) {
    super(message, code, originalError);
    this.name = 'ApiError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'AUTH_ERROR', originalError);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public field?: string,
    originalError?: unknown
  ) {
    super(message, 'VALIDATION_ERROR', originalError);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'NETWORK_ERROR', originalError);
    this.name = 'NetworkError';
  }
}
