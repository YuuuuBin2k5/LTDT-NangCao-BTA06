/**
 * Property-based tests for useLocationSearch hook - Debounce timing
 * Feature: place-search-filter, Property 10: Debounce timing
 * Validates: Requirements 1.4
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as fc from 'fast-check';
import { useLocationSearch } from '../useLocationSearch';
import { locationService } from '../../../../services/location/location.service';

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

describe('useLocationSearch - Debounce Timing Property Tests', () => {
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
   * Property 10: Debounce timing
   * For any sequence of rapid input changes within 500ms,
   * only the final value should trigger an API request after the debounce period.
   */
  test('Property 10: Debounce timing - rapid input changes within 500ms should only trigger one API call', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate an array of 2-10 search keywords
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 10 }),
        // Generate delays between inputs (all less than 500ms)
        fc.array(fc.integer({ min: 10, max: 400 }), { minLength: 1, maxLength: 9 }),
        async (keywords, delays) => {
          // Reset mocks for this iteration
          jest.clearAllMocks();
          
          const { result } = renderHook(() => useLocationSearch());

          // Wait for initial mount search to complete and clear mocks
          act(() => {
            jest.advanceTimersByTime(500);
          });
          await waitFor(() => {
            expect(locationService.searchPlaces).toHaveBeenCalled();
          });
          jest.clearAllMocks();

          // Now simulate rapid input changes
          for (let i = 0; i < keywords.length; i++) {
            act(() => {
              result.current.setSearchKeyword(keywords[i]);
            });

            // Advance time by the delay (but not enough to trigger debounce)
            if (i < delays.length) {
              act(() => {
                jest.advanceTimersByTime(delays[i]);
              });
            }
          }

          // At this point, no API call should have been made yet
          // because we haven't waited the full 500ms after the last input
          expect(locationService.searchPlaces).not.toHaveBeenCalled();

          // Now advance time by 500ms to trigger the debounce
          act(() => {
            jest.advanceTimersByTime(500);
          });

          // Wait for the async operation to complete
          await waitFor(() => {
            expect(locationService.searchPlaces).toHaveBeenCalled();
          });

          // Verify that only ONE API call was made (for the final keyword)
          expect(locationService.searchPlaces).toHaveBeenCalledTimes(1);

          // Verify that the API was called with the last keyword
          const lastKeyword = keywords[keywords.length - 1];
          const callArgs = (locationService.searchPlaces as jest.Mock).mock.calls[0][0];
          
          if (lastKeyword.trim() !== '') {
            expect(callArgs.keyword).toBe(lastKeyword.trim());
          } else {
            expect(callArgs.keyword).toBeUndefined();
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design doc
    );
  });

  test('Property 10: Debounce timing - input followed by 500ms+ delay should trigger API call', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.integer({ min: 500, max: 1000 }),
        async (keyword, delay) => {
          jest.clearAllMocks();
          
          const { result } = renderHook(() => useLocationSearch());

          // Wait for initial mount search and clear mocks
          act(() => {
            jest.advanceTimersByTime(500);
          });
          await waitFor(() => {
            expect(locationService.searchPlaces).toHaveBeenCalled();
          });
          jest.clearAllMocks();

          // Set search keyword
          act(() => {
            result.current.setSearchKeyword(keyword);
          });

          // Advance time by the delay (>= 500ms)
          act(() => {
            jest.advanceTimersByTime(delay);
          });

          // Wait for the async operation
          await waitFor(() => {
            expect(locationService.searchPlaces).toHaveBeenCalled();
          });

          // Verify API was called exactly once (after initial mount)
          expect(locationService.searchPlaces).toHaveBeenCalledTimes(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: Debounce timing - multiple sequences with proper delays should trigger multiple calls', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 5 }),
        async (keywords) => {
          jest.clearAllMocks();
          
          const { result } = renderHook(() => useLocationSearch());

          // Wait for initial mount search and clear mocks
          act(() => {
            jest.advanceTimersByTime(500);
          });
          await waitFor(() => {
            expect(locationService.searchPlaces).toHaveBeenCalled();
          });
          jest.clearAllMocks();

          // For each keyword, set it and wait for debounce to complete
          for (const keyword of keywords) {
            act(() => {
              result.current.setSearchKeyword(keyword);
            });

            // Wait for debounce period
            act(() => {
              jest.advanceTimersByTime(500);
            });

            // Wait for API call
            await waitFor(() => {
              expect(locationService.searchPlaces).toHaveBeenCalled();
            });
          }

          // Verify API was called once for each keyword (after initial mount)
          expect(locationService.searchPlaces).toHaveBeenCalledTimes(keywords.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
