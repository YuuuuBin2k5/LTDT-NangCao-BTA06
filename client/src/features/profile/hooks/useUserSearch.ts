import { useState, useEffect, useCallback, useRef } from 'react';
import { friendshipService } from '../../../services/friendship/friendship.service';
import { UserSearchResult } from '../../../shared/types/friendship.types';
import { AppError } from '../../../shared/types/error.types';

/**
 * Hook return type
 */
export interface UseUserSearchReturn {
  users: UserSearchResult[];
  isLoading: boolean;
  error: Error | null;
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
  refresh: () => void;
}

/**
 * Debounce delay in milliseconds
 */
const DEBOUNCE_DELAY = 500;

/**
 * Custom hook for managing user search state and operations
 * Handles search keyword with debouncing and request cancellation
 * 
 * @returns UseUserSearchReturn Hook state and methods
 */
export const useUserSearch = (): UseUserSearchReturn => {
  // State management
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchKeyword, setSearchKeywordState] = useState<string>('');
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('');

  // Refs for managing async operations
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Debounce search keyword changes
   * Implements 500ms delay before updating debounced keyword
   */
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, DEBOUNCE_DELAY);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchKeyword]);

  /**
   * Perform user search with current keyword
   */
  const performSearch = useCallback(async (keyword: string) => {
    try {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear results if keyword is empty
      if (keyword.trim() === '') {
        setUsers([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      // Set loading state
      setIsLoading(true);
      setError(null);

      // Execute search
      const results = await friendshipService.searchUsers(keyword.trim());

      // Update users with results
      setUsers(results);
      setError(null);
    } catch (err: any) {
      // Don't set error for aborted requests
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        console.error('User search failed:', err);
        setError(
          err instanceof AppError
            ? err
            : new Error('Failed to search users')
        );
        setUsers([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Trigger search when debounced keyword changes
   */
  useEffect(() => {
    performSearch(debouncedKeyword);
  }, [debouncedKeyword, performSearch]);

  /**
   * Set search keyword (will be debounced)
   */
  const setSearchKeyword = useCallback((keyword: string) => {
    setSearchKeywordState(keyword);
  }, []);

  /**
   * Refresh search results with current keyword
   */
  const refresh = useCallback(() => {
    performSearch(debouncedKeyword);
  }, [debouncedKeyword, performSearch]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    users,
    isLoading,
    error,
    searchKeyword,
    setSearchKeyword,
    refresh,
  };
};
