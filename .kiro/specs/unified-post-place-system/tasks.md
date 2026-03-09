# Implementation Tasks: Unified Post-Place System

## Phase 1: Database & Backend Foundation

- [-] 1. Database Migration



  - Create V12 migration script with new columns (post_type, place_id, rating)
  - Add constraints and indexes
  - Migrate existing reviews to posts table
  - Update place counts
  - _Requirements: 1.1, 3.1, 3.2, 3.3_


- [x] 2. Update Post Entity


  - Add PostType enum (NORMAL, REVIEW)
  - Add place_id foreign key relationship
  - Add rating field with validation
  - Add helper methods for type checking

  - _Requirements: 1.1, 1.2, 4.1_

- [x] 3. Update Place Entity



  - Add post_count field
  - Add review_count field
  - Add helper methods for count management
  - _Requirements: 5.1, 5.2, 7.1_

- [x] 4. Enhance PostRepository



  - Add findByPlaceIdAndType query method
  - Add calculateAverageRatingForPlace query
  - Add sorting options (recent, highest_rated, most_liked)
  - Update existing queries to handle new fields
  - _Requirements: 4.2, 4.3, 7.2, 9.1_

- [x] 5. Enhance PlaceRepository




  - Add incrementPostCount method
  - Add incrementReviewCount method
  - Add updateAverageRating method
  - Update searchPlaces to include post_count filter
  - _Requirements: 5.3, 5.4, 7.3, 9.2_

## Phase 2: Core Service Logic

- [ ] 6. Update PostService.createPost()

  - Add validation for REVIEW post constraints
  - Handle place_id and rating for REVIEW posts
  - Call PlaceService to update counts
  - Trigger rating recalculation for REVIEW posts
  - _Requirements: 1.2, 1.3, 4.5, 7.1_

- [ ] 7. Implement PostService.getPostsByPlace()

  - Query posts by place_id
  - Support filtering by post_type
  - Support sorting (recent, highest_rated, most_liked)
  - Apply privacy filters
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 8. Update PostService.deletePost()

  - Decrement place counts when post deleted
  - Recalculate rating if REVIEW post deleted
  - Handle cascade cleanup
  - _Requirements: 7.4_

- [ ] 9. Implement PlaceService count management

  - incrementPostCount() method
  - incrementReviewCount() method
  - decrementPostCount() method
  - decrementReviewCount() method
  - _Requirements: 5.3, 7.1_

- [ ] 10. Implement PlaceService.recalculateAverageRating()

  - Query all REVIEW posts for place
  - Calculate average rating
  - Update place.average_rating
  - Handle edge case: no reviews (set to NULL)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 11. Create ReviewServiceAdapter

  - Implement createReview() adapter method
  - Implement getReviewsForPlace() adapter method
  - Add @Deprecated annotations
  - Convert between Review and Post DTOs
  - _Requirements: 8.1, 8.2, 8.3_

## Phase 3: API Layer

- [ ] 12. Update PostController

  - Update POST /api/posts endpoint to accept new fields
  - Add GET /api/posts/by-place/{placeId} endpoint
  - Add validation for post type constraints
  - Update error responses
  - _Requirements: 1.1, 1.2, 4.1, 4.2_


- [ ] 13. Update PlaceController
  - Update GET /api/places/search to include hasPost filter
  - Update GET /api/places/{id} to return post counts
  - Ensure backward compatibility
  - _Requirements: 5.1, 5.2, 5.4_

- [ ] 14. Update DTOs

  - Add fields to PostDTO (postType, place, rating)
  - Add fields to PlaceDTO (postCount, reviewCount)
  - Create PlaceSummaryDTO for picker
  - Update CreatePostRequest
  - _Requirements: 1.1, 5.1, 6.2_

## Phase 4: Frontend - Core Components

- [ ] 15. Create PlacePickerModal component

  - Modal UI with search bar
  - Display nearby places (5km radius)
  - Search by name with debounce
  - Show place cards with post count badge
  - "Vị trí hiện tại" option
  - Selected place highlight
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 16. Create PlaceCard component (for picker)

  - Display place name, category, address
  - Show post count badge
  - Show rating stars
  - Selectable state styling
  - _Requirements: 2.1, 5.1_


- [ ] 17. Update CreatePostScreen
  - Add post type toggle "Đánh giá địa điểm"
  - Add place picker button
  - Add star rating selector (conditional)
  - Show selected place card with remove button
  - Validate REVIEW constraints before submit
  - _Requirements: 1.1, 1.2, 1.3, 2.5, 10.3, 10.4_

- [ ] 18. Create StarRatingSelector component

  - Interactive 1-5 star selector
  - Visual feedback on selection
  - Required indicator for REVIEW mode
  - _Requirements: 1.2, 10.4_

- [ ] 19. Update PostCard component

  - Display rating stars badge for REVIEW posts
  - Show place name as clickable link
  - Different styling for REVIEW vs NORMAL
  - "Đã đánh giá" badge for REVIEW posts
  - _Requirements: 6.1, 6.2, 6.3, 10.1, 10.2_

## Phase 5: Frontend - Place Integration


- [ ] 20. Create PlacePostsTab component
  - Tab in PlaceDetailsScreen
  - Display all posts at place (NORMAL + REVIEW)
  - Sort selector (Mới nhất, Đánh giá cao nhất, Nhiều like nhất)
  - Empty state with CTA "Đăng bài đầu tiên"
  - Pull to refresh
  - Pagination
  - _Requirements: 4.1, 4.2, 4.3, 4.4_


- [ ] 21. Update PlaceDetailsScreen
  - Add "Bài đăng" tab
  - Integrate PlacePostsTab
  - Update navigation
  - _Requirements: 4.1_

- [ ] 22. Update PlaceCard (search results)

  - Add post count badge
  - Show badge only if count > 0
  - Update styling
  - _Requirements: 5.1, 5.2_

- [ ] 23. Update place search filters

  - Add "Có bài đăng" filter toggle
  - Add "Nhiều bài đăng nhất" sort option
  - Update filter UI
  - _Requirements: 5.3, 5.4_

## Phase 6: Frontend - Feed Integration

- [ ] 24. Update feed display logic

  - Display both NORMAL and REVIEW posts
  - Chronological order by default
  - Different rendering for each type
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 25. Add feed filters

  - "Chỉ đánh giá" filter
  - "Chỉ bài thường" filter
  - Update filter UI
  - _Requirements: 6.5_

- [ ] 26. Update post navigation

  - Tapping place name navigates to place details
  - Deep linking support
  - _Requirements: 6.4_

## Phase 7: Services & State Management

- [ ] 27. Update post.service.ts

  - Add createPost with new fields
  - Add getPostsByPlace method
  - Update types
  - _Requirements: 1.1, 4.1_

- [ ] 28. Update location.service.ts

  - Add searchNearbyPlaces method
  - Add searchPlacesByName method
  - Update PlaceDTO types
  - _Requirements: 2.2, 2.3_


- [ ] 29. Create useCreatePost hook updates
  - Handle post type selection
  - Handle place selection
  - Handle rating input
  - Validation logic
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 30. Create usePlacePosts hook

  - Fetch posts by place
  - Handle sorting
  - Handle pagination
  - Cache management
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 31. Create usePlacePicker hook

  - Fetch nearby places
  - Search functionality
  - Selection state management
  - _Requirements: 2.1, 2.2, 2.3_

## Phase 8: Testing & Quality Assurance

- [ ]* 32. Backend unit tests
  - PostService.createPost() for NORMAL and REVIEW
  - PlaceService.recalculateAverageRating()
  - ReviewServiceAdapter compatibility
  - Validation logic tests
  - _Requirements: All_

- [ ]* 33. Backend integration tests
  - Create REVIEW post → verify counts updated
  - Delete REVIEW post → verify rating recalculated
  - Search places with hasPost filter
  - Migration script verification
  - _Requirements: 3.1, 4.5, 5.3, 7.1_

- [ ]* 34. Frontend component tests
  - PlacePickerModal interactions
  - StarRatingSelector
  - PostCard rendering for both types
  - CreatePostScreen validation
  - _Requirements: 1.1, 2.1, 6.1, 10.1_

- [ ]* 35. E2E tests
  - Complete create REVIEW post flow
  - Complete create NORMAL post with place flow
  - View place posts tab
  - Filter and sort place posts
  - _Requirements: All_

## Phase 9: Migration & Deployment

- [ ] 36. Run database migration
  - Execute V12 migration on staging
  - Verify data integrity
  - Check performance
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 37. Deploy backend changes
  - Deploy with feature flag OFF
  - Verify backward compatibility
  - Monitor error rates
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 38. Deploy frontend changes
  - Deploy with feature flag OFF
  - Gradual rollout (10% → 50% → 100%)
  - Monitor user feedback
  - _Requirements: All_

- [ ] 39. Enable feature flag
  - Enable for beta users first
  - Monitor metrics (post creation rate, errors)
  - Collect user feedback
  - _Requirements: All_

- [ ] 40. Deprecate old Review API
  - Add deprecation warnings
  - Update API documentation
  - Set sunset date (3 months)
  - Communicate to clients
  - _Requirements: 8.4, 8.5_

## Phase 10: Monitoring & Optimization

- [ ] 41. Set up monitoring
  - Track post creation by type
  - Track place post counts
  - Track rating calculation performance
  - Track API response times
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 42. Performance optimization
  - Add caching for place post counts
  - Add caching for average ratings
  - Optimize queries if needed
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 43. Documentation
  - Update API documentation
  - Create migration guide for clients
  - Update user help docs
  - Create internal runbook
  - _Requirements: All_

- [ ] 44. Final verification
  - Verify all requirements met
  - User acceptance testing
  - Performance benchmarks
  - Security audit
  - _Requirements: All_
