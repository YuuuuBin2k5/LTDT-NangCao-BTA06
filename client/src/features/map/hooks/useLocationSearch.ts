import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios, { CancelTokenSource } from 'axios';
import {
  locationService,
  Place,
  PlaceCategory,
  SearchPlacesParams,
} from '../../../services/location/location.service';
import { AppError } from '../../../shared/types/error.types';

/**
 * Search filters interface
 */
export interface SearchFilters {
  category: PlaceCategory | null;
  minRating: number;
  hasPost: boolean;
}

/**
 * Pagination state interface
 */
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasMore: boolean;
}

/**
 * Hook return type
 */
export interface UseLocationSearchReturn {
  places: Place[];
  isLoading: boolean;
  error: Error | null;
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
  filters: SearchFilters;
  updateFilters: (filters: Partial<SearchFilters>) => void;
  loadMore: () => void;
  hasMore: boolean;
  refresh: () => void;
  pagination: PaginationState;
}

/**
 * Default pagination values
 */
const DEFAULT_PAGE_SIZE = 20;
const DEBOUNCE_DELAY = 500;

/**
 * Custom hook for managing location search state and operations
 * Handles search keyword, filters, pagination, and debouncing
 */
export const useLocationSearch = (): UseLocationSearchReturn => {
  // State management
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchKeyword, setSearchKeywordState] = useState<string>('');
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('');
  const [filters, setFilters] = useState<SearchFilters>({
    category: null,
    minRating: 0,
    hasPost: false,
  });
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages: 0,
    totalElements: 0,
    hasMore: false,
  });

  // Refs for managing async operations
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelTokenRef = useRef<CancelTokenSource | null>(null);
  const isLoadingMoreRef = useRef<boolean>(false);

  /**
   * Debounce search keyword changes
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

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchKeyword]);

  /**
   * Perform search with current parameters
   */
  const performSearch = useCallback(
    async (page: number = 0, append: boolean = false) => {
      try {
        // Cancel previous request if exists
        if (cancelTokenRef.current) {
          cancelTokenRef.current.cancel('New search initiated');
        }

        // Create new cancel token
        cancelTokenRef.current = axios.CancelToken.source();

        // Set loading state
        setIsLoading(true);
        setError(null);

        // Build search parameters
        const params: SearchPlacesParams = {
          page,
          size: DEFAULT_PAGE_SIZE,
        };

        if (debouncedKeyword.trim() !== '') {
          params.keyword = debouncedKeyword.trim();
        }

        if (filters.category !== null) {
          params.category = filters.category;
        }

        if (filters.minRating > 0) {
          params.minRating = filters.minRating;
        }

        if (filters.hasPost) {
          params.hasPost = true;
        }

        // Execute search
        const response = await locationService.searchPlaces(
          params,
          cancelTokenRef.current
        );

        // Update places - append or replace based on mode
        if (append) {
          setPlaces((prevPlaces) => [...prevPlaces, ...response.content]);
        } else {
          setPlaces(response.content);
        }

        // Update pagination state
        setPagination({
          currentPage: response.currentPage,
          pageSize: response.pageSize,
          totalPages: response.totalPages,
          totalElements: response.totalElements,
          hasMore: response.currentPage < response.totalPages - 1,
        });

        // Clear error on success
        setError(null);
      } catch (err: any) {
        // Don't set error for cancelled requests
        if (!axios.isCancel(err)) {
          console.error('Search failed:', err);
          setError(
            err instanceof AppError
              ? err
              : new Error('Failed to search places')
          );
        }
      } finally {
        setIsLoading(false);
        isLoadingMoreRef.current = false;
      }
    },
    [debouncedKeyword, filters]
  );

  /**
   * Trigger search when debounced keyword or filters change
   */
  useEffect(() => {
    // Reset to first page when search parameters change
    performSearch(0, false);
  }, [debouncedKeyword, filters.category, filters.minRating, filters.hasPost]);

  /**
   * Set search keyword with debouncing
   */
  const setSearchKeyword = useCallback((keyword: string) => {
    setSearchKeywordState(keyword);
  }, []);

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }));
  }, []);

  /**
   * Load more results (infinite scroll)
   */
  const loadMore = useCallback(() => {
    // Prevent multiple simultaneous load more calls
    if (
      isLoadingMoreRef.current ||
      isLoading ||
      !pagination.hasMore
    ) {
      return;
    }

    isLoadingMoreRef.current = true;
    const nextPage = pagination.currentPage + 1;
    performSearch(nextPage, true);
  }, [isLoading, pagination.hasMore, pagination.currentPage, performSearch]);

  /**
   * Refresh results (reload from first page)
   */
  const refresh = useCallback(() => {
    performSearch(0, false);
  }, [performSearch]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Cancel any pending requests
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /**
   * Memoized places array to prevent unnecessary re-renders
   * Only changes when the actual places data changes
   */
  const memoizedPlaces = useMemo(() => places, [places]);

  /**
   * Memoized filters object to prevent unnecessary re-renders
   */
  const memoizedFilters = useMemo(() => filters, [filters.category, filters.minRating, filters.hasPost]);

  /**
   * Memoized pagination object to prevent unnecessary re-renders
   */
  const memoizedPagination = useMemo(() => pagination, [
    pagination.currentPage,
    pagination.pageSize,
    pagination.totalPages,
    pagination.totalElements,
    pagination.hasMore,
  ]);

  return {
    places: memoizedPlaces,
    isLoading,
    error,
    searchKeyword,
    setSearchKeyword,
    filters: memoizedFilters,
    updateFilters,
    loadMore,
    hasMore: pagination.hasMore,
    refresh,
    pagination: memoizedPagination,
  };
};
