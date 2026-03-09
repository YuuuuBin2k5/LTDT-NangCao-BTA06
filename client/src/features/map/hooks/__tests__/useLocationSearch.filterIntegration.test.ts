/**
 * Integration tests for filter functionality
 * Tests the complete filter workflow including:
 * - Applying filters triggers new search
 * - Clearing filters resets to initial state
 * - Filter state is properly managed
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useLocationSearch } from '../useLocationSearch';
import { locationService, PlaceCategory } from '../../../../services/location/location.service';

// Mock the location service
jest.mock('../../../../services/location/location.service', () => ({
  locationService: {
    searchPlaces: jest.fn(),
  },
  PlaceCategory: {
    RESTAURANT: 'RESTAURANT',
    HOTEL: 'HOTEL',
    PARK: 'PARK',
    MUSEUM: 'MUSEUM',
    SHOPPING: 'SHOPPING',
    ENTERTAINMENT: 'ENTERTAINMENT',
    OTHER: 'OTHER',
  },
}));

describe('useLocationSearch - Filter Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should trigger new search when category filter is applied', async () => {
    const mockResponse = {
      content: [
        {
          id: 1,
          name: 'Restaurant 1',
          description: 'A nice restaurant',
          latitude: 10.0,
          longitude: 20.0,
          averageRating: 4.5,
          category: PlaceCategory.RESTAURANT,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20,
    };

    (locationService.searchPlaces as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLocationSearch());

    // Wait for initial search
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Apply category filter
    act(() => {
      result.current.updateFilters({ category: PlaceCategory.RESTAURANT });
    });

    // Wait for debounce and search
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(locationService.searchPlaces).toHaveBeenCalledWith(
        expect.objectContaining({
          category: PlaceCategory.RESTAURANT,
        }),
        expect.anything()
      );
    });

    expect(result.current.filters.category).toBe(PlaceCategory.RESTAURANT);
  });

  it('should trigger new search when rating filter is applied', async () => {
    const mockResponse = {
      content: [
        {
          id: 1,
          name: 'High Rated Place',
          description: 'A highly rated place',
          latitude: 10.0,
          longitude: 20.0,
          averageRating: 4.5,
          category: PlaceCategory.RESTAURANT,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20,
    };

    (locationService.searchPlaces as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLocationSearch());

    // Wait for initial search
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Apply rating filter
    act(() => {
      result.current.updateFilters({ minRating: 4.0 });
    });

    // Wait for search
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(locationService.searchPlaces).toHaveBeenCalledWith(
        expect.objectContaining({
          minRating: 4.0,
        }),
        expect.anything()
      );
    });

    expect(result.current.filters.minRating).toBe(4.0);
  });

  it('should clear filters and return to initial state', async () => {
    const mockResponse = {
      content: [
        {
          id: 1,
          name: 'Place 1',
          description: 'A place',
          latitude: 10.0,
          longitude: 20.0,
          averageRating: 3.0,
          category: PlaceCategory.PARK,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20,
    };

    (locationService.searchPlaces as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLocationSearch());

    // Wait for initial search
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Apply filters
    act(() => {
      result.current.updateFilters({
        category: PlaceCategory.RESTAURANT,
        minRating: 4.0,
      });
    });

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.filters.category).toBe(PlaceCategory.RESTAURANT);
      expect(result.current.filters.minRating).toBe(4.0);
    });

    // Clear filters
    act(() => {
      result.current.updateFilters({
        category: null,
        minRating: 0,
      });
    });

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.filters.category).toBe(null);
      expect(result.current.filters.minRating).toBe(0);
    });

    // Verify search was called without filters
    await waitFor(() => {
      expect(locationService.searchPlaces).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 0,
          size: 20,
        }),
        expect.anything()
      );
    });
  });

  it('should apply both category and rating filters together', async () => {
    const mockResponse = {
      content: [
        {
          id: 1,
          name: 'Filtered Place',
          description: 'A filtered place',
          latitude: 10.0,
          longitude: 20.0,
          averageRating: 4.5,
          category: PlaceCategory.RESTAURANT,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20,
    };

    (locationService.searchPlaces as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLocationSearch());

    // Wait for initial search
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Apply both filters
    act(() => {
      result.current.updateFilters({
        category: PlaceCategory.RESTAURANT,
        minRating: 4.0,
      });
    });

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(locationService.searchPlaces).toHaveBeenCalledWith(
        expect.objectContaining({
          category: PlaceCategory.RESTAURANT,
          minRating: 4.0,
        }),
        expect.anything()
      );
    });

    expect(result.current.filters.category).toBe(PlaceCategory.RESTAURANT);
    expect(result.current.filters.minRating).toBe(4.0);
  });

  it('should reset to page 0 when filters change', async () => {
    const mockResponse = {
      content: [
        {
          id: 1,
          name: 'Place 1',
          description: 'A place',
          latitude: 10.0,
          longitude: 20.0,
          averageRating: 3.0,
          category: PlaceCategory.PARK,
        },
      ],
      totalElements: 50,
      totalPages: 3,
      currentPage: 0,
      pageSize: 20,
    };

    (locationService.searchPlaces as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLocationSearch());

    // Wait for initial search
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Load more to go to page 1
    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.pagination.currentPage).toBe(0);
    });

    // Apply filter - should reset to page 0
    act(() => {
      result.current.updateFilters({ category: PlaceCategory.RESTAURANT });
    });

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(locationService.searchPlaces).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 0,
          category: PlaceCategory.RESTAURANT,
        }),
        expect.anything()
      );
    });
  });
});
