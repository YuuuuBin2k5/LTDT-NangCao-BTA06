# Design Document - Place Search & Filter Module

## Overview

The Place Search & Filter module provides a comprehensive solution for discovering locations based on multiple criteria. The system consists of a Spring Boot backend exposing RESTful APIs for efficient querying with pagination support, and a React Native frontend offering an intuitive search interface integrated with map visualization.

The architecture follows a clean separation between backend and frontend, with the backend handling all business logic, data persistence, and query optimization, while the frontend focuses on user experience, real-time feedback, and smooth interactions.

## Architecture

### Backend Architecture (Spring Boot)

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         LocationController / PlaceController           │ │
│  │         GET /api/v1/places/search                      │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      Service Layer                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │    LocationService / PlaceService                      │ │
│  │    - Search logic                                      │ │
│  │    - Filter application                                │ │
│  │    - Pagination handling                               │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                   Data Access Layer                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         PlaceRepository (Spring Data JPA)              │ │
│  │         - Custom @Query methods                        │ │
│  │         - Specification support                        │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   PostgreSQL   │
                    │    Database    │
                    └────────────────┘
```

### Frontend Architecture (React Native)

```
┌─────────────────────────────────────────────────────────────┐
│                      Screen Layer                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │    app/(app)/(tabs)/index.tsx (Map/Home Screen)        │ │
│  │    - SearchBar component                               │ │
│  │    - Filter button                                     │ │
│  │    - Map with markers                                  │ │
│  │    - Results carousel                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    Component Layer                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  src/features/map/components/                          │ │
│  │  - FilterBottomSheet.tsx                               │ │
│  │  - PlaceMarker.tsx                                     │ │
│  │  - PlaceCard.tsx                                       │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  State Management Layer                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  src/features/map/hooks/                               │ │
│  │  - useLocationSearch.ts                                │ │
│  │  - useSearchFilters.ts                                 │ │
│  │                                                         │ │
│  │  src/store/contexts/LocationContext.tsx                │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                     Service Layer                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  src/services/location/location.service.ts             │ │
│  │  - searchPlaces()                                      │ │
│  │  - API client integration                              │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Backend API   │
                    └────────────────┘
```

## Components and Interfaces

### Backend Components

#### 1. Place Entity

```java
@Entity
@Table(name = "places")
public class Place {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private Double latitude;
    
    @Column(nullable = false)
    private Double longitude;
    
    @Column(name = "average_rating")
    private Double averageRating;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PlaceCategory category;
    
    // Getters, setters, constructors
}
```

#### 2. PlaceRepository Interface

```java
public interface PlaceRepository extends JpaRepository<Place, Long>, JpaSpecificationExecutor<Place> {
    
    @Query("SELECT p FROM Place p WHERE " +
           "(:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:category IS NULL OR p.category = :category) AND " +
           "(:minRating IS NULL OR p.averageRating >= :minRating)")
    Page<Place> searchPlaces(
        @Param("keyword") String keyword,
        @Param("category") PlaceCategory category,
        @Param("minRating") Double minRating,
        Pageable pageable
    );
}
```

#### 3. PlaceService Interface

```java
public interface PlaceService {
    Page<PlaceDTO> searchPlaces(
        String keyword, 
        PlaceCategory category, 
        Double minRating, 
        int page, 
        int size
    );
}
```

#### 4. LocationController Endpoints

```java
@RestController
@RequestMapping("/api/v1/places")
public class LocationController {
    
    @GetMapping("/search")
    public ResponseEntity<PagedResponse<PlaceDTO>> searchPlaces(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) PlaceCategory category,
        @RequestParam(required = false) Double minRating,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        // Implementation
    }
}
```

### Frontend Components

#### 1. SearchBar Component (Integrated in index.tsx)

```typescript
interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress: () => void;
  isLoading: boolean;
}
```

#### 2. FilterBottomSheet Component

```typescript
interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedCategory: PlaceCategory | null;
  onCategoryChange: (category: PlaceCategory | null) => void;
  minRating: number;
  onRatingChange: (rating: number) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}
```

#### 3. useLocationSearch Hook

```typescript
interface UseLocationSearchReturn {
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
}
```

#### 4. Location Service Methods

```typescript
interface SearchPlacesParams {
  keyword?: string;
  category?: PlaceCategory;
  minRating?: number;
  page?: number;
  size?: number;
}

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

async function searchPlaces(params: SearchPlacesParams): Promise<PagedResponse<Place>>;
```

## Data Models

### Place Model

```typescript
interface Place {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  averageRating: number;
  category: PlaceCategory;
}

enum PlaceCategory {
  RESTAURANT = 'RESTAURANT',
  HOTEL = 'HOTEL',
  PARK = 'PARK',
  MUSEUM = 'MUSEUM',
  SHOPPING = 'SHOPPING',
  ENTERTAINMENT = 'ENTERTAINMENT',
  OTHER = 'OTHER'
}
```

### Search Filters Model

```typescript
interface SearchFilters {
  category: PlaceCategory | null;
  minRating: number;
}
```

### Pagination State Model

```typescript
interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasMore: boolean;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Keyword search returns matching results
*For any* search keyword and place database, all returned results should contain the keyword in their name (case-insensitive).
**Validates: Requirements 1.1**

### Property 2: SQL injection prevention
*For any* search query containing SQL special characters, the system should sanitize the input and execute safely without SQL errors or unauthorized data access.
**Validates: Requirements 1.2**

### Property 3: Search results completeness
*For any* search result returned by the API, it should contain all required fields: id, name, description, latitude, longitude, averageRating, and category.
**Validates: Requirements 1.3**

### Property 4: Category filter accuracy
*For any* selected category and place database, all returned results should have a category field matching the selected category.
**Validates: Requirements 2.1**

### Property 5: Rating filter threshold
*For any* minimum rating threshold and place database, all returned results should have an averageRating greater than or equal to the threshold.
**Validates: Requirements 3.1**

### Property 6: Pagination correctness
*For any* page number and page size, the returned results should correspond to the correct slice of the total dataset, and the metadata should accurately reflect pagination state.
**Validates: Requirements 4.2, 4.3**

### Property 7: Pagination list growth invariant
*For any* sequence of "load more" operations, the results list length should increase monotonically (never decrease) and new items should be appended to the end.
**Validates: Requirements 4.5**

### Property 8: Filter clear round-trip
*For any* initial search state, applying filters then clearing all filters should return results equivalent to the initial unfiltered state.
**Validates: Requirements 7.5**

### Property 9: Loading state consistency
*For any* API call, the loading state should be true when the request starts and false when the response is received (success or error).
**Validates: Requirements 1.5, 7.1**

### Property 10: Debounce timing
*For any* sequence of rapid input changes within 500ms, only the final value should trigger an API request after the debounce period.
**Validates: Requirements 1.4**

## Error Handling

### Backend Error Handling

1. **Invalid Input Parameters**
   - Validate all query parameters before processing
   - Return 400 Bad Request with descriptive error message for invalid category, negative ratings, or invalid page numbers
   - Sanitize keyword input to prevent SQL injection

2. **Database Errors**
   - Catch and log database exceptions
   - Return 500 Internal Server Error with generic message to client
   - Implement retry logic for transient database failures

3. **Empty Results**
   - Return 200 OK with empty content array and zero totalElements
   - Ensure pagination metadata is still valid

4. **Performance Issues**
   - Implement query timeout (e.g., 30 seconds)
   - Add database indexes on name, category, and averageRating columns
   - Consider caching for popular searches

### Frontend Error Handling

1. **Network Errors**
   - Display user-friendly error message: "Unable to connect. Please check your internet connection."
   - Provide retry button
   - Cache last successful results for offline viewing

2. **API Errors**
   - Parse error responses from backend
   - Display specific error messages when available
   - Log errors for debugging

3. **Empty Results**
   - Display message: "No places found matching your criteria"
   - Suggest clearing filters or trying different keywords
   - Show popular places as alternatives

4. **Loading Timeout**
   - Implement 30-second timeout for API calls
   - Display timeout message with retry option
   - Cancel pending requests when user navigates away

5. **Invalid User Input**
   - Validate input on client side before sending to API
   - Provide immediate feedback for invalid input
   - Disable search button when input is invalid

## Testing Strategy

### Unit Testing

**Backend Unit Tests:**
- Test PlaceRepository query methods with various parameter combinations
- Test PlaceService search logic with mocked repository
- Test input sanitization functions
- Test pagination calculation logic
- Test DTO mapping from Entity to DTO

**Frontend Unit Tests:**
- Test useLocationSearch hook state management
- Test debounce utility function
- Test filter state updates
- Test pagination logic (hasMore calculation)
- Test API service methods with mocked HTTP client

### Property-Based Testing

The module will use **fast-check** for JavaScript/TypeScript property-based testing on the frontend, and **jqwik** for Java property-based testing on the backend. Each property-based test should run a minimum of 100 iterations.

**Backend Property Tests:**
- Property 1: Generate random keywords and place databases, verify all results contain keyword
- Property 2: Generate strings with SQL injection patterns, verify safe execution
- Property 3: Generate random search parameters, verify all results have complete fields
- Property 4: Generate random categories and places, verify category filtering accuracy
- Property 5: Generate random rating thresholds and places, verify rating filtering accuracy
- Property 6: Generate random page/size combinations, verify correct pagination slicing
- Property 7: Generate sequences of page loads, verify list growth invariant

**Frontend Property Tests:**
- Property 8: Generate filter states, verify clear filters returns to initial state
- Property 9: Generate API call sequences, verify loading state transitions
- Property 10: Generate rapid input sequences, verify debounce behavior

Each property-based test must be tagged with a comment in this format:
```
// Feature: place-search-filter, Property 1: Keyword search returns matching results
```

### Integration Testing

- Test complete search flow from API call to result display
- Test filter application with real API responses
- Test pagination with real data
- Test error scenarios with mocked failing API
- Test debounce behavior with real user input simulation

### End-to-End Testing

- Test user journey: open app → search for place → apply filters → view results
- Test infinite scroll with large datasets
- Test network failure recovery
- Test concurrent filter changes

## Performance Considerations

### Backend Optimization

1. **Database Indexing**
   - Create composite index on (category, averageRating, name) for efficient filtering
   - Create full-text search index on name field for faster LIKE queries

2. **Query Optimization**
   - Use JPQL with proper join fetch strategies
   - Limit result set size (max 100 items per page)
   - Use database query explain plans to identify bottlenecks

3. **Caching Strategy**
   - Cache popular search queries using Redis
   - Set TTL of 5 minutes for cached results
   - Invalidate cache when places are updated

### Frontend Optimization

1. **Debouncing**
   - 500ms debounce on search input to reduce API calls
   - Cancel previous requests when new search is triggered

2. **Lazy Loading**
   - Load initial page of 20 results
   - Implement infinite scroll for additional pages
   - Preload next page when user reaches 80% of current list

3. **State Management**
   - Memoize search results to prevent unnecessary re-renders
   - Use React.memo for PlaceCard components
   - Implement virtual scrolling for large result lists

4. **Map Rendering**
   - Cluster markers when zoomed out
   - Only render visible markers in viewport
   - Debounce map movement events

## Security Considerations

1. **Input Sanitization**
   - Sanitize all user input on backend to prevent SQL injection
   - Validate input length (max 100 characters for keyword)
   - Escape special characters in search queries

2. **Rate Limiting**
   - Implement rate limiting on search endpoint (e.g., 60 requests per minute per user)
   - Return 429 Too Many Requests when limit exceeded

3. **Authentication**
   - Require valid JWT token for search API access
   - Validate token on each request

4. **Data Exposure**
   - Only return public place information
   - Filter sensitive data from responses
   - Implement field-level access control if needed

## Future Enhancements

1. **Advanced Search**
   - Full-text search with relevance scoring
   - Fuzzy matching for typo tolerance
   - Search by address or coordinates

2. **Geospatial Filtering**
   - Filter by distance from user location
   - Filter by bounding box (visible map area)
   - Sort by proximity

3. **Saved Searches**
   - Allow users to save favorite search queries
   - Provide search history

4. **Search Analytics**
   - Track popular searches
   - Provide search suggestions based on trends
   - Personalized search results based on user preferences
