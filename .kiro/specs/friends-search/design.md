# Design Document - Friends Tab & User Search

## Overview

This module provides user discovery and friendship management capabilities with strong privacy controls. Users can search for others based on name or username, but only those with public profiles appear in results. The system supports sending friend requests, canceling requests, and unfriending, with real-time UI updates reflecting friendship status changes.

## Architecture

### Backend Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Controller Layer                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │  UserController                                    │  │
│  │  - GET /api/v1/users/search                        │  │
│  │                                                     │  │
│  │  FriendshipController                              │  │
│  │  - POST /api/v1/friendships                        │  │
│  │  - DELETE /api/v1/friendships/{id}                 │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│                   Service Layer                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  UserService                                       │  │
│  │  - searchPublicUsers(keyword, authenticatedUserId) │  │
│  │  - enrichWithFriendshipStatus()                    │  │
│  │                                                     │  │
│  │  FriendshipService                                 │  │
│  │  - sendFriendRequest(fromUserId, toUserId)         │  │
│  │  - deleteFriendship(friendshipId, userId)          │  │
│  │  - getFriendshipStatus(userId1, userId2)           │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│                Repository Layer                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  UserRepository                                    │  │
│  │  FriendshipRepository                              │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Screen Layer                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  app/(app)/(tabs)/friends.tsx                      │  │
│  │  - SearchBar in header                             │  │
│  │  - FlatList of UserListItem                        │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│                 Component Layer                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  src/features/profile/components/                  │  │
│  │  - UserListItem.tsx                                │  │
│  │  - FriendActionButton.tsx                          │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│                  Hooks Layer                              │
│  ┌────────────────────────────────────────────────────┐  │
│  │  src/features/profile/hooks/                       │  │
│  │  - useUserSearch.ts (with debounce)                │  │
│  │  - useFriendshipActions.ts                         │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│                  Service Layer                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │  src/services/friendship/friendship.service.ts     │  │
│  │  - searchUsers(keyword)                            │  │
│  │  - sendFriendRequest(userId)                       │  │
│  │  - deleteFriendship(friendshipId)                  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Backend Components

#### 1. User Entity (Extended)

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String phone;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "profile_visibility", nullable = false)
    private ProfileVisibility profileVisibility = ProfileVisibility.PUBLIC;
    
    // Other fields...
}

public enum ProfileVisibility {
    PUBLIC, PRIVATE, FRIENDS_ONLY
}
```

#### 2. UserRepository

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    @Query("SELECT u FROM User u WHERE " +
           "u.profileVisibility = 'PUBLIC' AND " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<User> searchPublicUsers(@Param("keyword") String keyword);
}
```

#### 3. UserService

```java
public interface UserService {
    List<UserSearchResultDTO> searchUsers(String keyword, Long authenticatedUserId);
}

@Service
public class UserServiceImpl implements UserService {
    
    @Override
    public List<UserSearchResultDTO> searchUsers(String keyword, Long authenticatedUserId) {
        // Step 1: Search public users
        List<User> users = userRepository.searchPublicUsers(keyword);
        
        // Step 2: Enrich with friendship status
        return users.stream()
            .map(user -> {
                FriendshipStatus status = friendshipService
                    .getFriendshipStatus(authenticatedUserId, user.getId());
                return convertToDTO(user, status);
            })
            .collect(Collectors.toList());
    }
}
```

#### 4. UserSearchResultDTO

```java
public class UserSearchResultDTO {
    private Long id;
    private String name;
    private String username;
    private String avatarUrl;
    private FriendshipStatus friendshipStatus; // null, PENDING, ACCEPTED, etc.
    private Long friendshipId; // For delete operations
    
    // Getters, setters
}
```

#### 5. FriendshipService (Extended)

```java
public interface FriendshipService {
    FriendshipDTO sendFriendRequest(Long fromUserId, Long toUserId);
    void deleteFriendship(Long friendshipId, Long userId);
    FriendshipStatus getFriendshipStatus(Long userId1, Long userId2);
}

@Service
public class FriendshipServiceImpl implements FriendshipService {
    
    @Override
    public FriendshipDTO sendFriendRequest(Long fromUserId, Long toUserId) {
        // Validate: cannot send to self
        if (fromUserId.equals(toUserId)) {
            throw new BadRequestException("Cannot send friend request to yourself");
        }
        
        // Check for existing friendship
        if (friendshipRepository.existsByUserIds(fromUserId, toUserId)) {
            throw new ConflictException("Friend request already exists");
        }
        
        // Create new friendship
        Friendship friendship = new Friendship();
        friendship.setUserId1(fromUserId);
        friendship.setUserId2(toUserId);
        friendship.setStatus(FriendshipStatus.PENDING);
        friendship.setCreatedAt(LocalDateTime.now());
        
        return convertToDTO(friendshipRepository.save(friendship));
    }
    
    @Override
    public void deleteFriendship(Long friendshipId, Long userId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
            .orElseThrow(() -> new NotFoundException("Friendship not found"));
        
        // Verify user is part of this friendship
        if (!friendship.getUserId1().equals(userId) && 
            !friendship.getUserId2().equals(userId)) {
            throw new ForbiddenException("Not authorized to delete this friendship");
        }
        
        friendshipRepository.delete(friendship);
    }
}
```

### Frontend Components

#### 1. UserListItem Component

```typescript
interface UserListItemProps {
  user: UserSearchResult;
  onFriendAction: (userId: number, action: FriendAction) => void;
  isLoading?: boolean;
}

interface UserSearchResult {
  id: number;
  name: string;
  username: string;
  avatarUrl: string | null;
  friendshipStatus: FriendshipStatus | null;
  friendshipId: number | null;
}

enum FriendAction {
  ADD_FRIEND = 'ADD_FRIEND',
  CANCEL_REQUEST = 'CANCEL_REQUEST',
  UNFRIEND = 'UNFRIEND'
}

// Component renders:
// - Circular avatar
// - Name and username
// - Action button based on friendship status
```

#### 2. useUserSearch Hook

```typescript
interface UseUserSearchReturn {
  users: UserSearchResult[];
  isLoading: boolean;
  error: Error | null;
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
  refresh: () => void;
}

function useUserSearch(): UseUserSearchReturn {
  // Implements debounce logic (500ms)
  // Manages search state
  // Cancels previous requests
}
```

#### 3. useFriendshipActions Hook

```typescript
interface UseFriendshipActionsReturn {
  sendFriendRequest: (userId: number) => Promise<void>;
  cancelRequest: (friendshipId: number) => Promise<void>;
  unfriend: (friendshipId: number) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

function useFriendshipActions(): UseFriendshipActionsReturn {
  // Handles friend request actions
  // Shows toast notifications
  // Updates local state optimistically
}
```

#### 4. Friendship Service Methods

```typescript
interface SendFriendRequestResponse {
  friendshipId: number;
  status: FriendshipStatus;
}

async function searchUsers(keyword: string): Promise<UserSearchResult[]>;
async function sendFriendRequest(userId: number): Promise<SendFriendRequestResponse>;
async function deleteFriendship(friendshipId: number): Promise<void>;
```

## Data Models

### UserSearchResult Model

```typescript
interface UserSearchResult {
  id: number;
  name: string;
  username: string;
  avatarUrl: string | null;
  friendshipStatus: FriendshipStatus | null;
  friendshipId: number | null;
}

enum FriendshipStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  BLOCKED = 'BLOCKED'
}
```

### ProfileVisibility Model

```typescript
enum ProfileVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  FRIENDS_ONLY = 'FRIENDS_ONLY'
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Keyword search matching
*For any* search keyword and user database, all returned results should have the keyword in their name or username (case-insensitive).
**Validates: Requirements 1.1**

### Property 2: SQL injection prevention
*For any* search query containing SQL special characters, the system should sanitize the input and execute safely without SQL errors.
**Validates: Requirements 1.2**

### Property 3: Public profile visibility
*For any* search query, all returned results should have profile_visibility set to PUBLIC.
**Validates: Requirements 1.3, 2.1**

### Property 4: Private profile exclusion
*For any* user with profile_visibility set to PRIVATE, that user should never appear in any search results.
**Validates: Requirements 2.2**

### Property 5: Friends-only profile exclusion
*For any* user with profile_visibility set to FRIENDS_ONLY, that user should not appear in search results for non-friends.
**Validates: Requirements 2.3**

### Property 6: Search result completeness
*For any* search result, it should contain all required fields: id, name, username, and avatarUrl.
**Validates: Requirements 3.1**

### Property 7: Sensitive data exclusion
*For any* search result, it should never contain sensitive fields such as email, phone, or password hash.
**Validates: Requirements 3.2, 7.5**

### Property 8: Friendship status inclusion
*For any* search result, it should include the friendship status between the authenticated user and the result user.
**Validates: Requirements 4.1, 4.3**

### Property 9: Action button mapping
*For any* search result displayed in UI, the action button should match the friendship status: "Add Friend" for null/NONE, "Cancel Request" for PENDING (if requester), "Unfriend" for ACCEPTED.
**Validates: Requirements 4.4, 4.5, 6.1, 6.2**

### Property 10: Friend request creation
*For any* valid friend request (not to self, not duplicate), a Friendship record with status PENDING should be created with authenticated user as user_id_1.
**Validates: Requirements 5.2, 5.3**

### Property 11: Friend request UI update
*For any* successful friend request, the UI button should update to show "Request Sent" or "Pending".
**Validates: Requirements 5.5**

### Property 12: Friendship deletion
*For any* delete friendship request, the Friendship record should be removed from the database.
**Validates: Requirements 6.4**

### Property 13: Unfriend UI update
*For any* successful friendship deletion, the UI button should update back to "Add Friend".
**Validates: Requirements 6.5**

### Property 14: Debounce timing
*For any* sequence of rapid input changes within 500ms, only the final value should trigger an API request after the debounce period.
**Validates: Requirements 1.4, 11.1, 11.2, 11.3**

### Property 15: Request cancellation
*For any* new search triggered, any pending previous search requests should be cancelled.
**Validates: Requirements 11.4**

### Property 16: Loading state display
*For any* API call in progress, the frontend should display loading indicators (ActivityIndicator or disabled button).
**Validates: Requirements 1.5, 10.1, 10.4**

### Property 17: Toast notification on action
*For any* friend request or unfriend action completion (success or failure), a toast notification should be displayed.
**Validates: Requirements 10.5**

## Error Handling

### Backend Error Handling

1. **Invalid Search Input**
   - Sanitize all input to prevent SQL injection
   - Return empty array for invalid keywords
   - Log suspicious patterns

2. **Self Friend Request**
   - Return 400 Bad Request with message: "Cannot send friend request to yourself"
   - Validate before database operation

3. **Duplicate Friend Request**
   - Return 409 Conflict with message: "Friend request already exists"
   - Check existing friendships before creating

4. **Unauthorized Friendship Deletion**
   - Return 403 Forbidden if user is not part of the friendship
   - Verify user ID matches either user_id_1 or user_id_2

5. **User Not Found**
   - Return 404 for invalid user IDs in friend requests
   - Validate both users exist before creating friendship

### Frontend Error Handling

1. **Network Errors**
   - Display: "Unable to search users. Please check your connection."
   - Provide retry button
   - Show cached results if available

2. **Empty Search Results**
   - Display: "No users found"
   - Suggest trying different keywords

3. **Friend Request Errors**
   - Parse error message from backend
   - Show toast with specific error (e.g., "Friend request already sent")
   - Revert button state on error

4. **Authentication Errors**
   - Redirect to login if 401 received
   - Preserve search state for post-login

5. **Avatar Loading Failures**
   - Use default avatar placeholder
   - Don't block UI rendering

## Testing Strategy

### Unit Testing

**Backend Unit Tests:**
- Test UserRepository.searchPublicUsers with various keywords
- Test profile visibility filtering
- Test FriendshipService.sendFriendRequest with valid and invalid inputs
- Test FriendshipService.deleteFriendship with authorization checks
- Test DTO mapping excludes sensitive fields

**Frontend Unit Tests:**
- Test useUserSearch hook with debounce
- Test useFriendshipActions hook state management
- Test UserListItem component rendering
- Test action button logic based on friendship status
- Test API service methods with mocked responses

### Property-Based Testing

The module will use **jqwik** for Java backend testing and **fast-check** for TypeScript frontend testing. Each property-based test should run a minimum of 100 iterations.

**Backend Property Tests:**
- Property 1: Generate random keywords and users, verify keyword matching
- Property 2: Generate SQL injection patterns, verify safe execution
- Property 3: Generate users with different visibility, verify only PUBLIC in results
- Property 4: Generate PRIVATE users, verify never in results
- Property 5: Generate FRIENDS_ONLY users, verify exclusion for non-friends
- Property 6: Generate search results, verify field completeness
- Property 7: Generate search results, verify no sensitive data
- Property 8: Generate user pairs, verify friendship status inclusion
- Property 10: Generate friend requests, verify PENDING creation
- Property 12: Generate friendships, verify deletion

**Frontend Property Tests:**
- Property 9: Generate friendship statuses, verify button mapping
- Property 11: Generate successful requests, verify UI updates
- Property 13: Generate deletions, verify UI updates
- Property 14: Generate rapid input sequences, verify debounce
- Property 15: Generate search sequences, verify cancellation
- Property 16: Generate API states, verify loading indicators
- Property 17: Generate action completions, verify toast notifications

Each property-based test must be tagged with:
```
// Feature: friends-search, Property X: [property name]
```

### Integration Testing

- Test complete search flow: type keyword → debounce → API call → display results
- Test friend request flow: tap button → API call → update UI → show toast
- Test unfriend flow: tap button → confirm → API call → update UI
- Test error scenarios with mocked failing APIs

## Performance Considerations

### Backend Optimization

1. **Database Indexing**
   - Create index on (profile_visibility, name) for search queries
   - Create index on username for username searches
   - Create composite index on (user_id_1, user_id_2, status) for friendship lookups

2. **Query Optimization**
   - Use LIKE with leading wildcard carefully (consider full-text search for large datasets)
   - Limit search results to reasonable number (e.g., 50 users)
   - Use pagination if needed

3. **Caching**
   - Cache user search results for 2 minutes
   - Invalidate cache when user updates profile visibility
   - Cache friendship status lookups

### Frontend Optimization

1. **Debouncing**
   - 500ms debounce reduces API calls significantly
   - Cancel previous requests to avoid race conditions

2. **List Rendering**
   - Use FlatList with proper keyExtractor (user.id)
   - Implement getItemLayout for better performance
   - Use React.memo for UserListItem

3. **Optimistic Updates**
   - Update UI immediately when sending friend request
   - Revert on error
   - Improves perceived performance

4. **Request Cancellation**
   - Use AbortController to cancel pending requests
   - Prevents stale data from overwriting fresh results

## Security Considerations

1. **Authentication**
   - Require valid JWT for all endpoints
   - Extract user ID from token, never trust client input

2. **Authorization**
   - Verify user can only delete friendships they're part of
   - Prevent unauthorized access to private profiles

3. **Input Validation**
   - Sanitize search keywords
   - Validate user IDs are positive integers
   - Limit keyword length (max 50 characters)

4. **Rate Limiting**
   - Implement rate limiting on search endpoint (e.g., 30 requests per minute)
   - Implement rate limiting on friend request endpoint (e.g., 10 requests per minute)

5. **Data Privacy**
   - Never expose sensitive user data in search results
   - Respect profile visibility settings strictly
   - Log access to user search for audit

## Database Schema Updates

### Users Table (Add Column)

```sql
ALTER TABLE users 
ADD COLUMN profile_visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC'
CHECK (profile_visibility IN ('PUBLIC', 'PRIVATE', 'FRIENDS_ONLY'));

CREATE INDEX idx_users_visibility_name ON users(profile_visibility, name);
CREATE INDEX idx_users_username ON users(username);
```

## Future Enhancements

1. **Advanced Search**
   - Filter by location, interests, mutual friends
   - Sort by relevance, mutual friends count

2. **Friend Suggestions**
   - Suggest friends based on mutual connections
   - Suggest based on location or interests

3. **Bulk Actions**
   - Accept/reject multiple friend requests at once
   - Block multiple users

4. **Friend Lists**
   - Organize friends into custom lists
   - Filter friends by list

5. **Search History**
   - Save recent searches
   - Provide quick access to frequently searched users
