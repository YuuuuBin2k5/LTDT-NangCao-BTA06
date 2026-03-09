/**
 * Property-based tests for useLocationSearch hook - Filter clear round-trip
 * Feature: place-search-filter, Property 8: Filter clear round-trip
 * Validates: Requirements 7.5
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as fc from 'fast-check';
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

describe('useLocationSearch - Filter Clear Round-Trip Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Mock successful search response
    (locationService.searchPlaces as jest.Mock).mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 20,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * Property 8: Filter clear round-trip
   * For any initial search state, applying filters then clearing all filters
   * should return results equivalent to the initial unfiltered state.
   */
  test('Property 8: Filter clear round-trip - applying then clearing filters returns to initial state', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random category filter (or null for no filter)
        fc.oneof(
          fc.constant(null),
          fc.constantFrom(
            PlaceCategory.RESTAURANT,
            PlaceCategory.HOTEL,
            PlaceCategory.PARK,
            PlaceCategory.MUSEUM,
            PlaceCategory.SHOPPING,
            PlaceCategory.ENTERTAINMENT,
            PlaceCategory.OTHER
          )
        ),
        // Generate random rating filter (0-5 in 0.5 increments)
        fc.integer({ min: 0, max: 10 }).map(n => n * 0.5),
        async (category, minRating) => {
          // Skip test case where filters are already at default values
          // (applying default filters doesn't trigger a new search)
          if (category === null && minRating === 0) {
            return; // This is a no-op case
          }

          jest.clearAllMocks();
          
          const { result } = renderHook(() => useLocationSearch());

          // Wait for initial mount search to complete
          act(() => {
            jest.advanceTimersByTime(500);
          });
          await waitFor(() => {
            expect(locationService.searchPlaces).toHaveBeenCalled();
          });

          // Capture initial API call parameters (unfiltered state)
          const initialCallArgs = (locationService.searchPlaces as jest.Mock).mock.calls[0][0];
          const initialCategory = initialCallArgs.category;
          const initialMinRating = initialCallArgs.minRating;
          
          jest.clearAllMocks();

          // Apply filters
          act(() => {
            result.current.updateFilters({
              category: category,
              minRating: minRating,
            });
          });

          // Wait for debounce and search to complete
          act(() => {
            jest.advanceTimersByTime(500);
          });
          await waitFor(() => {
            expect(locationService.searchPlaces).toHaveBeenCalled();
          });

          // Verify filters were applied
          const filteredCallArgs = (locationService.searchPlaces as jest.Mock).mock.calls[0][0];
          
          if (category !== null) {
            expect(filteredCallArgs.category).toBe(category);
          } else {
            expect(filteredCallArgs.category).toBeUndefined();
          }
          
          if (minRating > 0) {
            expect(filteredCallArgs.minRating).toBe(minRating);
          } else {
            expect(filteredCallArgs.minRating).toBeUndefined();
          }

          jest.clearAllMocks();

          // Clear all filters (return to initial state)
          act(() => {
            result.current.updateFilters({
              category: null,
              minRating: 0,
            });
          });

          // Wait for debounce and search to complete
          act(() => {
            jest.advanceTimersByTime(500);
          });
          await waitFor(() => {
            expect(locationService.searchPlaces).toHaveBeenCalled();
          });

          // Verify that cleared filters match initial state
          const clearedCallArgs = (locationService.searchPlaces as jest.Mock).mock.calls[0][0];
          
          // After clearing, category should be undefined (same as initial)
          expect(clearedCallArgs.category).toBe(initialCategory);
          
          // After clearing, minRating should be undefined (same as initial)
          expect(clearedCallArgs.minRating).toBe(initialMinRating);

          // Verify filter state in hook
          expect(result.current.filters.category).toBe(null);
          expect(result.current.filters.minRating).toBe(0);
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design doc
    );
  });

  test('Property 8: Filter clear round-trip - multiple filter applications and clears maintain consistency', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate array of filter states to apply (excluding default values)
        fc.array(
          fc.record({
            category: fc.oneof(
              fc.constant(null),
              fc.constantFrom(
                PlaceCategory.RESTAURANT,
                PlaceCategory.HOTEL,
                PlaceCategory.PARK,
                PlaceCategory.MUSEUM,
                PlaceCategory.SHOPPING,
                PlaceCategory.ENTERTAINMENT,
                PlaceCategory.OTHER
              )
            ),
            minRating: fc.integer({ min: 0, max: 10 }).map(n => n * 0.5),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (filterStates) => {
          // Filter out states that are all defaults (would not trigger search)
          const nonDefaultStates = filterStates.filter(
            state => state.category !== null || state.minRating > 0
          );

          // Skip if no non-default states
          if (nonDefaultStates.length === 0) {
            return;
          }

          jest.clearAllMocks();
          
          const { result } = renderHook(() => useLocationSearch());

          // Wait for initial mount search to complete
          act(() => {
            jest.advanceTimersByTime(500);
          });
          await waitFor(() => {
            expect(locationService.searchPlaces).toHaveBeenCalled();
          });

          // Capture initial state
          const initialCallArgs = (locationService.searchPlaces as jest.Mock).mock.calls[0][0];
          const initialCategory = initialCallArgs.category;
          const initialMinRating = initialCallArgs.minRating;

          // Apply each filter state, then clear
          for (const filterState of nonDefaultStates) {
            jest.clearAllMocks();

            // Apply filters
            act(() => {
              result.current.updateFilters(filterState);
            });

            act(() => {
              jest.advanceTimersByTime(500);
            });
            await waitFor(() => {
              expect(locationService.searchPlaces).toHaveBeenCalled();
            });

            jest.clearAllMocks();

            // Clear filters
            act(() => {
              result.current.updateFilters({
                category: null,
                minRating: 0,
              });
            });

            act(() => {
              jest.advanceTimersByTime(500);
            });
            await waitFor(() => {
              expect(locationService.searchPlaces).toHaveBeenCalled();
            });

            // Verify cleared state matches initial state
            const clearedCallArgs = (locationService.searchPlaces as jest.Mock).mock.calls[0][0];
            expect(clearedCallArgs.category).toBe(initialCategory);
            expect(clearedCallArgs.minRating).toBe(initialMinRating);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 8: Filter clear round-trip - partial filter clears maintain other filters', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          PlaceCategory.RESTAURANT,
          PlaceCategory.HOTEL,
          PlaceCategory.PARK,
          PlaceCategory.MUSEUM,
          PlaceCategory.SHOPPING,
          PlaceCategory.ENTERTAINMENT,
          PlaceCategory.OTHER
        ),
        fc.integer({ min: 1, max: 10 }).map(n => n * 0.5),
        async (category, minRating) => {
          jest.clearAllMocks();
          
          const { result } = renderHook(() => useLocationSearch());

          // Wait for initial mount search
          act(() => {
            jest.advanceTimersByTime(500);
          });
          await waitFor(() => {
            expect(locationService.searchPlaces).toHaveBeenCalled();
          });

          jest.clearAllMocks();

          // Apply both filters
          act(() => {
            result.current.updateFilters({
              category: category,
              minRating: minRating,
            });
          });

          act(() => {
            jest.advanceTimersByTime(500);
          });
          await waitFor(() => {
            expect(locationService.searchPlaces).toHaveBeenCalled();
          });

          jest.clearAllMocks();

          // Clear only category filter
          act(() => {
            result.current.updateFilters({
              category: null,
            });
          });

          act(() => {
            jest.advanceTimersByTime(500);
          });
          await waitFor(() => {
            expect(locationService.searchPlaces).toHaveBeenCalled();
          });

          // Verify category is cleared but rating remains
          const partialClearArgs = (locationService.searchPlaces as jest.Mock).mock.calls[0][0];
          expect(partialClearArgs.category).toBeUndefined();
          expect(partialClearArgs.minRating).toBe(minRating);
          expect(result.current.filters.category).toBe(null);
          expect(result.current.filters.minRating).toBe(minRating);

          jest.clearAllMocks();

          // Now clear rating filter too
          act(() => {
            result.current.updateFilters({
              minRating: 0,
            });
          });

          act(() => {
            jest.advanceTimersByTime(500);
          });
          await waitFor(() => {
            expect(locationService.searchPlaces).toHaveBeenCalled();
          });

          // Verify both filters are cleared
          const fullClearArgs = (locationService.searchPlaces as jest.Mock).mock.calls[0][0];
          expect(fullClearArgs.category).toBeUndefined();
          expect(fullClearArgs.minRating).toBeUndefined();
          expect(result.current.filters.category).toBe(null);
          expect(result.current.filters.minRating).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
