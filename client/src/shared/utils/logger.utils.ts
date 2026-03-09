import { AppError } from '../types/error.types';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Log entry structure
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: unknown;
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  includeTimestamp: boolean;
  includeStackTrace: boolean;
}

/**
 * Default logger configuration
 */
const defaultConfig: LoggerConfig = {
  enabled: __DEV__,
  minLevel: LogLevel.DEBUG,
  includeTimestamp: true,
  includeStackTrace: true,
};

/**
 * Logger class for application-wide logging
 */
class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Update logger configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: unknown, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: unknown
  ): void {
    if (!this.config.enabled) {
      return;
    }

    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.createLogEntry(level, message, context, error);
    this.output(entry);
  }

  /**
   * Check if log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(level);
    const minLevelIndex = levels.indexOf(this.config.minLevel);
    return currentLevelIndex >= minLevelIndex;
  }

  /**
   * Create log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: unknown
  ): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: this.config.includeTimestamp ? new Date().toISOString() : '',
    };

    if (context) {
      entry.context = this.sanitizeContext(context);
    }

    if (error) {
      entry.error = this.formatError(error);
    }

    return entry;
  }

  /**
   * Sanitize context to remove sensitive data
   */
  private sanitizeContext(context: Record<string, any>): Record<string, any> {
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'authorization'];
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(context)) {
      if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeContext(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Format error for logging
   */
  private formatError(error: unknown): any {
    if (error instanceof AppError) {
      return {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: this.config.includeStackTrace ? error.stack : undefined,
        originalError: error.originalError
          ? this.formatError(error.originalError)
          : undefined,
      };
    }

    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: this.config.includeStackTrace ? error.stack : undefined,
      };
    }

    return error;
  }

  /**
   * Output log entry to console
   */
  private output(entry: LogEntry): void {
    const prefix = entry.timestamp
      ? `[${entry.timestamp}] [${entry.level}]`
      : `[${entry.level}]`;

    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.context, entry.error);
        break;
      case LogLevel.INFO:
        console.info(message, entry.context, entry.error);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.context, entry.error);
        break;
      case LogLevel.ERROR:
        console.error(message, entry.context, entry.error);
        break;
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const logDebug = (message: string, context?: Record<string, any>) =>
  logger.debug(message, context);

export const logInfo = (message: string, context?: Record<string, any>) =>
  logger.info(message, context);

export const logWarn = (message: string, context?: Record<string, any>) =>
  logger.warn(message, context);

export const logError = (
  message: string,
  error?: unknown,
  context?: Record<string, any>
) => logger.error(message, error, context);
