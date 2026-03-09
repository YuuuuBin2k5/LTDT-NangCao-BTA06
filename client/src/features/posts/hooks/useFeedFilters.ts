/**
 * Hook for managing feed filter state
 */
import { useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { FilterConfig, FilterType } from '../types/filter.types';

const FILTERS_STORAGE_KEY = 'feed_filters';

export interface UseFeedFiltersReturn {
  filters: FilterConfig[];
  addFilter: (filter: FilterConfig) => void;
  removeFilter: (filterId: string) => void;
  clearFilters: () => void;
  toggleFilter: (filter: FilterConfig) => void;
  hasActiveFilters: boolean;
  filterCount: number;
  hasFilter: (filterId: string) => boolean;
}

export const useFeedFilters = (): UseFeedFiltersReturn => {
  const [filters, setFilters] = useState<FilterConfig[]>([]);

  // Load saved filters on mount
  useEffect(() => {
    loadSavedFilters();
  }, []);

  // Save filters when they change
  useEffect(() => {
    saveFilters();
  }, [filters]);

  const loadSavedFilters = async () => {
    try {
      const saved = await SecureStore.getItemAsync(FILTERS_STORAGE_KEY);
      if (saved) {
        setFilters(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load saved filters:', error);
      // Gracefully handle storage errors - just start with empty filters
    }
  };

  const saveFilters = async () => {
    try {
      await SecureStore.setItemAsync(FILTERS_STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Failed to save filters:', error);
      // Gracefully handle storage errors - filters will still work in memory
    }
  };

  const hasConflict = useCallback((newFilter: FilterConfig): boolean => {
    // Check for conflicts with existing filters
    for (const existingFilter of filters) {
      // Discovery mode conflicts with social filters
      if (
        (newFilter.type === FilterType.DISCOVERY && existingFilter.type === FilterType.SOCIAL) ||
        (newFilter.type === FilterType.SOCIAL && existingFilter.type === FilterType.DISCOVERY)
      ) {
        return true;
      }

      // Recommendation filters conflict with each other (can only have one)
      if (
        newFilter.type === FilterType.RECOMMENDATION &&
        existingFilter.type === FilterType.RECOMMENDATION
      ) {
        return true;
      }

      // Can't have multiple filters of same type and value
      if (existingFilter.type === newFilter.type && existingFilter.value === newFilter.value) {
        return true;
      }
    }
    return false;
  }, [filters]);

  const addFilter = useCallback((filter: FilterConfig) => {
    if (hasConflict(filter)) {
      console.warn('Filter conflict detected:', filter);
      return;
    }

    setFilters(prev => [...prev, filter]);
  }, [hasConflict]);

  const removeFilter = useCallback((filterId: string) => {
    setFilters(prev => prev.filter(f => f.id !== filterId));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const toggleFilter = useCallback((filter: FilterConfig) => {
    setFilters(prev => {
      const exists = prev.some(f => f.id === filter.id);
      if (exists) {
        return prev.filter(f => f.id !== filter.id);
      } else {
        if (hasConflict(filter)) {
          console.warn('Filter conflict detected:', filter);
          return prev;
        }
        return [...prev, filter];
      }
    });
  }, [hasConflict]);

  const hasFilter = useCallback((filterId: string): boolean => {
    return filters.some(f => f.id === filterId);
  }, [filters]);

  return {
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    toggleFilter,
    hasActiveFilters: filters.length > 0,
    filterCount: filters.length,
    hasFilter,
  };
};
