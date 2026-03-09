/**
 * Integration tests for useLocationSearch hook - Complete search flow
 * Tests complete search flow from input to result display
 * Validates: Requirements 1.1, 2.1, 3.1, 4.2
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
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

describe('useLocationSearch - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * Helper function to create mock places
   */
  const createMockPlaces = (count: number, category: PlaceCategory = PlaceCategory.RESTAURANT): Place[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Place ${i + 1}`,
      description: `Description for place ${i + 1}`,
      latitude: 10.0 + i * 0.01,
      longitude: 106.0 + i * 0.01,
      averageRating: 3.5 + (i % 3),
      category,
    }));
  };

  /**
   * Test complete search flow from input to result display
   * Validates: Requirements 1.1
   */
  test('Integration: Complete search flow with keyword input', async () => {
    const initialPlaces = createMockPlaces(5);
    const searchPlaces = createMockPlaces(15);
    
    // Mock initial load
    (locationService.searchPlaces as jest.Mock).mockResolvedValueOnce({
      content: initialPlaces,
      totalElements: 5,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20,
    });

    const { result } = renderHook(() => useLocationSearch());

    // Wait for initial load to complete
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.places.length).toBe(5);
    });

    // Clear mocks after initial load
    jest.clearAllMocks();

    // Mock search response
    (locationService.searchPlaces as jest.Mock).mockResolvedValueOnce({
      content: searchPlaces,
      totalElements: 15,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20,
    });

    // Set search keyword
    act(() => {
      result.current.setSearchKeyword('restaurant');
    });

    // Verify keyword is set immediately
    expect(result.current.searchKeyword).toBe('restaurant');

    // Advance time to trigger debounce
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Wait for search to complete
    await waitFor(() => {
      expect(result.current.places.length).toBe(15);
    });

    // Verify results
    expect(result.current.places).toEqual(searchPlaces);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(locationService.searchPlaces).toHaveBeenCalledWith(
      expect.objectContaining({
        keyword: 'restaurant',
      }),
      expect.anything()
    );
  });

  /**
   * Test filter application with mocked API responses
   * Validates: Requirements 2.1, 3.1
   */
  test('Integration: Filter application updates search results', async () => {
    const restaurantPlaces = createMockPlaces(10, PlaceCategory.RESTAURANT);
    const hotelPlaces = createMockPlaces(5, PlaceCategory.HOTEL);

    // Mock initial response with restaurants
    (locationService.searchPlaces as jest.Mock).mockResolvedValueOnce({
      content: restaurantPlaces,
      totalElements: 10,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20,
    });

    const { result } = renderHook(() => useLocationSearch());

    // Wait for initial load
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.places.length).toBe(10);
    });

    // Verify initial results are restaurants
    expect(result.current.places).toEqual(restaurantPlaces);

    // Mock response for hotel filter
    (locationService.searchPlaces as jest.Mock).mockResolvedValueOnce({
      content: hotelPlaces,
      totalElements: 5,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20,
    });

    // Apply category filter
    act(() => {
      result.current.updateFilters({ category: PlaceCategory.HOTEL });
    });

    // Wait for filtered results
    await waitFor(() => {
      expect(result.current.places.length).toBe(5);
    });

    // Verify filtered results
    expect(result.current.places).toEqual(hotelPlaces);
    expect(locationService.searchPlaces).toHaveBeenCalledWith(
      expect.objectContaining({
        category: PlaceCategory.HOTEL,
      }),
      expect.anything()
    );
  });

  /**
   * Test rating filter application
   * Validates: Requirements 3.1
   */
  test('Integration: Rating filter returns only high-rated places', async () => {
    const allPlaces = createMockPlaces(20);
    const highRatedPlaces = allPlaces.filter(p => p.averageRating >= 4.0);

    // Mock initial response with all places
    (locationService.searchPlaces as jest.Mock).mockResolvedValueOnce({
      content: allPlaces,
      totalElements: 20,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20,
    });

    const { result } = renderHook(() => useLocationSearch());

    // Wait for initial load
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.places.length).toBe(20);
    });

    // Mock response for rating filter
    (locationService.searchPlaces as jest.Mock).mockResolvedValueOnce({
      content: highRatedPlaces,
      totalElements: highRatedPlaces.length,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20,
    });

    // Apply rating filter
    act(() => {
      result.current.updateFilters({ minRating: 4.0 });
    });

    // Wait for filtered results
    await waitFor(() => {
      expect(result.current.places.length).toBe(highRatedPlaces.length);
    });

    // Verify all returned places have rating >= 4.0
    result.current.places.forEach(place => {
      expect(place.averageRating).toBeGreaterThanOrEqual(4.0);
    });

    expect(locationService.searchPlaces).toHaveBeenCalledWith(
      expect.objectContaining({
        minRating: 4.0,
      }),
      expect.anything()
    );
  });

  /**
   * Test pagination with multiple page loads
   * Validates: Requirements 4.2
   */
  test('Integration: Pagination loads multiple pages correctly', async () => {
    const page1Places = createMockPlaces(20);
    const page2Places = createMockPlaces(20).map(p => ({ ...p, id: p.id + 20 }));
    const page3Places = createMockPlaces(10).map(p => ({ ...p, id: p.id + 40 }));

    // Mock page 1 response
    (locationService.searchPlaces as jest.Mock).mockResolvedValueOnce({
      content: page1Places,
      totalElements: 50,
      totalPages: 3,
      currentPage: 0,
      pageSize: 20,
    });

    const { result } = renderHook(() => useLocationSearch());

    // Wait for initial load
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.places.length).toBe(20);
    });

    // Verify page 1 loaded
    expect(result.current.places).toEqual(page1Places);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.pagination.currentPage).toBe(0);
    expect(result.current.pagination.totalPages).toBe(3);

    // Mock page 2 response
    (locationService.searchPlaces as jest.Mock).mockResolvedValueOnce({
      content: page2Places,
      totalElements: 50,
      totalPages: 3,
      currentPage: 1,
      pageSize: 20,
    });

    // Load more (page 2)
    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.places.length).toBe(40);
    });

    // Verify page 2 appended
    expect(result.current.places).toEqual([...page1Places, ...page2Places]);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.pagination.currentPage).toBe(1);

    // Mock page 3 response
    (locationService.searchPlaces as jest.Mock).mockResolvedValueOnce({
      content: page3Places,
      totalElements: 50,
      totalPages: 3,
      currentPage: 2,
      pageSize: 20,
    });

    // Load more (page 3)
    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.places.length).toBe(50);
    });

    // Verify page 3 appended and no more pages
    expect(result.current.places).toEqual([...page1Places, ...page2Places, ...page3Places]);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.pagination.currentPage).toBe(2);
  });

  /**
   * Test error recovery scenarios
   * Validates: Error handling requirements
   */
  test('Integration: Error recovery with retry', async () => {
    const mockPlaces = createMockPlaces(10);

    // Mock initial error
    (locationService.searchPlaces as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useLocationSearch());

    // Wait for initial load to fail
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    // Verify error state
    expect(result.current.error?.message).toBe('Failed to search places');
    expect(result.current.places).toEqual([]);

    // Mock successful retry
    (locationService.searchPlaces as jest.Mock).mockResolvedValueOnce({
      content: mockPlaces,
      totalElements: 10,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20,
    });

    // Retry with refresh
    act(() => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.places.length).toBe(10);
    });

    // Verify recovery
    expect(result.current.places).toEqual(mockPlaces);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  /**
   * Test combined filters (category + rating)
   * Validates: Requirements 2.1, 3.1
   */
  test('Integration: Combined filters work together', async () => {
    const mockPlaces = createMockPlaces(5, PlaceCategory.RESTAURANT).map(p => ({
      ...p,
      averageRating: 4.5,
    }));

    (locationService.searchPlaces as jest.Mock).mockResolvedValue({
      content: mockPlaces,
      totalElements: 5,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20,
    });

    const { result } = renderHook(() => useLocationSearch());

    // Apply both filters
    act(() => {
      result.current.updateFilters({
        category: PlaceCategory.RESTAURANT,
        minRating: 4.0,
      });
    });

    // Wait for results
    await waitFor(() => {
      expect(result.current.places.length).toBe(5);
    });

    // Verify both filters applied
    expect(locationService.searchPlaces).toHaveBeenCalledWith(
      expect.objectContaining({
        category: PlaceCategory.RESTAURANT,
        minRating: 4.0,
      }),
      expect.anything()
    );

    // Verify results match both filters
    result.current.places.forEach(place => {
      expect(place.category).toBe(PlaceCategory.RESTAURANT);
      expect(place.averageRating).toBeGreaterThanOrEqual(4.0);
    });
  });

  /**
   * Test search with keyword and filters
   * Validates: Requirements 1.1, 2.1, 3.1
   */
  test('Integration: Search keyword works with filters', async () => {
    const mockPlaces = createMockPlaces(8, PlaceCategory.HOTEL);

    (locationService.searchPlaces as jest.Mock).mockResolvedValue({
      content: mockPlaces,
      totalElements: 8,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20,
    });

    const { result } = renderHook(() => useLocationSearch());

    // Set keyword and filters
    act(() => {
      result.current.setSearchKeyword('luxury');
      result.current.updateFilters({
        category: PlaceCategory.HOTEL,
        minRating: 4.5,
      });
    });

    // Advance time for debounce
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Wait for results
    await waitFor(() => {
      expect(result.current.places.length).toBe(8);
    });

    // Verify all parameters sent
    expect(locationService.searchPlaces).toHaveBeenCalledWith(
      expect.objectContaining({
        keyword: 'luxury',
        category: PlaceCategory.HOTEL,
        minRating: 4.5,
      }),
      expect.anything()
    );
  });

  /**
   * Test empty results handling
   * Validates: Error handling requirements
   */
  test('Integration: Empty results are handled correctly', async () => {
    (locationService.searchPlaces as jest.Mock).mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 20,
    });

    const { result } = renderHook(() => useLocationSearch());

    // Wait for initial load
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(locationService.searchPlaces).toHaveBeenCalled();
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify empty state
    expect(result.current.places).toEqual([]);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
