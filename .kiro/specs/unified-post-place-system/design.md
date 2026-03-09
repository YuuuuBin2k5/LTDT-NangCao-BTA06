# Design: Unified Post-Place System

## Overview

Thiết kế hệ thống thống nhất cho Post và Review, cho phép người dùng tạo bài đăng thường hoặc bài đánh giá địa điểm trong cùng một flow. Hệ thống sử dụng enum `PostType` để phân biệt giữa NORMAL và REVIEW posts, với Place relationship thông qua foreign key.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ CreatePost   │  │ PlaceDetails │  │  Feed        │      │
│  │ Screen       │  │ Screen       │  │  Screen      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼───────┐    │
│  │         Post Service & Place Service                │    │
│  └──────────────────────────┬──────────────────────────┘    │
└─────────────────────────────┼───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                        API Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostController│  │PlaceController│  │ReviewController│   │
│  │              │  │              │  │  (Deprecated)  │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│                      Service Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostService  │  │ PlaceService │  │ReviewService │      │
│  │              │  │              │  │  (Adapter)   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│                    Repository Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │PostRepository│  │PlaceRepository│  │ReviewRepository│   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│                      Database Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  posts       │  │  places      │  │  reviews     │      │
│  │  (unified)   │  │  (enhanced)  │  │  (deprecated)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

## Data Models

### Enhanced Post Entity

```java
@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    // NEW: Post type enum
    @Enumerated(EnumType.STRING)
    @Column(name = "post_type", nullable = false, length = 20)
    private PostType postType; // NORMAL or REVIEW
    
    // NEW: Place relationship (optional for NORMAL, required for REVIEW)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    private Place place;
    
    // NEW: Rating (required for REVIEW, null for NORMAL)
    @Column(name = "rating")
    private Integer rating; // 1-5 stars, null for NORMAL posts
    
    // Existing fields
    @Column(nullable = false)
    private Double latitude;
    
    @Column(nullable = false)
    private Double longitude;
    
    @Column(name = "location_name", length = 255)
    private String locationName; // Kept for backward compatibility
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PostPrivacy privacy;
    
    // ... rest of existing fields (images, likes, comments, hashtags, etc.)
}

public enum PostType {
    NORMAL,   // Regular post, place optional, no rating
    REVIEW    // Review post, place required, rating required
}
```

### Enhanced Place Entity

```java
@Entity
@Table(name = "places")
public class Place {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Existing fields
    @Column(nullable = false, length = 255)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private Double latitude;
    
    @Column(nullable = false)
    private Double longitude;
    
    @Column(name = "average_rating")
    private Double averageRating;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlaceCategory category;
    
    // NEW: Post count for performance
    @Column(name = "post_count", nullable = false)
    private Integer postCount = 0;
    
    // NEW: Review count (subset of post_count)
    @Column(name = "review_count", nullable = false)
    private Integer reviewCount = 0;
    
    // ... rest of existing fields
}
```

### Database Migration Strategy

```sql
-- V12__Unified_post_place_system.sql

-- Step 1: Add new columns to posts table
ALTER TABLE posts 
ADD COLUMN post_type VARCHAR(20) DEFAULT 'NORMAL' NOT NULL,
ADD COLUMN place_id BIGINT,
ADD COLUMN rating INTEGER,
ADD CONSTRAINT fk_posts_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE SET NULL,
ADD CONSTRAINT chk_rating_range CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
ADD CONSTRAINT chk_review_has_place CHECK (post_type != 'REVIEW' OR place_id IS NOT NULL),
ADD CONSTRAINT chk_review_has_rating CHECK (post_type != 'REVIEW' OR rating IS NOT NULL);

-- Step 2: Add indexes for performance
CREATE INDEX idx_posts_place_type ON posts(place_id, post_type, created_at);
CREATE INDEX idx_posts_type_created ON posts(post_type, created_at);
CREATE INDEX idx_posts_rating ON posts(rating) WHERE rating IS NOT NULL;

-- Step 3: Add post_count and review_count to places
ALTER TABLE places
ADD COLUMN post_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN review_count INTEGER DEFAULT 0 NOT NULL;

-- Step 4: Migrate existing reviews to posts
INSERT INTO posts (
    user_id, content, post_type, place_id, rating, 
    latitude, longitude, location_name, privacy, 
    view_count, created_at, updated_at
)
SELECT 
    r.user_id,
    r.content,
    'REVIEW' as post_type,
    r.place_id,
    r.rating,
    p.latitude,
    p.longitude,
    p.name as location_name,
    CASE WHEN r.is_public THEN 'PUBLIC' ELSE 'FRIENDS_ONLY' END as privacy,
    0 as view_count,
    r.created_at,
    r.created_at as updated_at
FROM reviews r
JOIN places p ON r.place_id = p.id;

-- Step 5: Update place counts
UPDATE places p
SET 
    post_count = (SELECT COUNT(*) FROM posts WHERE place_id = p.id),
    review_count = (SELECT COUNT(*) FROM posts WHERE place_id = p.id AND post_type = 'REVIEW');

-- Step 6: Mark reviews table as deprecated (don't drop yet for safety)
ALTER TABLE reviews RENAME TO reviews_deprecated;
COMMENT ON TABLE reviews_deprecated IS 'Deprecated - migrated to posts table. Safe to drop after verification.';
```

## Components and Interfaces

### Frontend Components

#### 1. PlacePickerModal

```typescript
interface PlacePickerModalProps {
  visible: boolean;
  currentLocation: { latitude: number; longitude: number };
  onSelectPlace: (place: PlaceSummary | null) => void;
  onClose: () => void;
}

// Features:
// - Search nearby places (5km radius)
// - Search by name with debounce
// - Display place cards with post count
// - "Vị trí hiện tại" option (no place)
// - Selected place highlight
```

#### 2. Enhanced CreatePostScreen

```typescript
interface CreatePostScreenState {
  content: string;
  postType: 'NORMAL' | 'REVIEW';
  selectedPlace: PlaceSummary | null;
  rating: number | null; // 1-5, required if postType === 'REVIEW'
  images: string[];
  privacy: PostPrivacy;
}

// New UI Elements:
// - Toggle "Đánh giá địa điểm" (switches to REVIEW mode)
// - Star rating selector (visible in REVIEW mode)
// - Place picker button
// - Selected place card with remove button
```

#### 3. Enhanced PostCard

```typescript
interface PostCardProps {
  post: UnifiedPost;
  onPress: (post: UnifiedPost) => void;
}

// Display Logic:
// - Show rating stars badge for REVIEW posts
// - Show place name as clickable link
// - Different styling for REVIEW vs NORMAL
// - "Đã đánh giá" badge for REVIEW posts
```

#### 4. PlacePostsTab (New)

```typescript
interface PlacePostsTabProps {
  placeId: number;
  sortBy: 'recent' | 'highest_rated' | 'most_liked';
}

// Features:
// - Display all posts at place (NORMAL + REVIEW)
// - Sort options
// - Empty state with CTA
// - Pull to refresh
```

### Backend Services

#### 1. Enhanced PostService

```java
@Service
public class PostService {
    
    /**
     * Create post with place relationship
     */
    public PostDTO createPost(CreatePostRequest request, UUID userId) {
        // Validate post type constraints
        if (request.getPostType() == PostType.REVIEW) {
            if (request.getPlaceId() == null) {
                throw new ValidationException("REVIEW posts require a place");
            }
            if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
                throw new ValidationException("REVIEW posts require rating 1-5");
            }
        }
        
        // Create post
        Post post = buildPost(request, userId);
        post = postRepository.save(post);
        
        // Update place counts and rating if REVIEW
        if (post.getPostType() == PostType.REVIEW && post.getPlace() != null) {
            placeService.incrementPostCount(post.getPlace().getId());
            placeService.incrementReviewCount(post.getPlace().getId());
            placeService.recalculateAverageRating(post.getPlace().getId());
        } else if (post.getPlace() != null) {
            placeService.incrementPostCount(post.getPlace().getId());
        }
        
        return PostDTO.from(post, userId);
    }
    
    /**
     * Get posts by place
     */
    public Page<PostDTO> getPostsByPlace(
        Long placeId, 
        PostType postType, // null = all, NORMAL, or REVIEW
        String sortBy,
        UUID currentUserId,
        Pageable pageable
    ) {
        // Query with filters
        Page<Post> posts = postRepository.findByPlaceIdAndType(
            placeId, postType, getSortFromString(sortBy), pageable
        );
        
        return posts.map(post -> PostDTO.from(post, currentUserId));
    }
}
```

#### 2. Enhanced PlaceService

```java
@Service
public class PlaceService {
    
    /**
     * Increment post count (called when post created)
     */
    @Transactional
    public void incrementPostCount(Long placeId) {
        placeRepository.incrementPostCount(placeId);
    }
    
    /**
     * Increment review count (called when REVIEW post created)
     */
    @Transactional
    public void incrementReviewCount(Long placeId) {
        placeRepository.incrementReviewCount(placeId);
    }
    
    /**
     * Recalculate average rating from all REVIEW posts
     */
    @Transactional
    public void recalculateAverageRating(Long placeId) {
        Double avgRating = postRepository.calculateAverageRatingForPlace(placeId);
        placeRepository.updateAverageRating(placeId, avgRating);
    }
    
    /**
     * Search places with post count filter
     */
    public PagedResponse<PlaceDTO> searchPlaces(
        String keyword,
        PlaceCategory category,
        Double minRating,
        Boolean hasPost, // NEW: filter by post_count > 0
        int page,
        int size
    ) {
        // Use post_count column for efficient filtering
        Page<Place> places = placeRepository.searchPlacesWithPostCount(
            keyword, category, minRating, hasPost, PageRequest.of(page, size)
        );
        
        return mapToPagedResponse(places);
    }
}
```

#### 3. ReviewServiceAdapter (Backward Compatibility)

```java
@Service
public class ReviewServiceAdapter {
    
    private final PostService postService;
    
    /**
     * Adapter for old Review API - converts to Post API
     * @deprecated Use PostService instead
     */
    @Deprecated
    public ReviewDTO createReview(CreateReviewRequest request, UUID userId) {
        // Convert to CreatePostRequest
        CreatePostRequest postRequest = CreatePostRequest.builder()
            .content(request.getContent())
            .postType(PostType.REVIEW)
            .placeId(request.getPlaceId())
            .rating(request.getRating())
            .privacy(request.getIsPublic() ? PostPrivacy.PUBLIC : PostPrivacy.FRIENDS_ONLY)
            .build();
        
        PostDTO post = postService.createPost(postRequest, userId);
        
        // Convert back to ReviewDTO for compatibility
        return ReviewDTO.fromPost(post);
    }
    
    /**
     * Get reviews for place - returns REVIEW posts
     * @deprecated Use PostService.getPostsByPlace with postType=REVIEW
     */
    @Deprecated
    public List<ReviewDTO> getReviewsForPlace(Long placeId, UUID userId) {
        Page<PostDTO> posts = postService.getPostsByPlace(
            placeId, PostType.REVIEW, "recent", userId, PageRequest.of(0, 100)
        );
        
        return posts.getContent().stream()
            .map(ReviewDTO::fromPost)
            .collect(Collectors.toList());
    }
}
```

## API Endpoints

### New/Updated Endpoints

```
POST   /api/posts
  Body: {
    content: string,
    postType: 'NORMAL' | 'REVIEW',
    placeId?: number,        // optional for NORMAL, required for REVIEW
    rating?: number,         // null for NORMAL, 1-5 for REVIEW
    latitude: number,
    longitude: number,
    locationName?: string,
    privacy: 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE',
    imageUrls: string[]
  }

GET    /api/posts/by-place/{placeId}
  Query: ?type=NORMAL|REVIEW&sortBy=recent|highest_rated|most_liked&page=0&size=20
  
GET    /api/places/search
  Query: ?keyword=...&category=...&minRating=...&hasPost=true&page=0&size=20
  Response: { content: PlaceDTO[], postCount included in each PlaceDTO }

GET    /api/places/{id}
  Response: PlaceDTO with postCount and reviewCount

// Deprecated but supported for backward compatibility
POST   /api/reviews (deprecated)
GET    /api/places/{id}/reviews (deprecated)
```

## UI/UX Flow

### Create Post Flow

```
1. User taps "Tạo bài đăng"
2. CreatePostScreen opens
3. User writes content
4. User taps "Chọn địa điểm" button
   ├─> PlacePickerModal opens
   ├─> Shows nearby places (5km)
   ├─> User can search by name
   ├─> User selects place OR "Vị trí hiện tại"
   └─> Modal closes, place shown in card
5. User toggles "Đánh giá địa điểm" (optional)
   ├─> If ON: postType = REVIEW
   ├─> Star rating selector appears
   ├─> Place becomes required
   └─> If OFF: postType = NORMAL
6. User selects images (optional)
7. User selects privacy
8. User taps "Đăng bài"
9. Post created with place_id and rating (if REVIEW)
```

### View Place Posts Flow

```
1. User taps place card or place name on post
2. PlaceDetailsScreen opens
3. User sees tabs: "Thông tin" | "Bài đăng" | "Đánh giá"
4. User taps "Bài đăng" tab
   ├─> Shows all posts (NORMAL + REVIEW)
   ├─> REVIEW posts have star badges
   ├─> Sort options: Mới nhất | Đánh giá cao nhất | Nhiều like nhất
   └─> Empty state: "Chưa có bài đăng. Đăng bài đầu tiên!"
5. User taps post to view details
```

## Performance Optimizations

### Database Indexes

```sql
-- Post queries by place
CREATE INDEX idx_posts_place_type ON posts(place_id, post_type, created_at);

-- Post queries by type
CREATE INDEX idx_posts_type_created ON posts(post_type, created_at);

-- Rating queries (for sorting)
CREATE INDEX idx_posts_rating ON posts(rating) WHERE rating IS NOT NULL;

-- Place search with post count
CREATE INDEX idx_places_post_count ON places(post_count) WHERE post_count > 0;
```

### Caching Strategy

```typescript
// Client-side caching
- Place search results: 5 minutes
- Place details: 10 minutes
- Place posts: 2 minutes
- Invalidate on post creation

// Server-side caching
- Place post counts: Redis, 1 minute TTL
- Average ratings: Redis, 5 minutes TTL
- Invalidate on post create/update/delete
```

## Migration Plan

### Phase 1: Database Migration (Day 1)
- Run V12 migration script
- Verify data integrity
- Keep reviews_deprecated table for rollback

### Phase 2: Backend Implementation (Days 2-3)
- Update Post entity and repository
- Implement PostService enhancements
- Create ReviewServiceAdapter
- Update PlaceService
- Add new API endpoints

### Phase 3: Frontend Implementation (Days 4-5)
- Create PlacePickerModal
- Update CreatePostScreen
- Update PostCard component
- Create PlacePostsTab
- Update post types

### Phase 4: Testing & Rollout (Days 6-7)
- Integration testing
- User acceptance testing
- Gradual rollout with feature flag
- Monitor metrics
- Deprecate old Review API

## Error Handling

### Validation Rules

```java
// Post creation validation
- REVIEW posts MUST have place_id
- REVIEW posts MUST have rating (1-5)
- NORMAL posts MAY have place_id
- NORMAL posts MUST NOT have rating
- All posts MUST have content
- All posts MUST have location (lat/lng)

// Error responses
400 Bad Request: Validation errors
404 Not Found: Place not found
409 Conflict: Duplicate review (optional constraint)
```

## Testing Strategy

### Unit Tests
- PostService.createPost() with NORMAL and REVIEW types
- PlaceService.recalculateAverageRating()
- ReviewServiceAdapter compatibility

### Integration Tests
- Create REVIEW post → verify place counts updated
- Delete REVIEW post → verify rating recalculated
- Search places with hasPost filter

### E2E Tests
- Complete create post flow with place selection
- View place posts tab
- Filter and sort place posts
