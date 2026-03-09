# Requirements: Place-Post Relationship Enhancement

## Introduction

Cải thiện mối quan hệ giữa Place và Post từ text-based matching sang proper foreign key relationship để đảm bảo data integrity, performance và scalability.

## Glossary

- **Place**: Địa điểm được định nghĩa trước trong hệ thống (nhà hàng, khách sạn, công viên, v.v.)
- **Post**: Bài đăng của user tại một vị trí địa lý cụ thể
- **Foreign Key (FK)**: Khóa ngoại đảm bảo tính toàn vẹn dữ liệu giữa hai bảng
- **Text Matching**: So sánh chuỗi ký tự để tìm liên kết (không an toàn)
- **Post Count**: Số lượng bài đăng tại một địa điểm

## Requirements

### Requirement 1: Proper Database Relationship

**User Story:** Là một developer, tôi muốn Post có foreign key tới Place, để đảm bảo data integrity và query performance.

#### Acceptance Criteria

1. WHEN a Post is created THEN the system SHALL store a place_id foreign key reference to the Place table
2. WHEN a Place is deleted THEN the system SHALL handle cascade behavior appropriately (SET NULL or prevent deletion)
3. WHEN querying posts by place THEN the system SHALL use integer FK lookup instead of text matching
4. WHEN a Place name is updated THEN all associated Posts SHALL maintain their relationship automatically
5. WHEN displaying place search results THEN the system SHALL include accurate post counts using FK relationships

### Requirement 2: Migration Strategy

**User Story:** Là một developer, tôi muốn migrate dữ liệu hiện tại từ text-based sang FK-based, để không mất dữ liệu cũ.

#### Acceptance Criteria

1. WHEN migration runs THEN the system SHALL attempt to match existing locationName values to Place.name
2. WHEN a locationName cannot be matched THEN the system SHALL log the unmatched record for manual review
3. WHEN migration completes THEN the system SHALL report success rate and unmatched records count
4. WHEN migration fails THEN the system SHALL rollback all changes and preserve original data
5. WHEN migration succeeds THEN the system SHALL maintain backward compatibility during transition period

### Requirement 3: Post Count Aggregation

**User Story:** Là một user, tôi muốn thấy số lượng bài đăng tại mỗi địa điểm, để biết địa điểm nào phổ biến.

#### Acceptance Criteria

1. WHEN searching places THEN the system SHALL return post count for each place
2. WHEN a new post is created THEN the system SHALL update the place's post count
3. WHEN a post is deleted THEN the system SHALL decrement the place's post count
4. WHEN filtering by hasPost THEN the system SHALL use post count > 0 instead of JOIN query
5. WHEN displaying place cards THEN the system SHALL show post count badge if count > 0

### Requirement 4: Enhanced Search Performance

**User Story:** Là một user, tôi muốn tìm kiếm địa điểm nhanh chóng, ngay cả khi có hàng triệu bài đăng.

#### Acceptance Criteria

1. WHEN querying places with posts THEN the system SHALL complete within 200ms for 95th percentile
2. WHEN database has > 1M posts THEN the system SHALL maintain query performance using proper indexes
3. WHEN filtering by hasPost THEN the system SHALL use indexed post_count column instead of JOIN
4. WHEN sorting by post count THEN the system SHALL use indexed column for efficient ordering
5. WHEN concurrent users search THEN the system SHALL handle load without performance degradation

### Requirement 5: Backward Compatibility

**User Story:** Là một developer, tôi muốn hỗ trợ cả locationName (legacy) và place_id (new), để migration diễn ra suôn sẻ.

#### Acceptance Criteria

1. WHEN creating a post THEN the system SHALL accept both place_id (preferred) and locationName (fallback)
2. WHEN place_id is provided THEN the system SHALL use it and ignore locationName
3. WHEN only locationName is provided THEN the system SHALL attempt to find matching place_id
4. WHEN no matching place is found THEN the system SHALL store locationName as free text
5. WHEN querying posts THEN the system SHALL prioritize place_id relationships over text matching

### Requirement 6: UI Enhancements

**User Story:** Là một user, tôi muốn thấy thông tin phong phú về địa điểm, để đưa ra quyết định tốt hơn.

#### Acceptance Criteria

1. WHEN viewing place search results THEN the system SHALL display post count badge on each place card
2. WHEN post count is zero THEN the system SHALL not display the badge
3. WHEN filtering by "has posts" THEN the system SHALL show active filter indicator with count
4. WHEN viewing place details THEN the system SHALL show recent posts from that place
5. WHEN sorting places THEN the system SHALL offer "Most posts" as a sort option

### Requirement 7: Analytics and Monitoring

**User Story:** Là một admin, tôi muốn theo dõi chất lượng dữ liệu place-post relationship, để phát hiện vấn đề sớm.

#### Acceptance Criteria

1. WHEN viewing admin dashboard THEN the system SHALL show percentage of posts with valid place_id
2. WHEN posts have null place_id THEN the system SHALL flag them for review
3. WHEN locationName doesn't match any place THEN the system SHALL suggest creating new place
4. WHEN place has zero posts for 6 months THEN the system SHALL flag for potential removal
5. WHEN data quality issues are detected THEN the system SHALL send alerts to admins
