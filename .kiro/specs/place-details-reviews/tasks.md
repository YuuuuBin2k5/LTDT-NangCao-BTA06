# Implementation Plan - Place Details & Reviews with Permission Logic

- [x] 1. Set up backend database schema for reviews and friendships





  - Create Review entity with fields: id, place_id, user_id, content, rating, is_public, created_at
  - Create Friendship entity with fields: id, user_id_1, user_id_2, status, created_at
  - Create FriendshipStatus enum with values: PENDING, ACCEPTED, REJECTED, BLOCKED
  - Create database migration V4__Create_reviews_and_friendships_tables.sql with proper foreign keys and constraints
  - Add indexes: (place_id, is_public) on reviews, (user_id_1, status) and (user_id_2, status) on friendships
  - _Requirements: 4.1, 4.2, 5.1, 5.2_

- [x] 2. Implement backend friendship repository and service





  - Create FriendshipRepository interface extending JpaRepository
  - Implement custom query findAcceptedFriendshipsByUserId supporting both user_id columns
  - Implement custom query existsByUserIdsAndStatus for bidirectional friendship check
  - Create FriendshipService interface with getFriendIds and areFriends methods
  - Implement FriendshipServiceImpl with bidirectional friendship logic
  - _Requirements: 4.5, 5.3, 5.4, 5.5_

- [ ]* 2.1 Write property test for bidirectional friendship lookup
  - **Property 6: Bidirectional friendship lookup**
  - **Validates: Requirements 4.5, 5.3**

- [ ]* 2.2 Write property test for friendship status correctness
  - **Property 7: Friendship status correctness**
  - **Validates: Requirements 5.4, 5.5**


- [x] 3. Implement backend review repository




  - Create ReviewRepository interface extending JpaRepository
  - Implement findByPlaceIdAndIsPublicTrue query for public reviews
  - Implement findByPlaceIdAndIsPublicFalseAndUserIdIn query for friend private reviews
  - Add @EntityGraph or JOIN FETCH for author information to avoid N+1 queries
  - _Requirements: 4.3, 4.4_

- [x] 4. Implement critical review service with permission logic





  - Create ReviewDTO with fields: id, content, rating, isPublic, createdAt, authorId, authorName, authorAvatarUrl
  - Create ReviewService interface with getReviewsForPlace(Long placeId, UUID authenticatedUserId) method
  - Implement ReviewServiceImpl with three-step logic:
    1. Get all public reviews for place
    2. Get friend IDs of authenticated user via FriendshipService
    3. Get private reviews from friends only
  - Implement entity-to-DTO mapping excluding sensitive user data (email, phone, password)
  - _Requirements: 2.1, 2.2, 2.3, 4.3, 4.4, 6.5, 9.1, 10.1_

- [x] 4.1 Write property test for public reviews visibility






  - **Property 2: Public reviews visibility**
  - **Validates: Requirements 2.1, 4.3**

- [ ]* 4.2 Write property test for friend private reviews visibility
  - **Property 3: Friend private reviews visibility (CRITICAL)**
  - **Validates: Requirements 2.2, 4.4**

- [ ]* 4.3 Write property test for non-friend private reviews exclusion
  - **Property 4: Non-friend private reviews exclusion**
  - **Validates: Requirements 4.4**

- [ ]* 4.4 Write property test for review response completeness
  - **Property 5: Review response completeness**
  - **Validates: Requirements 2.3, 9.1**

- [ ]* 4.5 Write property test for sensitive data exclusion
  - **Property 10: Sensitive data exclusion**
  - **Validates: Requirements 6.5**


- [x] 5. Extend backend place service for details endpoint




  - Add getPlaceById(Long id) method to PlaceService interface
  - Implement method in PlaceServiceImpl to fetch place by ID
  - Update PlaceDTO to include coverImageUrl and address fields
  - Update Place entity if needed to include coverImageUrl and address fields
  - Add error handling for non-existent places (throw EntityNotFoundException)
  - Update mapToDTO method to include new fields
  - _Requirements: 1.1, 1.2_



- [x] 5.1 Write property test for place details completeness





  - **Property 1: Place details completeness**
  - **Validates: Requirements 1.1**

- [x] 6. Implement backend controller endpoints for place details and reviews




  - Add GET /api/v1/places/{id} endpoint to PlaceController
  - Add GET /api/v1/places/{id}/reviews endpoint to PlaceController with @AuthenticationPrincipal
  - Extract authenticated user from JWT token using @AuthenticationPrincipal User user
  - Add input validation and error handling (404 for place not found, 401 for missing auth)
  - Add @ExceptionHandler for EntityNotFoundException returning 404
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 6.1 Write property test for timestamp format validation
  - **Property 11: Timestamp format validation**
  - **Validates: Requirements 10.1**

- [ ]* 6.2 Write unit tests for controller endpoints
  - Test place details endpoint with valid and invalid IDs
  - Test reviews endpoint with authentication
  - Test reviews endpoint returns correct reviews based on friendship
  - Test 401 error when JWT is missing
  - _Requirements: 6.1, 6.2, 6.3_



- [x] 7. Checkpoint - Ensure all backend tests pass



  - Ensure all tests pass, ask the user if questions arise.


- [x] 8. Implement frontend API service methods




  - Add PlaceDetails interface extending Place with coverImageUrl and address fields
  - Add Review interface with id, content, rating, isPublic, createdAt, author fields
  - Add ReviewAuthor interface with id, name, avatarUrl fields
  - Add fetchPlaceDetails(placeId: number) function to location.service.ts
  - Add fetchPlaceReviews(placeId: number) function to location.service.ts
  - Add proper error handling and JWT token inclusion via apiClient
  - _Requirements: 8.1, 8.2_

- [x] 9. Create ReviewCard component





  - Create ReviewCard.tsx in src/features/map/components/
  - Create ReviewCardProps interface with review prop
  - Display author avatar as circular Image component with 40x40 size
  - Display author name with Text component, truncate with numberOfLines={1}
  - Display rating as star icons (★ for filled, ☆ for empty)
  - Display visibility icon: 🌎 for isPublic=true, 👥 for isPublic=false
  - Display review content with Text component
  - Display formatted timestamp using formatReviewTimestamp utility
  - Add default avatar placeholder for null/failed avatars
  - Style with card layout, padding, and borders
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 9.3, 9.4, 9.5_

- [ ]* 9.1 Write property test for visibility icon mapping
  - **Property 8: Visibility icon mapping**
  - **Validates: Requirements 3.1, 3.2**

- [ ]* 9.2 Write property test for ReviewCard completeness
  - **Property 9: ReviewCard completeness**
  - **Validates: Requirements 3.4**


- [x] 10. Implement timestamp formatting utilities



  - Add formatReviewTimestamp function to src/shared/utils/format.utils.ts
  - Implement relative time format for timestamps < 30 days old using date-fns or similar
  - Implement absolute date format for timestamps >= 30 days old (e.g., "Jan 15, 2026")
  - Support user locale and timezone
  - Handle invalid timestamps gracefully
  - _Requirements: 10.2, 10.3, 10.4_

- [ ]* 10.1 Write property test for relative time formatting
  - **Property 12: Relative time formatting**
  - **Validates: Requirements 10.2**





- [ ] 11. Create place details screen with dynamic routing

  - Create app/(app)/place/[id].tsx file
  - Extract place ID from route params using useLocalSearchParams
  - Create PlaceHeader component displaying cover image, name, address, category badge, average rating
  - Create two-section layout: PlaceHeader at top, reviews list below
  - Add ScrollView or FlatList as container




  - Add visual separator (View with border) between sections
  - Add loading states for place info and reviews
  - Add error states with retry buttons
  - _Requirements: 1.4, 7.1, 7.2, 7.5_

- [ ] 12. Integrate API calls in place details screen

  - Call fetchPlaceDetails on screen mount using useEffect
  - Call fetchPlaceReviews on screen mount using useEffect
  - Store place details in state using useState
  - Store reviews in state using useState
  - Display loading skeletons while API calls are in progress
  - Handle errors with error messages and retry buttons
  - Display "No reviews available" message when reviews array is empty
  - _Requirements: 8.3, 8.4, 8.5, 2.5_





- [ ]* 12.1 Write property test for screen mount API calls
  - **Property 13: Screen mount API calls**
  - **Validates: Requirements 8.3**

- [x]* 12.2 Write property test for loading state display




  - **Property 14: Loading state display**
  - **Validates: Requirements 8.4**

- [ ] 13. Implement reviews list display

  - Use FlatList component for reviews with keyExtractor={(item) => item.id.toString()}

  - Render ReviewCard for each review in renderItem
  - Implement pull-to-refresh using refreshControl prop
  - Wrap ReviewCard with React.memo for optimization
  - Add empty state component when reviews.length === 0
  - Add proper spacing between review cards
  - _Requirements: 2.4, 7.3_

- [ ] 14. Implement navigation to place details

  - Update PlaceMarker component to navigate to /place/[id] on press
  - Update PlaceCard component to navigate to /place/[id] on press
  - Use router.push from expo-router with place ID parameter
  - Test navigation from map markers
  - Test navigation from search results
  - _Requirements: 1.5_

- [x] 15. Add performance optimizations





  - Implement parallel loading of place details and reviews using Promise.all
  - Add image caching for avatars using expo-image or similar
  - Add image caching for cover images
  - Implement lazy loading for images with placeholder
  - Use getItemLayout for FlatList if items have fixed height
  - _Requirements: Performance considerations_





- [ ] 16. Final checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.
