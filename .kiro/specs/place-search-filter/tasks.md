# Implementation Plan - Place Search & Filter Module

- [x] 1. Set up backend database schema and entities





  - Create Place entity with all required fields (id, name, description, latitude, longitude, averageRating, category)
  - Create PlaceCategory enum with values: RESTAURANT, HOTEL, PARK, MUSEUM, SHOPPING, ENTERTAINMENT, OTHER
  - Create database migration script for places table with proper indexes
  - Add composite index on (category, averageRating, name) for query optimization
  - _Requirements: 5.4_


- [x] 2. Implement backend repository layer




  - Create PlaceRepository interface extending JpaRepository and JpaSpecificationExecutor
  - Implement custom @Query method for searchPlaces with keyword, category, and minRating parameters
  - Add input sanitization for SQL injection prevention
  - _Requirements: 5.5, 1.2_

- [x] 3. Implement backend service layer





  - Create PlaceService interface with searchPlaces method
  - Implement PlaceServiceImpl with search logic and pagination handling
  - Create PlaceDTO for API responses with all required fields
  - Implement entity-to-DTO mapping
  - _Requirements: 1.1, 1.3, 4.2_





- [x] 3.1 Write property test for keyword search















  - **Property 1: Keyword search returns matching results**
  - **Validates: Requirements 1.1**






- [ ] 3.2 Write property test for SQL injection prevention

  - **Property 2: SQL injection prevention**




  - **Validates: Requirements 1.2**


- [-] 3.3 Write property test for search results completeness



  - **Property 3: Search results completeness**
  - **Validates: Requirements 1.3**


- [ ] 4. Implement backend controller layer

  - Create LocationController with GET /api/v1/places/search endpoint
  - Accept query parameters: keyword, category, minRating, page, size
  - Return PagedResponse with content and pagination metadata
  - Add input validation and error handling
  - _Requirements: 5.1, 5.2, 4.1, 4.3_

- [x] 4.1 Write property test for category filter




  - **Property 4: Category filter accuracy**
  - **Validates: Requirements 2.1**


- [x] 4.2 Write property test for rating filter




  - **Property 5: Rating filter threshold**
  - **Validates: Requirements 3.1**

- [x] 4.3 Write property test for pagination correctness





  - **Property 6: Pagination correctness**
  - **Validates: Requirements 4.2, 4.3**


- [x] 4.4 Write unit tests for controller endpoints



  - Test successful search with various parameter combinations
  - Test empty results scenario
  - Test invalid input handling (negative page, invalid category)
  - Test error responses
  - _Requirements: 5.1, 5.2_


- [x] 5. Checkpoint - Ensure all backend tests pass




  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement frontend API service layer




  - Create searchPlaces function in src/services/location/location.service.ts
  - Define SearchPlacesParams and PagedResponse interfaces
  - Implement API client integration with proper error handling
  - Add request cancellation support
  - _Requirements: 8.3_


- [x] 7. Implement frontend state management




  - Create useLocationSearch custom hook in src/features/map/hooks/
  - Implement state for: places, isLoading, error, searchKeyword, filters, pagination
  - Add debounce logic (500ms) for search input
  - Implement loadMore function for infinite scroll
  - Add refresh function to reload results
  - _Requirements: 8.4, 1.4, 4.4_



- [x] 7.1 Write property test for debounce timing





  - **Property 10: Debounce timing**




  - **Validates: Requirements 1.4**



- [ ] 7.2 Write property test for loading state consistency



  - **Property 9: Loading state consistency**




  - **Validates: Requirements 1.5, 7.1**

- [ ] 8. Implement FilterBottomSheet component

  - Create FilterBottomSheet.tsx in src/features/map/components/
  - Add category selection with radio buttons for all PlaceCategory values
  - Add rating slider with range 0-5 and current value display


  - Implement Apply and Clear buttons

  - Add visual indicators for active filters
  - _Requirements: 2.3, 3.3, 7.4_

- [x] 8.1 Write property test for filter clear round-trip





  - **Property 8: Filter clear round-trip**
  - **Validates: Requirements 7.5**


- [-] 9. Update map screen with search functionality






  - Update app/(app)/(tabs)/index.tsx with SearchBar component at top
  - Add Filter button with funnel icon adjacent to search bar
  - Integrate useLocationSearch hook


  - Display loading spinner when isLoading is true




  - Show error message when error occurs with retry button
  - Display "No results found" message when results are empty
  - _Requirements: 8.1, 1.5, 7.1, 7.2, 7.3_





- [ ] 10. Implement map markers for search results

  - Create PlaceMarker component for displaying places on map
  - Render markers for all places in search results



  - Add tap handler to show place preview card
  - Implement marker clustering for better performance
  - _Requirements: 6.1, 6.2_

- [ ] 11. Implement results display with infinite scroll

  - Create PlaceCard component for displaying place information
  - Add horizontal carousel or FlatList for browsing results
  - Implement infinite scroll with loadMore on reaching end
  - Add pull-to-refresh functionality
  - _Requirements: 4.4, 6.5_

- [ ] 11.1 Write property test for pagination list growth

  - **Property 7: Pagination list growth invariant**
  - **Validates: Requirements 4.5**

- [ ] 11.2 Write integration tests for search flow

  - Test complete search flow from input to result display
  - Test filter application with mocked API responses
  - Test pagination with multiple page loads
  - Test error recovery scenarios
  - _Requirements: 1.1, 2.1, 3.1, 4.2_


- [ ] 12. Implement filter integration
  - Connect FilterBottomSheet to useLocationSearch hook
  - Trigger new search when filters are applied
  - Update UI to show active filter indicators
  - Implement clear filters functionality
  - _Requirements: 2.4, 3.4, 7.4, 7.5_

- [ ] 13. Add performance optimizations

  - Implement request cancellation when new search is triggered
  - Add memoization for search results
  - Use React.memo for PlaceCard components
  - Implement virtual scrolling for large result lists
  - Add map viewport-based marker rendering
  - _Requirements: Performance considerations_

- [ ] 14. Final checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.
