# Requirements Document

## Introduction

Module Tab Bạn Bè & Tìm kiếm Hồ sơ cung cấp khả năng tìm kiếm người dùng khác và quản lý quan hệ bạn bè. Module này đảm bảo quyền riêng tư bằng cách chỉ cho phép tìm kiếm những người dùng có hồ sơ công khai, và cung cấp giao diện trực quan để gửi lời mời kết bạn, chấp nhận hoặc hủy kết bạn.

## Glossary

- **User**: Người dùng - một tài khoản trong hệ thống
- **Profile**: Hồ sơ - thông tin cá nhân của người dùng
- **Profile Visibility**: Mức độ hiển thị hồ sơ - xác định ai có thể tìm thấy hồ sơ (PUBLIC, PRIVATE, FRIENDS_ONLY)
- **Friendship**: Quan hệ bạn bè - mối quan hệ giữa hai người dùng
- **Friend Request**: Lời mời kết bạn - yêu cầu trở thành bạn bè
- **Backend System**: Hệ thống Spring Boot xử lý logic nghiệp vụ
- **Frontend Application**: Ứng dụng React Native hiển thị giao diện người dùng
- **Search Query**: Truy vấn tìm kiếm - chuỗi từ khóa người dùng nhập vào
- **Debounce**: Kỹ thuật trì hoãn - trì hoãn thực thi cho đến khi người dùng ngừng nhập
- **Authenticated User**: Người dùng đã đăng nhập - người dùng hiện tại đang sử dụng ứng dụng

## Requirements

### Requirement 1

**User Story:** As a user, I want to search for other users by name or username, so that I can find people I know and connect with them.

#### Acceptance Criteria

1. WHEN a user enters a search keyword THEN the Backend System SHALL query the database using pattern matching on name or username fields
2. WHEN the search query contains special characters THEN the Backend System SHALL sanitize the input to prevent SQL injection
3. WHEN search results are returned THEN the Backend System SHALL only include users with profile_visibility set to PUBLIC
4. WHEN a user types in the search bar THEN the Frontend Application SHALL debounce input for 500 milliseconds before sending the API request
5. WHEN the search API is called THEN the Frontend Application SHALL display a loading indicator until results are received

### Requirement 2

**User Story:** As a user, I want my profile visibility to be respected, so that I can control who can find me through search.

#### Acceptance Criteria

1. WHEN a user has profile_visibility set to PUBLIC THEN the Backend System SHALL include that user in search results
2. WHEN a user has profile_visibility set to PRIVATE THEN the Backend System SHALL exclude that user from all search results
3. WHEN a user has profile_visibility set to FRIENDS_ONLY THEN the Backend System SHALL exclude that user from search results for non-friends
4. WHEN the User entity is created THEN the Backend System SHALL include a profile_visibility field as an enum with values: PUBLIC, PRIVATE, FRIENDS_ONLY
5. WHEN a new user registers THEN the Backend System SHALL set default profile_visibility to PUBLIC

### Requirement 3

**User Story:** As a user, I want search results to show basic profile information, so that I can identify the right person before sending a friend request.

#### Acceptance Criteria

1. WHEN search results are returned THEN the Backend System SHALL include user id, name, username, and avatar URL for each result
2. WHEN search results are returned THEN the Backend System SHALL never expose sensitive information such as email, phone number, or password hash
3. WHEN a user's avatar is not set THEN the Backend System SHALL return null or a default avatar URL
4. WHEN displaying search results THEN the Frontend Application SHALL show avatar, name, and username for each user
5. WHEN an avatar fails to load THEN the Frontend Application SHALL display a default avatar placeholder

### Requirement 4

**User Story:** As a user, I want to see the friendship status with each search result, so that I know whether to send a friend request or not.

#### Acceptance Criteria

1. WHEN search results are returned THEN the Backend System SHALL include the friendship status between the authenticated user and each result user
2. WHEN no friendship exists THEN the Backend System SHALL return status as null or NONE
3. WHEN a friendship exists THEN the Backend System SHALL return the current status: PENDING, ACCEPTED, REJECTED, or BLOCKED
4. WHEN displaying a search result THEN the Frontend Application SHALL show appropriate action button based on friendship status
5. WHEN friendship status is null or NONE THEN the Frontend Application SHALL display "Add Friend" button

### Requirement 5

**User Story:** As a user, I want to send friend requests from the search results, so that I can connect with people I find.

#### Acceptance Criteria

1. WHEN a user taps "Add Friend" button THEN the Frontend Application SHALL call the friend request API with the target user ID
2. WHEN a friend request is sent THEN the Backend System SHALL create a Friendship record with status PENDING
3. WHEN a friend request is sent THEN the Backend System SHALL set the authenticated user as user_id_1 and target user as user_id_2
4. WHEN a friend request already exists THEN the Backend System SHALL return an error indicating duplicate request
5. WHEN a friend request is successfully sent THEN the Frontend Application SHALL update the button to show "Request Sent" or "Pending"

### Requirement 6

**User Story:** As a user, I want to cancel friend requests or unfriend users, so that I can manage my connections.

#### Acceptance Criteria

1. WHEN friendship status is PENDING and authenticated user is the requester THEN the Frontend Application SHALL display "Cancel Request" button
2. WHEN friendship status is ACCEPTED THEN the Frontend Application SHALL display "Unfriend" button
3. WHEN a user taps "Cancel Request" or "Unfriend" THEN the Frontend Application SHALL call the delete friendship API
4. WHEN the delete friendship API is called THEN the Backend System SHALL remove the Friendship record
5. WHEN a friendship is deleted THEN the Frontend Application SHALL update the button back to "Add Friend"

### Requirement 7

**User Story:** As a developer, I want the user search API to be RESTful and secure, so that it follows best practices and protects user privacy.

#### Acceptance Criteria

1. WHEN the user search endpoint is defined THEN the Backend System SHALL expose it at path GET /api/v1/users/search
2. WHEN the search API is called THEN the Backend System SHALL accept a query parameter: keyword
3. WHEN the search API is called THEN the Backend System SHALL require authentication via JWT token
4. WHEN implementing the search logic THEN the Backend System SHALL use UserRepository with custom @Query for name/username matching
5. WHEN returning search results THEN the Backend System SHALL use a DTO that excludes all sensitive fields

### Requirement 8

**User Story:** As a developer, I want the friend request API to be RESTful and handle edge cases, so that the system is robust.

#### Acceptance Criteria

1. WHEN the friend request endpoint is defined THEN the Backend System SHALL expose it at path POST /api/v1/friendships
2. WHEN the unfriend endpoint is defined THEN the Backend System SHALL expose it at path DELETE /api/v1/friendships/{friendshipId}
3. WHEN a user tries to send a friend request to themselves THEN the Backend System SHALL return a 400 Bad Request error
4. WHEN a user tries to send a duplicate friend request THEN the Backend System SHALL return a 409 Conflict error
5. WHEN a friendship is created or deleted THEN the Backend System SHALL return appropriate success response with updated friendship data

### Requirement 9

**User Story:** As a user, I want the friends tab to have a clean and intuitive interface, so that I can easily search and manage friendships.

#### Acceptance Criteria

1. WHEN the friends tab is opened THEN the Frontend Application SHALL display a search bar in the header
2. WHEN the friends tab is opened THEN the Frontend Application SHALL display a scrollable list below the search bar
3. WHEN search results are available THEN the Frontend Application SHALL render them using a FlatList component
4. WHEN creating user list items THEN the Frontend Application SHALL use or create a UserListItem component in src/features/profile/components/
5. WHERE the UserListItem is rendered THEN it SHALL display circular avatar, name, username, and action button

### Requirement 10

**User Story:** As a user, I want good UX feedback during search, so that I understand what the application is doing.

#### Acceptance Criteria

1. WHEN a search is in progress THEN the Frontend Application SHALL display an ActivityIndicator (loading spinner)
2. WHEN no search results are found THEN the Frontend Application SHALL display a message: "No users found"
3. WHEN a search error occurs THEN the Frontend Application SHALL display an error message with retry option
4. WHEN a friend request is being sent THEN the Frontend Application SHALL disable the button and show loading state
5. WHEN a friend request succeeds or fails THEN the Frontend Application SHALL show a toast notification with the result

### Requirement 11

**User Story:** As a user, I want the search to be responsive and not overwhelming, so that I have a smooth experience.

#### Acceptance Criteria

1. WHEN a user types in the search bar THEN the Frontend Application SHALL use debounce technique with 500ms delay
2. WHEN the debounce period has not elapsed THEN the Frontend Application SHALL not send any API requests
3. WHEN the user stops typing for 500ms THEN the Frontend Application SHALL send a single API request with the final keyword
4. WHEN a new search is triggered THEN the Frontend Application SHALL cancel any pending previous search requests
5. WHEN the search bar is empty THEN the Frontend Application SHALL clear the results and show an empty state or default content

### Requirement 12

**User Story:** As a developer, I want the friends tab implementation to be modular and maintainable, so that it can be easily extended.

#### Acceptance Criteria

1. WHEN implementing the friends tab THEN the Frontend Application SHALL update app/(app)/(tabs)/friends.tsx
2. WHEN implementing user search THEN the Frontend Application SHALL create searchUsers function in a service file
3. WHEN implementing friend request actions THEN the Frontend Application SHALL create sendFriendRequest and deleteFriendship functions in a service file
4. WHEN managing search state THEN the Frontend Application SHALL use a custom hook or context for state management
5. WHERE service functions are created THEN they SHALL be placed in src/services/profile/ or src/services/friendship/ directory
