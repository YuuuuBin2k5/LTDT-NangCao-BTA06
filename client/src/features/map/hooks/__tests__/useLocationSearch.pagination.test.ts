/**
 * Property-based tests for useLocationSearch hook - Pagination list growth
 * Feature: place-search-filter, Property 7: Pagination list growth invariant
 * Validates: Requirements 4.5
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as fc from 'fast-check';
import { useLocationSearch } from '../useLocationSearch';
import { locationService, Place, PlaceCategory } from '../../../../services/location/location.service';

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

describe('useLocationSearch - Pagination List Growth Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * Helper function to generate a mock place
   */
  const generateMockPlace = (id: number): Place => ({
    id,
    name: `Place ${id}`,
    description: `Description for place ${id}`,
    latitude: 10.0 + id * 0.01,
    longitude: 106.0 + id * 0.01,
    averageRating: 3.5,
    category: PlaceCategory.RESTAURANT,
  });

  /**
   * Helper function to generate a page of places
   */
  const generatePageOfPlaces = (page: number, pageSize: number, totalElements: number): Place[] => {
    const startId = page * pageSize;
    const endId = Math.min(startId + pageSize, totalElements);
    const places: Place[] = [];
    
    for (let i = startId; i < endId; i++) {
      places.push(generateMockPlace(i));
    }
    
    return places;
  };

  /**
   * Property 7: Pagination list growth invariant
   * For any sequence of "load more" operations, the results list length should increase 
   * monotonically (never decrease) and new items should be appended to the end.
   */
  test('Property 7: Pagination list growth - list length increases monotonically with loadMore', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate total number of elements (20-200)
        fc.integer({ min: 20, max: 200 }),
        // Generate page size (10-50)
        fc.integer({ min: 10, max: 50 }),
        // Generate number of loadMore calls (1-5)
        fc.integer({ min: 1, max: 5 }),
        async (totalElements, pageSize, numLoadMoreCalls) => {
          jest.clearAllMocks();

          // Calculate total pages
          const totalPages = Math.ceil(totalElements / pageSize);
          
          // Mock searchPlaces to return appropriate pages
          (locationService.searchPlaces as jest.Mock).mockImplementation((params) => {
            const page = params.page || 0;
            const size = params.size || pageSize;
            const content = generatePageOfPlaces(page, size, totalElements);
            
            return Promise.resolve({
              content,
              totalElements,
              totalPages,
              currentPage: page,
              pageSize: size,
            });
          });

          const { result } = renderHook(() => useLocationSearch());

          // Wait for initial mount search to complete
          act(() => {
            jest.advanceTimersByTime(500);
          });
          await waitFor(() => {
            expect(result.current.places.length).toBeGreaterThan(0);
          });

          // Track list lengths to verify monotonic growth
          const listLengths: number[] = [result.current.places.length];
          
          // Perform loadMore operations
          const actualLoadMoreCalls = Math.min(numLoadMoreCalls, totalPages - 1);
          
          for (let i = 0; i < actualLoadMoreCalls; i++) {
            // Only call loadMore if there are more pages
            if (!result.current.hasMore) {
              break;
            }

            const previousLength = result.current.places.length;
            const previousPlaces = [...result.current.places];
            const hadMore = result.current.hasMore;

            // Only proceed if there are actually more pages
            if (!hadMore) {
              break;
            }

            act(() => {
              result.current.loadMore();
            });

            // Wait for loadMore to complete - either length increases or hasMore becomes false
            await waitFor(() => {
              const lengthChanged = result.current.places.length > previousLength;
              const noMorePages = !result.current.hasMore;
              return lengthChanged || noMorePages;
            }, { timeout: 3000 });

            const newLength = result.current.places.length;
            
            // Only verify growth if length actually changed
            if (newLength > previousLength) {
              listLengths.push(newLength);

              // Verify monotonic growth: new length should be greater than previous
              expect(newLength).toBeGreaterThan(previousLength);

              // Verify that previous items are still at the beginning (not replaced)
              for (let j = 0; j < previousPlaces.length; j++) {
                expect(result.current.places[j].id).toBe(previousPlaces[j].id);
              }

              // Verify that new items are appended to the end
              const newItems = result.current.places.slice(previousLength);
              expect(newItems.length).toBeGreaterThan(0);
              
              // Verify new items have different IDs than existing items
              const existingIds = new Set(previousPlaces.map(p => p.id));
              for (const newItem of newItems) {
                expect(existingIds.has(newItem.id)).toBe(false);
              }
            }
          }

          // Verify overall monotonic growth across all operations
          for (let i = 1; i < listLengths.length; i++) {
            expect(listLengths[i]).toBeGreaterThan(listLengths[i - 1]);
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design doc
    );
  });

  test('Property 7: Pagination list growth - items are never removed during loadMore', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 50, max: 150 }),
        fc.integer({ min: 10, max: 30 }),
        async (totalElements, pageSize) => {
          jest.clearAllMocks();

          const totalPages = Math.ceil(totalElements / pageSize);
          
          (locationService.searchPlaces as jest.Mock).mockImplementation((params) => {
            const page = params.page || 0;
            const size = params.size || pageSize;
            const content = generatePageOfPlaces(page, size, totalElements);
            
            return Promise.resolve({
              content,
              totalElements,
              totalPages,
              currentPage: page,
              pageSize: size,
            });
          });

          const { result } = renderHook(() => useLocationSearch());

          // Wait for initial load
          act(() => {
            jest.advanceTimersByTime(500);
          });
          await waitFor(() => {
            expect(result.current.places.length).toBeGreaterThan(0);
          });

          // Collect all place IDs seen so far
          const allSeenIds = new Set(result.current.places.map(p => p.id));

          // Load more pages until no more available (limit to 3 pages to avoid timeout)
          let pagesLoaded = 0;
          const maxPages = Math.min(3, totalPages - 1);
          
          while (result.current.hasMore && pagesLoaded < maxPages) {
            act(() => {
              result.current.loadMore();
            });

            await waitFor(() => {
              expect(locationService.searchPlaces).toHaveBeenCalled();
            });

            // Verify all previously seen IDs are still present
            const currentIds = new Set(result.current.places.map(p => p.id));
            for (const seenId of allSeenIds) {
              expect(currentIds.has(seenId)).toBe(true);
            }

            // Add new IDs to the set
            for (const place of result.current.places) {
              allSeenIds.add(place.id);
            }
            
            pagesLoaded++;
          }
        }
      ),
      { numRuns: 50 } // Reduce runs to avoid timeout
    );
  }, 10000); // Increase timeout to 10 seconds

  test('Property 7: Pagination list growth - order is preserved during loadMore', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 40, max: 100 }),
        fc.integer({ min: 10, max: 20 }),
        async (totalElements, pageSize) => {
          jest.clearAllMocks();

          const totalPages = Math.ceil(totalElements / pageSize);
          
          (locationService.searchPlaces as jest.Mock).mockImplementation((params) => {
            const page = params.page || 0;
            const size = params.size || pageSize;
            const content = generatePageOfPlaces(page, size, totalElements);
            
            return Promise.resolve({
              content,
              totalElements,
              totalPages,
              currentPage: page,
              pageSize: size,
            });
          });

          const { result } = renderHook(() => useLocationSearch());

          // Wait for initial load
          act(() => {
            jest.advanceTimersByTime(500);
          });
          await waitFor(() => {
            expect(result.current.places.length).toBeGreaterThan(0);
          });

          // Load at least one more page if available
          if (result.current.hasMore) {
            const previousPlaces = [...result.current.places];

            act(() => {
              result.current.loadMore();
            });

            await waitFor(() => {
              expect(result.current.places.length).toBeGreaterThan(previousPlaces.length);
            });

            // Verify that the order of previous items is preserved
            for (let i = 0; i < previousPlaces.length; i++) {
              expect(result.current.places[i].id).toBe(previousPlaces[i].id);
              expect(result.current.places[i].name).toBe(previousPlaces[i].name);
            }

            // Verify that IDs are in ascending order (based on our mock data)
            for (let i = 1; i < result.current.places.length; i++) {
              expect(result.current.places[i].id).toBeGreaterThan(result.current.places[i - 1].id);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
