# Implementation Plan - Friends Tab & User Search

## Backend Implementation

- [x] 1. Create ProfileVisibility enum and update User entity




  - Create ProfileVisibility enum in server/src/main/java/com/mapic/entity/ with values: PUBLIC, PRIVATE, FRIENDS_ONLY
  - Add profileVisibility field to User entity with @Enumerated(EnumType.STRING)
  - Set default value to PUBLIC using @Builder.Default
  - _Requirements: 2.4, 2.5_


- [x] 2. Create database migration for profile_visibility





  - Create V6__Add_profile_visibility_to_users.sql migration file
  - Add profile_visibility column to users table with VARCHAR(20) NOT NULL DEFAULT 'PUBLIC'
  - Add CHECK constraint for valid enum values
  - Create composite index on (profile_visibility, nick_name) for search optimization
  - Create index on username for search optimization
  - _Requirements: 2.4, 2.5_


- [x] 3. Create UserSearchResultDTO



  - Create UserSearchResultDTO in server/src/main/java/com/mapic/dto/
  - Include fields: id (UUID), name (nickName), username, avatarUrl, friendshipStatus, friendshipId
  - Exclude sensitive fields: email, phone, password
  - Add builder pattern with Lombok
  - _Requirements: 3.1, 3.2, 7.5_

- [x] 4. Create FriendshipDTO





  - Create FriendshipDTO in server/src/main/java/com/mapic/dto/
  - Include fields: id, userId1, userId2, status, createdAt
  - Add builder pattern with Lombok
  - _Requirements: 5.2, 8.5_


- [x] 5. Implement user search in UserRepository



  - Add searchPublicUsers method to UserRepository
  - Implement @Query with LIKE pattern matching on nickName and username (case-insensitive)
  - Add WHERE clause to filter only PUBLIC profile visibility
  - Use parameterized queries to prevent SQL injection
  - _Requirements: 1.1, 1.2, 1.3, 7.4_



- [x] 5.1 Write property test for keyword search matching




  - **Property 1: Keyword search matching**

  - **Validates: Requirements 1.1**




- [x] 5.2 Write property test for SQL injection prevention



  - **Property 2: SQL injection prevention**
  - **Validates: Requirements 1.2**




- [x] 5.3 Write property test for public profile visibility





  - **Property 3: Public profile visibility**

  - **Validates: Requirements 1.3, 2.1**


- [x] 5.4 Write property test for private profile exclusion















  - **Property 4: Private profile exclusion**
  - **Validates: Requirements 2.2**






- [x] 5.5 Write property test for friends-only profile exclusion

  - **Property 5: Friends-only profile exclusion**
  - **Validates: Requirements 2.3**


















- [ ] 6. Extend FriendshipService interface and implementation

  - Add sendFriendRequest(UUID fromUserId, UUID toUserId) method to interface


  - Add deleteFriendship(Long friendshipId, UUID userId) method to interface
  - Add getFriendshipStatus(UUID userId1, UUID userId2) method to interface





  - Implement sendFriendRequest: validate not self, check duplicates, create PENDING friendship
  - Implement deleteFriendship: verify authorization, delete record
  - Implement getFriendshipStatus: return status or null if no friendship exists
  - _Requirements: 5.2, 5.3, 5.4, 6.4, 8.3, 8.4_


- [-] 6.1 Write property test for friend request creation



  - **Property 10: Friend request creation**
  - **Validates: Requirements 5.2, 5.3**

- [ ] 6.2 Write property test for friendship deletion




  - **Property 12: Friendship deletion**
  - **Validates: Requirements 6.4**






- [ ] 6.3 Write unit tests for friendship service edge cases
  - Test self friend request throws BadRequestException
  - Test duplicate friend request throws ConflictException
  - Test unauthorized deletion throws ForbiddenException
  - Test user not found throws NotFoundException



  - _Requirements: 8.3, 8.4_

- [x] 7. Implement user search in UserService

  - Add searchUsers(String keyword, UUID authenticatedUserId) method
  - Call userRepository.searchPublicUsers(keyword)


  - For each result, call friendshipService.getFriendshipStatus()
  - Map to UserSearchResultDTO with all required fields
  - Ensure sensitive fields are excluded
  - _Requirements: 3.1, 3.2, 4.1, 4.2, 4.3, 7.5_

- [x] 7.1 Write property test for search result completeness

  - **Property 6: Search result completeness**
  - **Validates: Requirements 3.1**
  - **PBT Status: passed** ✅
















- [-] 7.2 Write property test for sensitive data exclusion

  - **Property 7: Sensitive data exclusion**
  - **Validates: Requirements 3.2, 7.5**


  - **PBT Status: passed** ✅








- [x] 7.3 Write property test for friendship status inclusion

  - **Property 8: Friendship status inclusion**
  - **Validates: Requirements 4.1, 4.3**
  - **PBT Status: passed** ✅

- [x] 8. Create FriendshipController








  - Create FriendshipController in server/src/main/java/com/mapic/controller/



  - Add POST /api/v1/friendships endpoint for sending friend requests


  - Add DELETE /api/v1/friendships/{friendshipId} endpoint

  - Require JWT authentication with @AuthenticationPrincipal
  - Add error handling for BadRequest, Conflict, Forbidden, NotFound
  - Return appropriate HTTP status codes and messages
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_




- [-] 9. Add user search endpoint to UserController


  - Add GET /api/v1/users/search endpoint to existing UserController
  - Accept query parameter: keyword
  - Require JWT authentication with @AuthenticationPrincipal
  - Call userService.searchUsers(keyword, user.getId())


  - Return List<UserSearchResultDTO>

  - Add error handling













  - _Requirements: 7.1, 7.2, 7.3_


- [ ] 9.1 Write unit tests for controller endpoints







  - Test search endpoint with valid keywords
  - Test search requires authentication (401 without token)
  - Test friend request endpoint with valid data


  - Test friend request validates self-request (400)
  - Test delete endpoint with authorization (403 for unauthorized)
  - _Requirements: 7.1, 7.2, 7.3, 8.1, 8.2_

- [ ] 10. Checkpoint - Ensure all backend tests pass

  - Run all backend tests with mvn test
  - Ensure all tests pass, ask the user if questions arise

## Frontend Implementation

- [ ] 11. Create friendship types

  - Create friendship.types.ts in client/src/shared/types/
  - Define UserSearchResult interface with id, name, username, avatarUrl, friendshipStatus, friendshipId
  - Define FriendshipStatus enum: PENDING, ACCEPTED, REJECTED, BLOCKED
  - Define FriendAction enum: ADD_FRIEND, CANCEL_REQUEST, UNFRIEND
  - Export from client/src/shared/types/index.ts
  - _Requirements: 3.1, 4.1_


- [ ] 12. Implement friendship service
  - Create friendship/ directory in client/src/services/
  - Create friendship.service.ts with searchUsers, sendFriendRequest, deleteFriendship functions
  - Use apiClient from src/services/api/client.ts for HTTP requests
  - Add JWT token to all requests (handled by apiClient)
  - Add proper error handling and response parsing
  - Create index.ts to export service functions
  - _Requirements: 12.2, 12.3, 12.5_

- [ ] 13. Implement useUserSearch custom hook with debounce

  - Create useUserSearch.ts in client/src/features/profile/hooks/
  - Implement state management for: users, isLoading, error, searchKeyword
  - Add debounce logic with 500ms delay using useEffect and setTimeout
  - Implement request cancellation with AbortController for previous searches
  - Clear results when search bar is empty
  - Add refresh function
  - Export from hooks/index.ts
  - _Requirements: 1.4, 11.1, 11.2, 11.3, 11.4, 11.5, 12.4_


- [ ] 13.1 Write property test for debounce timing
  - **Property 14: Debounce timing**
  - **Validates: Requirements 1.4, 11.1, 11.2, 11.3**

- [x] 13.2 Write property test for request cancellation

  - **Property 15: Request cancellation**
  - **Validates: Requirements 11.4**
  - **PBT Status: passed** ✅


- [ ] 14. Implement useFriendshipActions custom hook
  - Create useFriendshipActions.ts in client/src/features/profile/hooks/
  - Implement sendFriendRequest function with optimistic UI update
  - Implement cancelRequest function (calls deleteFriendship)
  - Implement unfriend function (calls deleteFriendship)
  - Add loading state management per action
  - Show toast notifications on success/failure using Alert or toast library
  - Export from hooks/index.ts
  - _Requirements: 5.1, 6.3, 10.4, 10.5, 12.4_

- [ ] 14.1 Write property test for toast notification on action

  - **Property 17: Toast notification on action**
  - **Validates: Requirements 10.5**

- [ ] 15. Create UserListItem component

  - Create UserListItem.tsx in client/src/features/profile/components/
  - Display circular avatar using Image component with fallback for failed loads
  - Display name (nickName) and username in Text components
  - Render action button based on friendship status (Add Friend, Cancel Request, Unfriend)
  - Accept onFriendAction callback prop
  - Add loading state for button during actions (disable button, show ActivityIndicator)
  - Use React.memo for performance optimization
  - Export from components/index.ts
  - _Requirements: 3.4, 3.5, 4.4, 4.5, 9.4, 9.5_


- [ ] 15.1 Write property test for action button mapping
  - **Property 9: Action button mapping**
  - **Validates: Requirements 4.4, 4.5, 6.1, 6.2**


- [ ] 16. Implement friends tab screen with search
  - Update client/app/(app)/(tabs)/friends.tsx
  - Add TextInput as SearchBar in header with placeholder "Search users..."
  - Integrate useUserSearch hook
  - Integrate useFriendshipActions hook
  - Display ActivityIndicator when isLoading is true
  - Display "No users found" message when results are empty and not loading
  - Display error message with retry button on error
  - _Requirements: 9.1, 9.2, 10.1, 10.2, 10.3, 12.1_

- [ ] 17. Implement user results list with FlatList

  - Use FlatList component to render search results in friends tab
  - Set keyExtractor to (item) => item.id.toString()
  - Render UserListItem for each user
  - Implement getItemLayout for performance (fixed height items)
  - Add windowSize prop for optimization
  - _Requirements: 9.3_

- [ ] 18. Integrate friendship actions in friends tab

  - Connect UserListItem onFriendAction to useFriendshipActions
  - Handle ADD_FRIEND action: call sendFriendRequest with userId
  - Handle CANCEL_REQUEST action: call cancelRequest with friendshipId
  - Handle UNFRIEND action: call unfriend with friendshipId
  - Update local state optimistically before API call
  - Revert on error and show error toast
  - _Requirements: 5.1, 5.5, 6.3, 6.5_

- [ ] 18.1 Write property test for friend request UI update

  - **Property 11: Friend request UI update**
  - **Validates: Requirements 5.5**


- [ ] 18.2 Write property test for unfriend UI update
  - **Property 13: Unfriend UI update**
  - **Validates: Requirements 6.5**


- [ ] 18.3 Write property test for loading state display
  - **Property 16: Loading state display**
  - **Validates: Requirements 1.5, 10.1, 10.4**

- [ ] 19. Add performance optimizations

  - Verify AbortController is used for request cancellation in useUserSearch
  - Add useMemo for search results filtering if needed
  - Verify FlatList has windowSize prop set (default 21 is good)
  - Verify React.memo is used on UserListItem
  - Test avatar image caching (React Native Image handles this by default)
  - _Requirements: Performance considerations_

- [ ] 20. Final checkpoint - Ensure all tests pass

  - Run all frontend tests with npm test
  - Ensure all tests pass, ask the user if questions arise
