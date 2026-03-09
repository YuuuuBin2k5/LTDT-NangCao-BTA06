/**
 * Property-based tests for useLocationSearch hook - Loading state consistency
 * Feature: place-search-filter, Property 9: Loading state consistency
 * Validates: Requirements 1.5, 7.1
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as fc from 'fast-check';
import { useLocationSearch } from '../useLocationSearch';
import { locationService } from '../../../../services/location/location.service';
import { PlaceCategory } from '../../../../services/location/location.service';

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

describe('useLocationSearch - Loading State Consistency Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * Property 9: Loading state consistency
   * For any API call, the loading state should be true when the request starts
   * and false when the response is received (success or error).
   */
  test('Property 9: Loading state consistency - successful API calls', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.record({
          content: fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              name: fc.string({ minLength: 1, maxLength: 50 }),
              description: fc.string({ minLength: 0, maxLength: 200 }),
              latitude: fc.double({ min: -90, max: 90 }),
              longitude: fc.double({ min: -180, max: 180 }),
              averageRating: fc.double({ min: 0, max: 5 }),
              category: fc.constantFrom(
                'RESTAURANT',
                'HOTEL',
                'PARK',
                'MUSEUM',
                'SHOPPING',
                'ENTERTAINMENT',
                'OTHER'
              ),
            }),
            { maxLength: 20 }
          ),
          totalElements: fc.integer({ min: 0, max: 1000 }),
          totalPages: fc.integer({ min: 0, max: 50 }),
          currentPage: fc.integer({ min: 0, max: 49 }),
          pageSize: fc.constant(20),
        }),
        async (keyword, mockResponse) => {
          jest.clearAllMocks();

          // Mock successful response with delay
          (locationService.searchPlaces as jest.Mock).mockImplementation(
            () =>
              new Promise((resolve) => {
                setTimeout(() => resolve(mockResponse), 100);
              })
          );

          const { result } = renderHook(() => useLocationSearch());

          // Hook starts loading immediately on mount
          expect(result.current.isLoading).toBe(true);

          // Advance timers to trigger initial debounce
          act(() => {
            jest.advanceTimersByTime(500);
          });

          // Wait for initial load to complete
          await waitFor(() => {
            expect(result.current.isLoading).toBe(true);
          });

          act(() => {
            jest.advanceTimersByTime(100);
          });

          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          // Now test with a new keyword
          act(() => {
            result.current.setSearchKeyword(keyword);
          });

          // Advance timers to trigger debounce
          act(() => {
            jest.advanceTimersByTime(500);
          });

          // After debounce, loading should be true
          await waitFor(() => {
            expect(result.current.isLoading).toBe(true);
          });

          // Advance timers to complete the API call
          act(() => {
            jest.advanceTimersByTime(100);
          });

          // After API call completes, loading should be false
          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          // Error should be null on success
          expect(result.current.error).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 9: Loading state consistency - failed API calls', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        async (keyword, errorMessage) => {
          jest.clearAllMocks();

          // Mock failed response with delay
          (locationService.searchPlaces as jest.Mock).mockImplementation(
            () =>
              new Promise((_, reject) => {
                setTimeout(() => reject(new Error(errorMessage)), 100);
              })
          );

          const { result } = renderHook(() => useLocationSearch());

          // Hook starts loading immediately on mount
          expect(result.current.isLoading).toBe(true);

          // Advance timers for initial mount
          act(() => {
            jest.advanceTimersByTime(600);
          });

          // Wait for initial load to complete
          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          // Now test with a new keyword
          act(() => {
            result.current.setSearchKeyword(keyword);
          });

          // Advance timers to trigger debounce
          act(() => {
            jest.advanceTimersByTime(500);
          });

          // After debounce, loading should be true
          await waitFor(() => {
            expect(result.current.isLoading).toBe(true);
          });

          // Advance timers to complete the API call
          act(() => {
            jest.advanceTimersByTime(100);
          });

          // After API call fails, loading should be false
          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          // Error should be set on failure
          expect(result.current.error).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 9: Loading state consistency - refresh operation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          content: fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              name: fc.string({ minLength: 1, maxLength: 50 }),
              description: fc.string({ minLength: 0, maxLength: 200 }),
              latitude: fc.double({ min: -90, max: 90 }),
              longitude: fc.double({ min: -180, max: 180 }),
              averageRating: fc.double({ min: 0, max: 5 }),
              category: fc.constantFrom(
                'RESTAURANT',
                'HOTEL',
                'PARK',
                'MUSEUM',
                'SHOPPING',
                'ENTERTAINMENT',
                'OTHER'
              ),
            }),
            { maxLength: 20 }
          ),
          totalElements: fc.integer({ min: 0, max: 1000 }),
          totalPages: fc.integer({ min: 0, max: 50 }),
          currentPage: fc.integer({ min: 0, max: 49 }),
          pageSize: fc.constant(20),
        }),
        async (mockResponse) => {
          jest.clearAllMocks();

          // Mock successful response
          (locationService.searchPlaces as jest.Mock).mockImplementation(
            () =>
              new Promise((resolve) => {
                setTimeout(() => resolve(mockResponse), 100);
              })
          );

          const { result } = renderHook(() => useLocationSearch());

          // Wait for initial load to complete
          act(() => {
            jest.advanceTimersByTime(600);
          });

          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          // Call refresh
          act(() => {
            result.current.refresh();
          });

          // Loading should be true immediately after refresh
          await waitFor(() => {
            expect(result.current.isLoading).toBe(true);
          });

          // Advance timers to complete the API call
          act(() => {
            jest.advanceTimersByTime(100);
          });

          // After refresh completes, loading should be false
          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 9: Loading state consistency - loadMore operation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          content: fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              name: fc.string({ minLength: 1, maxLength: 50 }),
              description: fc.string({ minLength: 0, maxLength: 200 }),
              latitude: fc.double({ min: -90, max: 90 }),
              longitude: fc.double({ min: -180, max: 180 }),
              averageRating: fc.double({ min: 0, max: 5 }),
              category: fc.constantFrom(
                'RESTAURANT',
                'HOTEL',
                'PARK',
                'MUSEUM',
                'SHOPPING',
                'ENTERTAINMENT',
                'OTHER'
              ),
            }),
            { minLength: 1, maxLength: 20 }
          ),
          totalElements: fc.integer({ min: 21, max: 1000 }),
          totalPages: fc.integer({ min: 2, max: 50 }),
          currentPage: fc.constant(0),
          pageSize: fc.constant(20),
        }),
        async (mockResponse) => {
          jest.clearAllMocks();

          // Mock successful response with hasMore = true
          const responseWithMore = {
            ...mockResponse,
            currentPage: 0,
            totalPages: 2,
          };

          (locationService.searchPlaces as jest.Mock).mockImplementation(
            () =>
              new Promise((resolve) => {
                setTimeout(() => resolve(responseWithMore), 100);
              })
          );

          const { result } = renderHook(() => useLocationSearch());

          // Wait for initial load
          act(() => {
            jest.advanceTimersByTime(600);
          });

          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(result.current.hasMore).toBe(true);
          });

          // Call loadMore
          act(() => {
            result.current.loadMore();
          });

          // Loading should be true after loadMore
          await waitFor(() => {
            expect(result.current.isLoading).toBe(true);
          });

          // Advance timers to complete the API call
          act(() => {
            jest.advanceTimersByTime(100);
          });

          // After loadMore completes, loading should be false
          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
