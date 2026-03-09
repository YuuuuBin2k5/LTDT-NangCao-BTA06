# Requirements Document

## Introduction

Module Xem Chi tiết Địa Điểm & Logic Phân Quyền Bình Luận cung cấp khả năng xem thông tin chi tiết về một địa điểm và đọc các bình luận/đánh giá với logic phân quyền dựa trên quan hệ bạn bè. Module này đảm bảo rằng người dùng chỉ có thể xem bình luận riêng tư từ những người là bạn bè của họ, trong khi bình luận công khai hiển thị cho tất cả mọi người.

## Glossary

- **Place**: Địa điểm - một thực thể đại diện cho một vị trí địa lý
- **Review**: Bình luận/Đánh giá - nội dung do người dùng tạo về một địa điểm
- **Rating**: Điểm đánh giá - điểm số từ 1-5 sao mà người dùng cho địa điểm
- **Visibility**: Mức độ hiển thị - xác định ai có thể xem bình luận (public hoặc friends-only)
- **Friendship**: Quan hệ bạn bè - mối quan hệ giữa hai người dùng với trạng thái ACCEPTED
- **Backend System**: Hệ thống Spring Boot xử lý logic nghiệp vụ và phân quyền
- **Frontend Application**: Ứng dụng React Native hiển thị giao diện người dùng
- **Authenticated User**: Người dùng đã đăng nhập - người dùng hiện tại đang sử dụng ứng dụng
- **Review Author**: Tác giả bình luận - người dùng đã viết bình luận
- **Dynamic Route**: Route động - đường dẫn URL có tham số thay đổi (ví dụ: /place/[id])

## Requirements

### Requirement 1

**User Story:** As a user, I want to view detailed information about a place, so that I can learn more before visiting or reviewing it.

#### Acceptance Criteria

1. WHEN a user requests place details THEN the Backend System SHALL return place id, name, description, coordinates, average rating, category, and cover image URL
2. WHEN the place does not exist THEN the Backend System SHALL return a 404 Not Found error with appropriate message
3. WHEN place details are loaded THEN the Frontend Application SHALL display cover image, name, address, and overall rating prominently
4. WHEN the Frontend Application renders place details THEN it SHALL use a dynamic route at app/(app)/place/[id].tsx
5. WHEN a user taps on a place from search results or map THEN the Frontend Application SHALL navigate to the place details screen with the place ID

### Requirement 2

**User Story:** As a user, I want to see reviews from other users about a place, so that I can make informed decisions based on their experiences.

#### Acceptance Criteria

1. WHEN a user requests reviews for a place THEN the Backend System SHALL return all public reviews for that place
2. WHEN the authenticated user has friends who wrote private reviews THEN the Backend System SHALL include those private reviews in the response
3. WHEN a review is returned THEN the Backend System SHALL include review id, content, rating, visibility flag, author name, author avatar, and creation timestamp
4. WHEN reviews are displayed THEN the Frontend Application SHALL show them in a scrollable list below place information
5. WHEN the review list is empty THEN the Frontend Application SHALL display a message indicating no reviews are available

### Requirement 3

**User Story:** As a user, I want to see visual indicators on reviews showing whether they are public or friends-only, so that I understand the visibility of each review.

#### Acceptance Criteria

1. WHEN a review has is_public set to true THEN the Frontend Application SHALL display a globe icon (🌎) next to the review
2. WHEN a review has is_public set to false THEN the Frontend Application SHALL display a friends icon (👥) next to the review
3. WHEN rendering a review THEN the Frontend Application SHALL create a ReviewCard component in src/features/map/components/
4. WHEN the ReviewCard component receives a review THEN it SHALL display author avatar, author name, rating stars, content, timestamp, and visibility icon
5. WHERE the visibility icon is positioned THEN the Frontend Application SHALL place it prominently near the author information

### Requirement 4

**User Story:** As a developer, I want the review visibility logic to be correctly implemented on the backend, so that users only see reviews they are authorized to view.

#### Acceptance Criteria

1. WHEN querying reviews for a place THEN the Backend System SHALL create a Review entity with fields: id, place_id, user_id, content, rating, is_public, created_at
2. WHEN the Review entity is created THEN the Backend System SHALL establish a foreign key relationship to Place and User entities
3. WHEN implementing review retrieval logic THEN the Backend System SHALL query all reviews where is_public equals true
4. WHEN implementing review retrieval logic THEN the Backend System SHALL additionally query reviews where is_public equals false AND the review author has an ACCEPTED friendship with the authenticated user
5. WHEN checking friendship status THEN the Backend System SHALL query the Friendship table for records where (user_id_1 equals authenticated user AND user_id_2 equals review author) OR (user_id_1 equals review author AND user_id_2 equals authenticated user) AND status equals ACCEPTED

### Requirement 5

**User Story:** As a developer, I want the friendship data model to support the review visibility logic, so that the system can determine which private reviews to show.

#### Acceptance Criteria

1. WHEN the Friendship entity is created THEN the Backend System SHALL include fields: id, user_id_1, user_id_2, status, created_at
2. WHEN the Friendship entity is created THEN the Backend System SHALL define status as an enum with values: PENDING, ACCEPTED, REJECTED, BLOCKED
3. WHEN querying friendships THEN the Backend System SHALL support bidirectional lookup (either user can be user_id_1 or user_id_2)
4. WHEN a friendship record exists with status ACCEPTED THEN the Backend System SHALL consider the two users as friends
5. WHEN no friendship record exists or status is not ACCEPTED THEN the Backend System SHALL consider the users as non-friends

### Requirement 6

**User Story:** As a user, I want the place details API to be RESTful and efficient, so that the page loads quickly with all necessary information.

#### Acceptance Criteria

1. WHEN the place details endpoint is defined THEN the Backend System SHALL expose it at path GET /api/v1/places/{id}
2. WHEN the reviews endpoint is defined THEN the Backend System SHALL expose it at path GET /api/v1/places/{id}/reviews
3. WHEN the reviews API is called THEN the Backend System SHALL require authentication via JWT token
4. WHEN the reviews API is called THEN the Backend System SHALL extract the authenticated user ID from the JWT token
5. WHEN returning review data THEN the Backend System SHALL never expose sensitive user information such as email, phone number, or password hash

### Requirement 7

**User Story:** As a user, I want the place details screen to have a clean layout, so that I can easily read information and reviews.

#### Acceptance Criteria

1. WHEN the place details screen is rendered THEN the Frontend Application SHALL divide the layout into two sections: place information at top and reviews list below
2. WHEN displaying place information THEN the Frontend Application SHALL show cover image, name, address, category badge, and average rating with star visualization
3. WHEN displaying the reviews list THEN the Frontend Application SHALL use a FlatList component for efficient scrolling
4. WHEN a review is tapped THEN the Frontend Application SHALL optionally expand to show full content if truncated
5. WHERE the place information section ends THEN the Frontend Application SHALL add a visual separator before the reviews section

### Requirement 8

**User Story:** As a developer, I want the frontend to properly integrate with the place details and reviews APIs, so that data is fetched and displayed correctly.

#### Acceptance Criteria

1. WHEN implementing API integration THEN the Frontend Application SHALL create fetchPlaceDetails function in src/services/location/location.service.ts
2. WHEN implementing API integration THEN the Frontend Application SHALL create fetchPlaceReviews function in src/services/location/location.service.ts
3. WHEN the place details screen mounts THEN the Frontend Application SHALL call both fetchPlaceDetails and fetchPlaceReviews with the place ID from route params
4. WHEN API calls are in progress THEN the Frontend Application SHALL display loading skeletons for place info and reviews
5. WHEN API calls fail THEN the Frontend Application SHALL display error messages with retry buttons

### Requirement 9

**User Story:** As a user, I want to see accurate author information on each review, so that I know who wrote it and can trust the source.

#### Acceptance Criteria

1. WHEN a review is returned by the API THEN the Backend System SHALL include author name and avatar URL in the response
2. WHEN the author has not set an avatar THEN the Backend System SHALL return a default avatar URL or null
3. WHEN displaying a review THEN the Frontend Application SHALL show the author's avatar as a circular image
4. WHEN the author avatar fails to load THEN the Frontend Application SHALL display a default avatar placeholder
5. WHEN displaying author name THEN the Frontend Application SHALL truncate long names with ellipsis if they exceed available space

### Requirement 10

**User Story:** As a user, I want to see when reviews were posted, so that I can assess the recency and relevance of the information.

#### Acceptance Criteria

1. WHEN a review is returned by the API THEN the Backend System SHALL include the created_at timestamp in ISO 8601 format
2. WHEN displaying a review THEN the Frontend Application SHALL format the timestamp as relative time (e.g., "2 hours ago", "3 days ago")
3. WHEN a review is more than 30 days old THEN the Frontend Application SHALL display the absolute date (e.g., "Jan 15, 2026")
4. WHEN formatting timestamps THEN the Frontend Application SHALL use the user's locale and timezone
5. WHERE the timestamp is displayed THEN the Frontend Application SHALL position it near the author information in a subtle, secondary text style
