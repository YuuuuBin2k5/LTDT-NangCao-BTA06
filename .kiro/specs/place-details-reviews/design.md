# Design Document - Place Details & Reviews with Permission Logic

## Overview

This module provides detailed place information and a sophisticated review system with privacy controls based on friendship relationships. The core innovation is the permission logic that allows users to see public reviews from everyone, plus private reviews from their friends only.

The system ensures data privacy while maintaining a rich user experience, allowing users to share honest feedback with their social circle without exposing it publicly.

## Architecture

### Backend Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Controller Layer                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │  LocationController                                │  │
│  │  - GET /api/v1/places/{id}                         │  │
│  │  - GET /api/v1/places/{id}/reviews                 │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│                   Service Layer                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  PlaceService                                      │  │
│  │  - getPlaceDetails()                               │  │
│  │                                                     │  │
│  │  ReviewService (CRITICAL LOGIC)                    │  │
│  │  - getReviewsForPlace(placeId, authenticatedUserId)│  │
│  │  - applyFriendshipFilter()                         │  │
│  │                                                     │  │
│  │  FriendshipService                                 │  │
│  │  - areFriends(userId1, userId2)                    │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│                Repository Layer                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  PlaceRepository                                   │  │
│  │  ReviewRepository                                  │  │
│  │  FriendshipRepository                              │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────┘
                     │
              ┌──────▼───────┐
              │  PostgreSQL  │
              └──────────────┘
```

### Frontend Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Screen Layer                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  app/(app)/place/[id].tsx                          │  │
│  │  - Place info section (top)                        │  │
│  │  - Reviews list section (bottom)                   │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│                 Component Layer                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  src/features/map/components/                      │  │
│  │  - ReviewCard.tsx (with visibility icon logic)     │  │
│  │  - PlaceHeader.tsx                                 │  │
│  │  - RatingDisplay.tsx                               │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│                  Service Layer                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │  src/services/location/location.service.ts         │  │
│  │  - fetchPlaceDetails(placeId)                      │  │
│  │  - fetchPlaceReviews(placeId)                      │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Backend Components

#### 1. Review Entity

```java
@Entity
@Table(name = "reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id", nullable = false)
    private Place place;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @Column(nullable = false)
    private Integer rating; // 1-5
    
    @Column(name = "is_public", nullable = false)
    private Boolean isPublic;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    // Getters, setters
}
```

#### 2. Friendship Entity

```java
@Entity
@Table(name = "friendships")
public class Friendship {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id_1", nullable = false)
    private Long userId1;
    
    @Column(name = "user_id_2", nullable = false)
    private Long userId2;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FriendshipStatus status;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    // Getters, setters
}

public enum FriendshipStatus {
    PENDING, ACCEPTED, REJECTED, BLOCKED
}
```

#### 3. ReviewService - Critical Permission Logic

```java
public interface ReviewService {
    List<ReviewDTO> getReviewsForPlace(Long placeId, Long authenticatedUserId);
}

@Service
public class ReviewServiceImpl implements ReviewService {
    
    @Override
    public List<ReviewDTO> getReviewsForPlace(Long placeId, Long authenticatedUserId) {
        // Step 1: Get all public reviews
        List<Review> publicReviews = reviewRepository
            .findByPlaceIdAndIsPublicTrue(placeId);
        
        // Step 2: Get friend IDs of authenticated user
        Set<Long> friendIds = friendshipService
            .getFriendIds(authenticatedUserId);
        
        // Step 3: Get private reviews from friends only
        List<Review> privateReviewsFromFriends = reviewRepository
            .findByPlaceIdAndIsPublicFalseAndUserIdIn(placeId, friendIds);
        
        // Step 4: Combine and convert to DTOs
        List<Review> allReviews = new ArrayList<>();
        allReviews.addAll(publicReviews);
        allReviews.addAll(privateReviewsFromFriends);
        
        return allReviews.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
}
```

#### 4. FriendshipService

```java
public interface FriendshipService {
    Set<Long> getFriendIds(Long userId);
    boolean areFriends(Long userId1, Long userId2);
}

@Service
public class FriendshipServiceImpl implements FriendshipService {
    
    @Override
    public Set<Long> getFriendIds(Long userId) {
        List<Friendship> friendships = friendshipRepository
            .findAcceptedFriendshipsByUserId(userId);
        
        return friendships.stream()
            .map(f -> f.getUserId1().equals(userId) ? 
                f.getUserId2() : f.getUserId1())
            .collect(Collectors.toSet());
    }
    
    @Override
    public boolean areFriends(Long userId1, Long userId2) {
        return friendshipRepository
            .existsByUserIdsAndStatus(userId1, userId2, FriendshipStatus.ACCEPTED);
    }
}
```

#### 5. ReviewDTO

```java
public class ReviewDTO {
    private Long id;
    private String content;
    private Integer rating;
    private Boolean isPublic;
    private LocalDateTime createdAt;
    
    // Author information
    private Long authorId;
    private String authorName;
    private String authorAvatarUrl;
    
    // Getters, setters
}
```

### Frontend Components

#### 1. ReviewCard Component

```typescript
interface ReviewCardProps {
  review: Review;
}

interface Review {
  id: number;
  content: string;
  rating: number;
  isPublic: boolean;
  createdAt: string;
  author: {
    id: number;
    name: string;
    avatarUrl: string | null;
  };
}

// Component renders:
// - Author avatar (circular)
// - Author name
// - Visibility icon (🌎 if public, 👥 if private)
// - Rating stars
// - Review content
// - Relative timestamp
```

#### 2. Place Details Screen

```typescript
// app/(app)/place/[id].tsx

interface PlaceDetailsScreenProps {
  route: {
    params: {
      id: string;
    };
  };
}

// Screen structure:
// 1. Cover image (full width)
// 2. Place name, category badge
// 3. Address, rating display
// 4. Separator
// 5. FlatList of ReviewCard components
```

#### 3. Location Service Methods

```typescript
interface PlaceDetails {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  averageRating: number;
  category: PlaceCategory;
  coverImageUrl: string;
  address: string;
}

async function fetchPlaceDetails(placeId: number): Promise<PlaceDetails>;
async function fetchPlaceReviews(placeId: number): Promise<Review[]>;
```

## Data Models

### Review Model

```typescript
interface Review {
  id: number;
  content: string;
  rating: number; // 1-5
  isPublic: boolean;
  createdAt: string; // ISO 8601
  author: ReviewAuthor;
}

interface ReviewAuthor {
  id: number;
  name: string;
  avatarUrl: string | null;
}
```

### Friendship Model

```typescript
interface Friendship {
  id: number;
  userId1: number;
  userId2: number;
  status: FriendshipStatus;
  createdAt: string;
}

enum FriendshipStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  BLOCKED = 'BLOCKED'
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Place details completeness
*For any* valid place ID, the API response should contain all required fields: id, name, description, latitude, longitude, averageRating, category, and coverImageUrl.
**Validates: Requirements 1.1**

### Property 2: Public reviews visibility
*For any* place and any authenticated user, all public reviews for that place should be included in the response.
**Validates: Requirements 2.1, 4.3**

### Property 3: Friend private reviews visibility (CRITICAL)
*For any* authenticated user and place, the response should include private reviews if and only if the review author has an ACCEPTED friendship with the authenticated user.
**Validates: Requirements 2.2, 4.4**

### Property 4: Non-friend private reviews exclusion
*For any* authenticated user and place, the response should never include private reviews from users who are not friends with the authenticated user.
**Validates: Requirements 4.4**

### Property 5: Review response completeness
*For any* review in the API response, it should contain all required fields: id, content, rating, isPublic, createdAt, authorId, authorName, and authorAvatarUrl.
**Validates: Requirements 2.3, 9.1**

### Property 6: Bidirectional friendship lookup
*For any* two users with an ACCEPTED friendship, the friendship should be found regardless of whether user A is in user_id_1 or user_id_2 column.
**Validates: Requirements 4.5, 5.3**

### Property 7: Friendship status correctness
*For any* two users with an ACCEPTED friendship record, the areFriends function should return true; for any pair without an ACCEPTED friendship, it should return false.
**Validates: Requirements 5.4, 5.5**

### Property 8: Visibility icon mapping
*For any* review displayed in the UI, the visibility icon should be 🌎 if isPublic is true, and 👥 if isPublic is false.
**Validates: Requirements 3.1, 3.2**

### Property 9: ReviewCard completeness
*For any* review rendered in a ReviewCard, all elements should be displayed: author avatar, author name, rating stars, content, timestamp, and visibility icon.
**Validates: Requirements 3.4**

### Property 10: Sensitive data exclusion
*For any* review response from the API, it should never contain sensitive user fields such as email, phone, or password hash.
**Validates: Requirements 6.5**

### Property 11: Timestamp format validation
*For any* review returned by the API, the createdAt field should be a valid ISO 8601 formatted timestamp.
**Validates: Requirements 10.1**

### Property 12: Relative time formatting
*For any* review less than 30 days old, the frontend should display the timestamp in relative format (e.g., "2 hours ago").
**Validates: Requirements 10.2**

### Property 13: Screen mount API calls
*For any* place details screen mount, both fetchPlaceDetails and fetchPlaceReviews should be called with the place ID from route params.
**Validates: Requirements 8.3**

### Property 14: Loading state display
*For any* API call in progress, the frontend should display loading indicators until the response is received.
**Validates: Requirements 8.4**

## Error Handling

### Backend Error Handling

1. **Place Not Found**
   - Return 404 with message: "Place not found"
   - Log the invalid place ID for monitoring

2. **Unauthorized Access**
   - Return 401 if JWT token is missing or invalid
   - Return 403 if user tries to access restricted reviews

3. **Database Errors**
   - Catch and log exceptions
   - Return 500 with generic error message
   - Implement retry logic for transient failures

4. **Invalid Review Data**
   - Validate rating is between 1-5
   - Validate content is not empty
   - Return 400 for validation failures

### Frontend Error Handling

1. **Network Errors**
   - Display: "Unable to load place details. Please check your connection."
   - Provide retry button
   - Cache last successful data for offline viewing

2. **404 Place Not Found**
   - Display: "This place no longer exists"
   - Provide button to go back to map

3. **Authentication Errors**
   - Redirect to login screen
   - Preserve intended destination for post-login redirect

4. **Image Loading Failures**
   - Use default placeholder for failed avatars
   - Use default cover image for failed place images

5. **Empty Reviews**
   - Display: "No reviews yet. Be the first to review!"
   - Optionally show "Write a review" button

## Testing Strategy

### Unit Testing

**Backend Unit Tests:**
- Test ReviewService.getReviewsForPlace with various friendship scenarios
- Test FriendshipService.areFriends with bidirectional lookups
- Test FriendshipService.getFriendIds with complex friendship graphs
- Test DTO mapping from entities
- Test input validation

**Frontend Unit Tests:**
- Test ReviewCard component rendering with different review data
- Test visibility icon logic
- Test timestamp formatting functions
- Test API service methods with mocked responses
- Test navigation to place details screen

### Property-Based Testing

The module will use **jqwik** for Java backend testing and **fast-check** for TypeScript frontend testing. Each property-based test should run a minimum of 100 iterations.

**Backend Property Tests:**
- Property 1: Generate random places, verify response completeness
- Property 2: Generate random places with public reviews, verify all are returned
- Property 3: Generate random friendship graphs and reviews, verify friend private reviews are included
- Property 4: Generate random friendship graphs and reviews, verify non-friend private reviews are excluded
- Property 5: Generate random reviews, verify response field completeness
- Property 6: Generate random friendships, verify bidirectional lookup works
- Property 7: Generate random user pairs, verify areFriends correctness
- Property 10: Generate random reviews, verify no sensitive data in responses
- Property 11: Generate random reviews, verify ISO 8601 timestamp format

**Frontend Property Tests:**
- Property 8: Generate random reviews, verify icon matches isPublic flag
- Property 9: Generate random reviews, verify ReviewCard displays all elements
- Property 12: Generate random recent timestamps, verify relative formatting
- Property 13: Generate random place IDs, verify both API calls on mount
- Property 14: Generate random API states, verify loading indicators

Each property-based test must be tagged with:
```
// Feature: place-details-reviews, Property X: [property name]
```

### Integration Testing

- Test complete flow: navigate to place → load details → load reviews → display with correct permissions
- Test friendship permission logic with real database
- Test authentication flow with JWT tokens
- Test error scenarios with mocked failing APIs

## Performance Considerations

### Backend Optimization

1. **Query Optimization**
   - Use JOIN FETCH to avoid N+1 queries when loading reviews with authors
   - Create index on (place_id, is_public) for review queries
   - Create composite index on (user_id_1, user_id_2, status) for friendship lookups

2. **Caching**
   - Cache place details for 10 minutes
   - Cache friendship relationships for 5 minutes
   - Invalidate caches when data changes

3. **Batch Loading**
   - Load all reviews for a place in single query
   - Load all friend IDs in single query
   - Use IN clause for filtering private reviews

### Frontend Optimization

1. **Data Loading**
   - Load place details and reviews in parallel
   - Show place info immediately while reviews load
   - Implement pull-to-refresh for updates

2. **List Rendering**
   - Use FlatList with proper keyExtractor
   - Implement getItemLayout for better performance
   - Use React.memo for ReviewCard components

3. **Image Loading**
   - Lazy load images as user scrolls
   - Cache images locally
   - Use progressive image loading

## Security Considerations

1. **Authentication**
   - Require valid JWT for all review endpoints
   - Validate token signature and expiration
   - Extract user ID from token claims

2. **Authorization**
   - Verify user can only see reviews they're authorized for
   - Never expose private reviews to non-friends
   - Implement rate limiting on review endpoints

3. **Data Privacy**
   - Never return sensitive user data in review responses
   - Filter out email, phone, password fields
   - Log access to private reviews for audit

4. **Input Validation**
   - Validate place ID format
   - Sanitize review content for XSS prevention
   - Validate rating range (1-5)

## Database Schema

### Reviews Table

```sql
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    place_id BIGINT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_place_public ON reviews(place_id, is_public);
CREATE INDEX idx_reviews_user ON reviews(user_id);
```

### Friendships Table

```sql
CREATE TABLE friendships (
    id BIGSERIAL PRIMARY KEY,
    user_id_1 BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id_2 BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_friendship UNIQUE (user_id_1, user_id_2),
    CONSTRAINT different_users CHECK (user_id_1 != user_id_2)
);

CREATE INDEX idx_friendships_user1_status ON friendships(user_id_1, status);
CREATE INDEX idx_friendships_user2_status ON friendships(user_id_2, status);
```

## Future Enhancements

1. **Review Reactions**
   - Allow users to like/react to reviews
   - Show reaction counts

2. **Review Replies**
   - Allow place owners to reply to reviews
   - Thread conversations

3. **Review Moderation**
   - Flag inappropriate reviews
   - Admin moderation interface

4. **Review Photos**
   - Allow users to attach photos to reviews
   - Display photo gallery

5. **Review Sorting**
   - Sort by date, rating, helpfulness
   - Filter by rating range
