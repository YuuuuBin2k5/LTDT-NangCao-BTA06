/**
 * Formatting utilities for common data formatting needs
 */

/**
 * Formats a date to Vietnamese locale string
 * @param date - Date to format (Date object, timestamp, or ISO string)
 * @param format - Format type: 'short', 'long', 'time', 'datetime'
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | number | string,
  format: 'short' | 'long' | 'time' | 'datetime' = 'short'
): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const options: Intl.DateTimeFormatOptions = {};

  switch (format) {
    case 'short':
      // DD/MM/YYYY
      options.day = '2-digit';
      options.month = '2-digit';
      options.year = 'numeric';
      break;
    case 'long':
      // DD tháng MM, YYYY
      options.day = 'numeric';
      options.month = 'long';
      options.year = 'numeric';
      break;
    case 'time':
      // HH:MM
      options.hour = '2-digit';
      options.minute = '2-digit';
      break;
    case 'datetime':
      // DD/MM/YYYY HH:MM
      options.day = '2-digit';
      options.month = '2-digit';
      options.year = 'numeric';
      options.hour = '2-digit';
      options.minute = '2-digit';
      break;
  }

  return dateObj.toLocaleString('vi-VN', options);
};

/**
 * Formats a relative time (e.g., "2 giờ trước", "3 ngày trước")
 * @param date - Date to format
 * @returns Relative time string
 */
export const formatRelativeTime = (date: Date | number | string): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) {
    return 'Vừa xong';
  } else if (diffMin < 60) {
    return `${diffMin} phút trước`;
  } else if (diffHour < 24) {
    return `${diffHour} giờ trước`;
  } else if (diffDay < 7) {
    return `${diffDay} ngày trước`;
  } else if (diffWeek < 4) {
    return `${diffWeek} tuần trước`;
  } else if (diffMonth < 12) {
    return `${diffMonth} tháng trước`;
  } else {
    return `${diffYear} năm trước`;
  }
};

/**
 * Formats a number with thousand separators
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 */
export const formatNumber = (value: number, decimals: number = 0): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0';
  }

  return value.toLocaleString('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Formats a number as currency (VND)
 * @param value - Number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0 ₫';
  }

  return value.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
};

/**
 * Formats a distance in meters to human-readable format
 * @param meters - Distance in meters
 * @returns Formatted distance string (e.g., "500m", "1.5km")
 */
export const formatDistance = (meters: number): string => {
  if (typeof meters !== 'number' || isNaN(meters) || meters < 0) {
    return '0m';
  }

  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    const km = meters / 1000;
    return `${km.toFixed(1)}km`;
  }
};

/**
 * Truncates a string to a maximum length and adds ellipsis
 * @param text - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export const truncateString = (text: string, maxLength: number): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Capitalizes the first letter of a string
 * @param text - String to capitalize
 * @returns Capitalized string
 */
export const capitalizeFirst = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Converts a string to title case
 * @param text - String to convert
 * @returns Title case string
 */
export const toTitleCase = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .toLowerCase()
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
};

/**
 * Formats a phone number to Vietnamese format
 * @param phone - Phone number to format
 * @returns Formatted phone number (e.g., "0123 456 789")
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length
  if (cleaned.startsWith('84') && cleaned.length === 11) {
    // 84xxxxxxxxx -> +84 xxx xxx xxx
    return `+84 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    // 0xxxxxxxxx -> 0xxx xxx xxx
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  return phone;
};

/**
 * Removes all whitespace from a string
 * @param text - String to clean
 * @returns String without whitespace
 */
export const removeWhitespace = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text.replace(/\s/g, '');
};

/**
 * Normalizes whitespace in a string (removes extra spaces)
 * @param text - String to normalize
 * @returns Normalized string
 */
export const normalizeWhitespace = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text.trim().replace(/\s+/g, ' ');
};

/**
 * Formats a review timestamp according to requirements:
 * - Relative time for reviews < 30 days old (e.g., "2 hours ago")
 * - Absolute date for reviews >= 30 days old (e.g., "Jan 15, 2026")
 * Supports user locale and timezone automatically via browser/device settings
 * @param timestamp - ISO 8601 timestamp string or Date object
 * @param locale - Optional locale string (defaults to user's locale)
 * @returns Formatted timestamp string
 */
export const formatReviewTimestamp = (
  timestamp: string | Date,
  locale?: string
): string => {
  // Handle invalid timestamps gracefully
  try {
    const dateObj = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // For reviews less than 30 days old, use relative time
    if (diffDays < 30) {
      return formatRelativeTime(dateObj);
    }

    // For reviews 30 days or older, use absolute date format
    // Format: "Jan 15, 2026" (or localized equivalent)
    // Uses user's locale and timezone automatically
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };

    // Use provided locale or default to user's locale (undefined = browser/device default)
    return dateObj.toLocaleDateString(locale, options);
  } catch (error) {
    // Handle any unexpected errors gracefully
    return 'Invalid date';
  }
};
