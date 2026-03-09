# Requirements: Unified Post-Place System

## Introduction

Hợp nhất hệ thống Post và Review thành một hệ thống thống nhất, cho phép người dùng tạo bài đăng tại địa điểm cụ thể với khả năng đánh giá (rating). Hệ thống mới sẽ đơn giản hóa data model, cải thiện UX và tạo nền tảng cho tính năng social discovery.

## Glossary

- **Post**: Bài đăng của user, có thể là bài thường hoặc bài đánh giá địa điểm
- **Place**: Địa điểm được định nghĩa trước (nhà hàng, khách sạn, công viên, v.v.)
- **Review Post**: Bài đăng có rating (1-5 sao) gắn với một Place cụ thể
- **Normal Post**: Bài đăng thường không có rating, có thể có hoặc không có Place
- **Place Picker**: UI component cho phép user chọn địa điểm từ danh sách
- **Post Count**: Số lượng bài đăng tại một địa điểm
- **Unified Feed**: Feed hiển thị cả normal posts và review posts

## Requirements

### Requirement 1: Post Type System

**User Story:** Là một user, tôi muốn tạo cả bài đăng thường và bài đánh giá địa điểm trong cùng một flow, để trải nghiệm nhất quán.

#### Acceptance Criteria

1. WHEN creating a post THEN the system SHALL allow user to choose between NORMAL and REVIEW type
2. WHEN post type is REVIEW THEN the system SHALL require a Place selection and rating (1-5 stars)
3. WHEN post type is NORMAL THEN the system SHALL allow optional Place selection without rating
4. WHEN displaying posts THEN the system SHALL show rating badge for REVIEW posts only
5. WHEN filtering posts THEN the system SHALL support filtering by post type

### Requirement 2: Place Selection UI

**User Story:** Là một user, tôi muốn chọn địa điểm cụ thể khi đăng bài, để bài đăng được gắn với địa điểm đó.

#### Acceptance Criteria

1. WHEN user taps "Chọn địa điểm" THEN the system SHALL show Place Picker modal
2. WHEN Place Picker opens THEN the system SHALL display nearby places within 5km radius
3. WHEN user searches in Place Picker THEN the system SHALL filter places by name in real-time
4. WHEN user selects a place THEN the system SHALL display place name and allow deselection
5. WHEN user submits post THEN the system SHALL save place_id foreign key reference

### Requirement 3: Database Migration

**User Story:** Là một developer, tôi muốn migrate dữ liệu Review hiện tại sang Post system, để không mất dữ liệu.

#### Acceptance Criteria

1. WHEN migration runs THEN the system SHALL convert all Review records to Post records with type=REVIEW
2. WHEN converting Review THEN the system SHALL preserve user_id, place_id, content, rating, created_at
3. WHEN migration completes THEN the system SHALL mark old reviews table as deprecated
4. WHEN migration fails THEN the system SHALL rollback all changes and log errors
5. WHEN migration succeeds THEN the system SHALL report conversion statistics

### Requirement 4: Post-Place Relationship

**User Story:** Là một user, tôi muốn xem tất cả bài đăng tại một địa điểm, để biết người khác nghĩ gì về địa điểm đó.

#### Acceptance Criteria

1. WHEN viewing place details THEN the system SHALL display tab "Bài đăng" showing all posts at that place
2. WHEN displaying place posts THEN the system SHALL show both NORMAL and REVIEW posts
3. WHEN sorting place posts THEN the system SHALL offer "Mới nhất", "Đánh giá cao nhất", "Nhiều like nhất"
4. WHEN place has no posts THEN the system SHALL show empty state with CTA "Đăng bài đầu tiên"
5. WHEN user creates post at place THEN the system SHALL increment place.post_count

### Requirement 5: Place Card Enhancement

**User Story:** Là một user, tôi muốn thấy số lượng bài đăng trên place card, để biết địa điểm nào phổ biến.

#### Acceptance Criteria

1. WHEN displaying place card THEN the system SHALL show post count badge if count > 0
2. WHEN post count is 0 THEN the system SHALL not display badge
3. WHEN filtering by "Có bài đăng" THEN the system SHALL use post_count > 0 condition
4. WHEN sorting by "Nhiều bài đăng nhất" THEN the system SHALL order by post_count DESC
5. WHEN place card is tapped THEN the system SHALL navigate to place details with posts tab

### Requirement 6: Unified Feed Display

**User Story:** Là một user, tôi muốn thấy cả bài đăng thường và bài đánh giá trong feed, để không bỏ lỡ nội dung.

#### Acceptance Criteria

1. WHEN viewing feed THEN the system SHALL display both NORMAL and REVIEW posts in chronological order
2. WHEN displaying REVIEW post THEN the system SHALL show rating stars and place name prominently
3. WHEN displaying NORMAL post with place THEN the system SHALL show place name without rating
4. WHEN tapping place name on post THEN the system SHALL navigate to place details
5. WHEN filtering feed THEN the system SHALL support "Chỉ đánh giá" and "Chỉ bài thường" filters

### Requirement 7: Rating Aggregation

**User Story:** Là một user, tôi muốn thấy rating trung bình của địa điểm, để đánh giá chất lượng.

#### Acceptance Criteria

1. WHEN user creates REVIEW post THEN the system SHALL recalculate place.average_rating
2. WHEN calculating average rating THEN the system SHALL use all REVIEW posts at that place
3. WHEN user updates REVIEW post rating THEN the system SHALL recalculate average_rating
4. WHEN user deletes REVIEW post THEN the system SHALL recalculate average_rating
5. WHEN place has no REVIEW posts THEN the system SHALL set average_rating to NULL

### Requirement 8: Backward Compatibility

**User Story:** Là một developer, tôi muốn hỗ trợ cả old Review API và new Post API, để migration diễn ra suôn sẻ.

#### Acceptance Criteria

1. WHEN old Review API is called THEN the system SHALL return posts with type=REVIEW in old format
2. WHEN new Post API is called THEN the system SHALL return all posts with new format
3. WHEN creating via old Review API THEN the system SHALL create post with type=REVIEW
4. WHEN migration period ends THEN the system SHALL deprecate old Review API
5. WHEN old API is deprecated THEN the system SHALL return 410 Gone with migration message

### Requirement 9: Performance Optimization

**User Story:** Là một user, tôi muốn feed load nhanh, ngay cả khi có hàng triệu bài đăng.

#### Acceptance Criteria

1. WHEN querying posts by place THEN the system SHALL complete within 200ms for 95th percentile
2. WHEN database has > 1M posts THEN the system SHALL maintain query performance using indexes
3. WHEN loading feed THEN the system SHALL use pagination with max 20 posts per page
4. WHEN filtering by place THEN the system SHALL use indexed place_id column
5. WHEN sorting by rating THEN the system SHALL use indexed rating column for REVIEW posts

### Requirement 10: UI/UX Enhancements

**User Story:** Là một user, tôi muốn UI rõ ràng phân biệt bài thường và bài đánh giá, để dễ nhận biết.

#### Acceptance Criteria

1. WHEN viewing REVIEW post THEN the system SHALL display rating stars in prominent position
2. WHEN viewing NORMAL post with place THEN the system SHALL show place icon without stars
3. WHEN creating post THEN the system SHALL show toggle "Đánh giá địa điểm" to switch to REVIEW mode
4. WHEN in REVIEW mode THEN the system SHALL show star rating selector (1-5 stars)
5. WHEN place is selected THEN the system SHALL show place card preview with remove button
