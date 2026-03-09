/**
 * Validation utilities for common input validation
 */

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns true if email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * 
 * @param password - Password to validate
 * @returns true if password meets requirements, false otherwise
 */
export const isValidPassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') {
    return false;
  }

  // Check minimum length
  if (password.length < 8) {
    return false;
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return false;
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return false;
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return false;
  }

  return true;
};

/**
 * Gets password validation errors
 * @param password - Password to validate
 * @returns Array of error messages, empty if valid
 */
export const getPasswordErrors = (password: string): string[] => {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    errors.push('Mật khẩu không được để trống');
    return errors;
  }

  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất một chữ hoa');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất một chữ thường');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất một chữ số');
  }

  return errors;
};

/**
 * Validates phone number format (Vietnamese format)
 * Supports formats:
 * - 0xxxxxxxxx (10 digits starting with 0)
 * - +84xxxxxxxxx (12 digits starting with +84)
 * - 84xxxxxxxxx (11 digits starting with 84)
 * 
 * @param phone - Phone number to validate
 * @returns true if phone number is valid, false otherwise
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, '');

  // Vietnamese phone number patterns
  const patterns = [
    /^0[0-9]{9}$/,        // 0xxxxxxxxx (10 digits)
    /^\+84[0-9]{9}$/,     // +84xxxxxxxxx (12 chars)
    /^84[0-9]{9}$/,       // 84xxxxxxxxx (11 digits)
  ];

  return patterns.some(pattern => pattern.test(cleanPhone));
};

/**
 * Validates username format
 * Requirements:
 * - 3-20 characters
 * - Only alphanumeric characters, underscores, and hyphens
 * - Must start with a letter
 * 
 * @param username - Username to validate
 * @returns true if username is valid, false otherwise
 */
export const isValidUsername = (username: string): boolean => {
  if (!username || typeof username !== 'string') {
    return false;
  }

  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_-]{2,19}$/;
  return usernameRegex.test(username);
};

/**
 * Validates that a string is not empty or only whitespace
 * @param value - String to validate
 * @returns true if string has content, false otherwise
 */
export const isNotEmpty = (value: string): boolean => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Validates string length is within range
 * @param value - String to validate
 * @param min - Minimum length (inclusive)
 * @param max - Maximum length (inclusive)
 * @returns true if length is within range, false otherwise
 */
export const isValidLength = (value: string, min: number, max: number): boolean => {
  if (!value || typeof value !== 'string') {
    return false;
  }
  const length = value.trim().length;
  return length >= min && length <= max;
};
