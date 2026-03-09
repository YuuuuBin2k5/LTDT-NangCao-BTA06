/**
 * Retry utility for failed API calls
 */

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = true,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Calculate delay with exponential backoff
      const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
      
      console.log(`Retry attempt ${attempt}/${maxAttempts} after ${waitTime}ms`);
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
}

/**
 * Check if error is retryable (network errors, 5xx errors)
 */
export function isRetryableError(error: any): boolean {
  // Network errors
  if (error.message?.includes('Network request failed')) {
    return true;
  }

  // Timeout errors
  if (error.message?.includes('timeout')) {
    return true;
  }

  // 5xx server errors
  if (error.response?.status >= 500 && error.response?.status < 600) {
    return true;
  }

  // 429 Too Many Requests
  if (error.response?.status === 429) {
    return true;
  }

  return false;
}

/**
 * Retry only if error is retryable
 */
export async function retryIfRetryable<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  try {
    return await retryWithBackoff(fn, options);
  } catch (error) {
    if (isRetryableError(error)) {
      console.log('Retrying failed request...');
      return await retryWithBackoff(fn, options);
    }
    throw error;
  }
}
