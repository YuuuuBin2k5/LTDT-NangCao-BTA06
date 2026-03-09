# Implementation Tasks: Advanced Feed Filters

## Overview
Triển khai hệ thống lọc bảng tin tiên tiến với 4 phases trong 8 tuần. Mỗi phase tập trung vào một nhóm tính năng cụ thể.

---

## Phase 1: Core Filters (Week 1-2)

### Backend Tasks

#### Task 1.1: Create Filter DTOs and Enums
**File:** `server/src/main/java/com/mapic/dto/feed/`
- [ ] Create `FilterType` enum (SOCIAL, LOCATION, CONTENT, TIME, ENGAGEMENT, DISCOVERY)
- [ ] Create `SocialFilterValue` enum (FRIENDS, FRIENDS_OF_FRIENDS, FOLLOWING, MUTUAL_FRIENDS)
- [ ] Create `LocationFilterValue` enum (NEARBY, MY_CITY, PLACES_VISITED, TRENDING_NEARBY)
- [ ] Create `TimeFilterValue` enum (TODAY, THIS_WEEK, THIS_MONTH, CUSTOM)
- [ ] Create `FilterConfigDTO` class with type, value, label, params
- [ ] Create `FeedRequestDTO` class with filters, page, size, sortBy
- [ ] Create `FeedResponseDTO` class with content, pagination, appliedFilters, suggestions

**Acceptance Criteria:**
- All DTOs have proper validation annotations
- Enums have Vietnamese labels for display
- DTOs are serializable to/from JSON

#### Task 1.2: Create FilterService
**File:** `server/src/main/java/com/mapic/service/FilterService.java`
- [ ] Create `FilterService` interface
- [ ] Implement `buildSpecification(List<FilterConfig> filters, UUID userId)` method
- [ ] Implement `buildSocialPredicate()` for friends filter
- [ ] Implement `buildLocationPredicate()` for nearby filter (using earthdistance)
- [ ] Implement `buildTimePredicate()` for today/week/month filters
- [ ] Implement `validateFilters()` to check for conflicts
- [ ] Implement `detectConflicts()` to find incompatible filter combinations

**Acceptance Criteria:**
- Filters combine with AND logic
- Social filter correctly queries friendship table
- Location filter uses PostgreSQL earthdistance extension
- Time filters handle timezone correctly
- Conflict detection prevents invalid combinations

#### Task 1.3: Update PostRepository
**File:** `server/src/main/java/com/mapic/repository/PostRepository.java`
- [ ] Add method `findAll(Specification<Post> spec, Pageable pageable)`
- [ ] Add custom query for friends feed with filters
- [ ] Add custom query for nearby posts with filters
- [ ] Add method to count posts matching filters

**Acceptance Criteria:**
- Repository supports JPA Specifications
- Queries are optimized with proper joins
- Methods return paginated results

#### Task 1.4: Update PostService
**File:** `server/src/main/java/com/mapic/service/PostService.java`
- [ ] Add method `getFeedWithFilters(FeedRequestDTO request, UUID userId)`
- [ ] Integrate FilterService to build specifications
- [ ] Apply filters to post queries
- [ ] Convert entities to DTOs with filter context

**Acceptance Criteria:**
- Service correctly applies all filters
- Returns paginated results
- Includes applied filters in response

#### Task 1.5: Update PostController
**File:** `server/src/main/java/com/mapic/controller/PostController.java`
- [ ] Update `GET /api/feed` endpoint to accept filter parameters
- [ ] Add query params: socialFilter, locationFilter, timeFilter, radius, startDate, endDate
- [ ] Parse filter params into FilterConfigDTO list
- [ ] Call PostService with filters
- [ ] Return FeedResponseDTO

**Acceptance Criteria:**
- Endpoint accepts all filter parameters
- Returns 400 for invalid filter combinations
- Returns 200 with filtered results
- Response includes applied filters

#### Task 1.6: Add Database Indexes
**File:** `server/src/main/resources/db/migration/V7__Add_feed_filter_indexes.sql`
- [ ] Create composite index on `posts(user_id, created_at DESC)`
- [ ] Create spatial index on `posts` using GIST for location queries
- [ ] Create index on `posts(privacy, created_at DESC)` for public posts
- [ ] Create index on `friendships(user_id, status)` for friend queries

**Acceptance Criteria:**
- Indexes improve query performance by >50%
- Explain plan shows index usage
- No performance regression on writes

### Frontend Tasks

#### Task 1.7: Create Filter Types and Interfaces
**File:** `client/src/features/posts/types/filter.types.ts`
- [ ] Create `FilterType` enum matching backend
- [ ] Create `FilterConfig` interface
- [ ] Create `FeedParams` interface
- [ ] Create `FeedResponse` interface
- [ ] Create `FilterPreset` interface

**Acceptance Criteria:**
- Types match backend DTOs exactly
- All fields are properly typed
- Enums have display labels

#### Task 1.8: Create useFeedFilters Hook
**File:** `client/src/features/posts/hooks/useFeedFilters.ts`
- [ ] Implement state management for active filters
- [ ] Implement `addFilter()` method with conflict detection
- [ ] Implement `removeFilter()` method
- [ ] Implement `clearFilters()` method
- [ ] Implement `toggleFilter()` method
- [ ] Add filter persistence to AsyncStorage
- [ ] Add conflict detection logic

**Acceptance Criteria:**
- Hook manages filter state correctly
- Detects and prevents conflicting filters
- Persists last used filters
- Provides clear API for components

#### Task 1.9: Update useFeedPosts Hook
**File:** `client/src/features/posts/hooks/useFeedPosts.ts`
- [ ] Add `filters` parameter to hook
- [ ] Update `loadPosts()` to include filters in API call
- [ ] Refetch when filters change
- [ ] Handle filter-specific errors
- [ ] Add loading states for filter changes

**Acceptance Criteria:**
- Hook accepts filter configuration
- Automatically refetches when filters change
- Shows loading state during filter application
- Handles errors gracefully

#### Task 1.10: Update feedService
**File:** `client/src/features/posts/services/post.service.ts`
- [ ] Update `getFeedPosts()` to accept filters parameter
- [ ] Build query params from filter configs
- [ ] Handle filter-specific API responses
- [ ] Add error handling for invalid filters

**Acceptance Criteria:**
- Service correctly serializes filters to query params
- Handles all filter types
- Returns typed responses

#### Task 1.11: Create FilterBar Component
**File:** `client/src/features/posts/components/FilterBar.tsx`
- [ ] Create horizontal scrollable filter chip bar
- [ ] Add quick access chips: "For You", "Friends", "Nearby", "+"
- [ ] Show active state for selected filters
- [ ] Add "+" button to open full filter sheet
- [ ] Add smooth scroll animations

**Acceptance Criteria:**
- Component renders horizontally scrollable chips
- Shows active state clearly
- Opens filter sheet on "+" press
- Smooth animations

#### Task 1.12: Create FilterBottomSheet Component
**File:** `client/src/features/posts/components/FilterBottomSheet.tsx`
- [ ] Create bottom sheet modal for filter selection
- [ ] Add sections: Social, Location, Time
- [ ] Add filter options with checkboxes/radio buttons
- [ ] Add "Apply" and "Clear" buttons
- [ ] Show active filter count
- [ ] Add conflict warnings

**Acceptance Criteria:**
- Sheet slides up smoothly
- All filter options are accessible
- Shows conflict warnings
- Applies filters on "Apply" press

#### Task 1.13: Create ActiveFiltersBar Component
**File:** `client/src/features/posts/components/ActiveFiltersBar.tsx`
- [ ] Display active filters as removable tags
- [ ] Add "X" button to remove individual filters
- [ ] Add "Clear All" button
- [ ] Show filter count
- [ ] Smooth remove animations

**Acceptance Criteria:**
- Shows all active filters
- Removes filter on "X" press
- Clears all on "Clear All" press
- Smooth animations

#### Task 1.14: Update FeedScreen
**File:** `client/app/(app)/(tabs)/feed.tsx`
- [ ] Integrate FilterBar component
- [ ] Integrate ActiveFiltersBar component
- [ ] Integrate FilterBottomSheet component
- [ ] Connect to useFeedFilters hook
- [ ] Pass filters to useFeedPosts hook
- [ ] Remove old filter tabs (Friends, Nearby, All)
- [ ] Add empty state for no results with filter suggestions

**Acceptance Criteria:**
- Screen shows new filter UI
- Filters work correctly
- Empty states are helpful
- Smooth transitions between filter states

---

## Phase 2: Advanced Filters (Week 3-4)

### Backend Tasks

#### Task 2.1: Add Content and Engagement Filters
**File:** `server/src/main/java/com/mapic/service/FilterService.java`
- [ ] Create `ContentFilterValue` enum (PHOTOS_ONLY, POPULAR, RECENT, LONG_POSTS, CHECK_INS)
- [ ] Create `EngagementFilterValue` enum (TRENDING, MOST_LIKED, MOST_DISCUSSED, VIRAL)
- [ ] Implement `buildContentPredicate()` for content filters
- [ ] Implement `buildEngagementPredicate()` for engagement filters
- [ ] Add engagement score calculation (time-decay algorithm)

**Acceptance Criteria:**
- Content filters work correctly
- Engagement filters use time-decay
- Popular posts are ranked properly

#### Task 2.2: Create FilterPreset Entity
**File:** `server/src/main/java/com/mapic/entity/FilterPreset.java`
- [ ] Create JPA entity with fields: id, userId, name, description, filters (JSONB), isDefault, isPublic, shareToken, usageCount
- [ ] Add timestamps (createdAt, updatedAt)
- [ ] Add indexes on userId and shareToken
- [ ] Add validation constraints

**Acceptance Criteria:**
- Entity maps to database correctly
- JSONB field stores filter configs
- Indexes improve query performance

#### Task 2.3: Create FilterPresetRepository
**File:** `server/src/main/java/com/mapic/repository/FilterPresetRepository.java`
- [ ] Create repository interface
- [ ] Add method `findByUserId(UUID userId)`
- [ ] Add method `findByShareToken(String token)`
- [ ] Add method `findByUserIdAndIsDefaultTrue(UUID userId)`

**Acceptance Criteria:**
- Repository provides all needed queries
- Methods return correct results

#### Task 2.4: Create FilterPresetService
**File:** `server/src/main/java/com/mapic/service/FilterPresetService.java`
- [ ] Implement `savePreset(CreatePresetDTO dto, UUID userId)`
- [ ] Implement `getPresets(UUID userId)`
- [ ] Implement `deletePreset(Long presetId, UUID userId)`
- [ ] Implement `sharePreset(Long presetId, UUID userId)` - generates share token
- [ ] Implement `applySharedPreset(String shareToken, UUID userId)`
- [ ] Add usage count tracking

**Acceptance Criteria:**
- Users can save custom presets
- Presets can be shared via token
- Usage is tracked correctly

#### Task 2.5: Create FilterPresetController
**File:** `server/src/main/java/com/mapic/controller/FilterPresetController.java`
- [ ] Add `GET /api/feed/presets` endpoint
- [ ] Add `POST /api/feed/presets` endpoint
- [ ] Add `DELETE /api/feed/presets/{id}` endpoint
- [ ] Add `POST /api/feed/presets/{id}/share` endpoint
- [ ] Add `GET /api/feed/presets/shared/{token}` endpoint

**Acceptance Criteria:**
- All endpoints work correctly
- Proper authorization checks
- Returns appropriate status codes

### Frontend Tasks

#### Task 2.6: Create useFilterPresets Hook
**File:** `client/src/features/posts/hooks/useFilterPresets.ts`
- [ ] Implement `loadPresets()` method
- [ ] Implement `savePreset(name, filters)` method
- [ ] Implement `deletePreset(presetId)` method
- [ ] Implement `applyPreset(presetId)` method
- [ ] Implement `sharePreset(presetId)` method
- [ ] Add local caching of presets

**Acceptance Criteria:**
- Hook manages presets correctly
- Presets sync with backend
- Local cache improves performance

#### Task 2.7: Create FilterPresetManager Component
**File:** `client/src/features/posts/components/FilterPresetManager.tsx`
- [ ] Display list of saved presets
- [ ] Add "Save Current" button
- [ ] Add delete button for each preset
- [ ] Add share button for each preset
- [ ] Add preset name input dialog
- [ ] Show usage count

**Acceptance Criteria:**
- Component shows all presets
- Users can save/delete/share presets
- UI is intuitive

#### Task 2.8: Update FilterBottomSheet with Presets
**File:** `client/src/features/posts/components/FilterBottomSheet.tsx`
- [ ] Add "Presets" tab
- [ ] Show saved presets
- [ ] Add "Save as Preset" button
- [ ] Add preset quick apply

**Acceptance Criteria:**
- Presets are accessible in filter sheet
- Quick apply works correctly

#### Task 2.9: Add Content and Engagement Filter Options
**File:** `client/src/features/posts/components/FilterBottomSheet.tsx`
- [ ] Add "Content" section with options: Photos Only, Popular, Recent, Long Posts, Check-ins
- [ ] Add "Engagement" section with options: Trending, Most Liked, Most Discussed, Viral
- [ ] Update filter logic to handle new types

**Acceptance Criteria:**
- All new filter options are available
- Filters work correctly
- UI is clear and organized

---

## Phase 3: AI/ML Features (Week 5-6)

### Backend Tasks

#### Task 3.1: Create UserInteraction Entity
**File:** `server/src/main/java/com/mapic/entity/UserInteraction.java`
- [ ] Create entity with fields: id, userId, postId, type (VIEW, LIKE, COMMENT, SHARE, SAVE), durationSeconds, timestamp
- [ ] Add indexes on (userId, timestamp) and (userId, postId)
- [ ] Add cascade delete on user/post deletion

**Acceptance Criteria:**
- Entity tracks all user interactions
- Indexes optimize queries
- Data integrity is maintained

#### Task 3.2: Create UserInteractionRepository
**File:** `server/src/main/java/com/mapic/repository/UserInteractionRepository.java`
- [ ] Add method `findByUserIdAndTimestampAfter(UUID userId, LocalDateTime after)`
- [ ] Add method `countByPostIdAndType(Long postId, InteractionType type)`
- [ ] Add method to get user's most interacted content types

**Acceptance Criteria:**
- Repository provides interaction queries
- Queries are optimized

#### Task 3.3: Create RecommendationService (Simple Version)
**File:** `server/src/main/java/com/mapic/service/RecommendationService.java`
- [ ] Implement simple collaborative filtering
- [ ] Track user's liked posts and hashtags
- [ ] Recommend posts similar to user's interests
- [ ] Implement "For You" feed algorithm
- [ ] Add diversity to prevent filter bubble

**Acceptance Criteria:**
- Recommendations are relevant
- Algorithm is fast (<100ms)
- Diverse content is included

#### Task 3.4: Implement Discovery Mode
**File:** `server/src/main/java/com/mapic/service/FilterService.java`
- [ ] Add Discovery filter type
- [ ] Implement logic to show posts outside user's network
- [ ] Prioritize popular posts from nearby users
- [ ] Add explanation for why post is shown
- [ ] Implement dismiss/not interested functionality

**Acceptance Criteria:**
- Discovery shows diverse content
- Explanations are clear
- User can dismiss unwanted content

#### Task 3.5: Add Interaction Tracking Endpoint
**File:** `server/src/main/java/com/mapic/controller/PostInteractionController.java`
- [ ] Add `POST /api/posts/{id}/view` endpoint
- [ ] Add `POST /api/posts/{id}/save` endpoint
- [ ] Track view duration
- [ ] Update interaction records

**Acceptance Criteria:**
- Interactions are tracked accurately
- Minimal performance impact
- Privacy is respected

### Frontend Tasks

#### Task 3.6: Implement Interaction Tracking
**File:** `client/src/features/posts/hooks/usePostTracking.ts`
- [ ] Create hook to track post views
- [ ] Track time spent viewing each post
- [ ] Send tracking data to backend
- [ ] Batch requests to reduce API calls
- [ ] Handle offline tracking

**Acceptance Criteria:**
- Views are tracked accurately
- Minimal battery/data usage
- Works offline

#### Task 3.7: Add "For You" Filter
**File:** `client/src/features/posts/components/FilterBar.tsx`
- [ ] Add "For You" as default filter
- [ ] Show personalized icon
- [ ] Add tooltip explaining personalization

**Acceptance Criteria:**
- "For You" is prominent
- Users understand it's personalized

#### Task 3.8: Add Discovery Mode
**File:** `client/src/features/posts/components/FilterBottomSheet.tsx`
- [ ] Add "Discovery" toggle in filter sheet
- [ ] Show explanation of discovery mode
- [ ] Add "Not Interested" button on discovery posts
- [ ] Show why post was recommended

**Acceptance Criteria:**
- Discovery mode is easy to enable
- Explanations are helpful
- Users can provide feedback

---

## Phase 4: Polish & Optimization (Week 7-8)

### Backend Tasks

#### Task 4.1: Implement Redis Caching
**File:** `server/src/main/java/com/mapic/config/CacheConfig.java`
- [ ] Configure Redis for filter result caching
- [ ] Implement dynamic TTL based on filter type
- [ ] Add cache key generation strategy
- [ ] Implement cache invalidation on new posts
- [ ] Add cache warming for popular filters

**Acceptance Criteria:**
- Cache hit rate >80%
- TTL is appropriate for each filter
- Invalidation works correctly

#### Task 4.2: Add Filter Analytics
**File:** `server/src/main/java/com/mapic/service/FilterAnalyticsService.java`
- [ ] Track filter usage by user
- [ ] Calculate most popular filter combinations
- [ ] Generate filter suggestions based on usage
- [ ] Provide insights API endpoint

**Acceptance Criteria:**
- Analytics are accurate
- Suggestions are relevant
- Privacy is maintained

#### Task 4.3: Performance Optimization
**File:** Multiple files
- [ ] Add query result caching
- [ ] Optimize N+1 queries with batch loading
- [ ] Add database connection pooling
- [ ] Implement query timeout limits
- [ ] Add slow query logging

**Acceptance Criteria:**
- P95 response time <500ms
- No N+1 query issues
- Database connections are managed efficiently

### Frontend Tasks

#### Task 4.4: Add Filter Insights Screen
**File:** `client/app/(app)/filter-insights.tsx`
- [ ] Create screen showing user's filter usage
- [ ] Display most used filters
- [ ] Show content type breakdown
- [ ] Add time-based trends
- [ ] Add privacy notice

**Acceptance Criteria:**
- Insights are visualized clearly
- Data is accurate
- Privacy is respected

#### Task 4.5: Implement Skeleton Loading
**File:** `client/src/features/posts/components/FeedSkeleton.tsx`
- [ ] Create skeleton component for feed loading
- [ ] Show skeleton during filter changes
- [ ] Smooth transition from skeleton to content
- [ ] Match actual content layout

**Acceptance Criteria:**
- Skeleton looks like real content
- Smooth transitions
- No layout shift

#### Task 4.6: Add Empty State Suggestions
**File:** `client/src/features/posts/components/EmptyFeedState.tsx`
- [ ] Show helpful message when no results
- [ ] Suggest alternative filters
- [ ] Show estimated result count for suggestions
- [ ] Add "Try this filter" quick action

**Acceptance Criteria:**
- Empty states are helpful
- Suggestions are relevant
- Quick actions work

#### Task 4.7: Implement Filter Sharing
**File:** `client/src/features/posts/components/FilterShareSheet.tsx`
- [ ] Create share sheet for filter presets
- [ ] Generate shareable link
- [ ] Add QR code option
- [ ] Handle incoming shared filters
- [ ] Show preview before applying shared filter

**Acceptance Criteria:**
- Sharing works across platforms
- Links are short and clean
- Preview is accurate

#### Task 4.8: Add Performance Monitoring
**File:** `client/src/shared/utils/performance.utils.ts`
- [ ] Track filter application time
- [ ] Monitor API response times
- [ ] Track cache hit rates
- [ ] Log slow operations
- [ ] Send metrics to analytics

**Acceptance Criteria:**
- Performance is monitored
- Slow operations are logged
- Metrics are actionable

---

## Testing Tasks

### Backend Testing

#### Task T.1: Unit Tests for FilterService
**File:** `server/src/test/java/com/mapic/service/FilterServiceTest.java`
- [ ] Test each filter type independently
- [ ] Test filter combinations
- [ ] Test conflict detection
- [ ] Test edge cases (empty filters, invalid params)

#### Task T.2: Property-Based Tests
**File:** `server/src/test/java/com/mapic/service/FilterServicePropertyTest.java`
- [ ] Property: All filtered posts match filter criteria
- [ ] Property: Cached results match fresh results
- [ ] Property: Filter combinations are commutative (where applicable)
- [ ] Property: Time filters respect boundaries

#### Task T.3: Integration Tests
**File:** `server/src/test/java/com/mapic/controller/FeedControllerIntegrationTest.java`
- [ ] Test full filter flow end-to-end
- [ ] Test with real database
- [ ] Test cache behavior
- [ ] Test performance under load

### Frontend Testing

#### Task T.4: Hook Tests
**File:** `client/src/features/posts/hooks/__tests__/useFeedFilters.test.ts`
- [ ] Test filter state management
- [ ] Test conflict detection
- [ ] Test persistence
- [ ] Test edge cases

#### Task T.5: Component Tests
**File:** `client/src/features/posts/components/__tests__/FilterBottomSheet.test.tsx`
- [ ] Test filter selection
- [ ] Test conflict warnings
- [ ] Test apply/clear actions
- [ ] Test accessibility

#### Task T.6: Integration Tests
**File:** `client/app/(app)/(tabs)/__tests__/feed.filters.test.tsx`
- [ ] Test complete filter flow
- [ ] Test filter + pagination
- [ ] Test filter + refresh
- [ ] Test error handling

---

## Documentation Tasks

#### Task D.1: API Documentation
- [ ] Document all filter endpoints in API.md
- [ ] Add request/response examples
- [ ] Document error codes
- [ ] Add usage examples

#### Task D.2: User Guide
- [ ] Create user guide for filters
- [ ] Add screenshots
- [ ] Explain each filter type
- [ ] Add tips for best results

#### Task D.3: Developer Guide
- [ ] Document filter architecture
- [ ] Explain caching strategy
- [ ] Add troubleshooting guide
- [ ] Document performance considerations

---

## Success Metrics

### Performance Metrics
- [ ] P95 filter application time <500ms
- [ ] Cache hit rate >80%
- [ ] API response time <200ms (p95)
- [ ] 60fps scroll performance

### User Metrics
- [ ] Filter usage rate >60% of users
- [ ] Average 2+ filters per session
- [ ] Preset creation rate >20%
- [ ] Discovery mode engagement >30%

### Quality Metrics
- [ ] Test coverage >80%
- [ ] Zero critical bugs in production
- [ ] <1% error rate on filter endpoints
- [ ] User satisfaction score >4.5/5

---

## Rollout Plan

### Week 1-2: Phase 1 Development
- Complete core filter implementation
- Internal testing

### Week 3-4: Phase 2 Development
- Add advanced filters and presets
- Beta testing with select users

### Week 5-6: Phase 3 Development
- Implement AI/ML features
- Gather feedback on recommendations

### Week 7-8: Phase 4 Polish
- Performance optimization
- Bug fixes
- Documentation

### Week 9: Production Rollout
- Deploy to production
- Monitor metrics
- Gather user feedback
- Iterate based on feedback

---

## Notes

- Prioritize Phase 1 for MVP - core filters are most important
- Phase 3 (AI/ML) can be simplified initially and improved over time
- Monitor performance closely - caching is critical for good UX
- Gather user feedback early and often
- Be prepared to adjust filter options based on usage data
