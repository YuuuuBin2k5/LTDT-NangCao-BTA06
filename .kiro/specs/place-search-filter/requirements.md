# Requirements Document

## Introduction

Module Tìm kiếm & Lọc Địa điểm cung cấp khả năng tìm kiếm và lọc các địa điểm trên bản đồ dựa trên nhiều tiêu chí khác nhau. Module này bao gồm backend API (Spring Boot) để xử lý truy vấn tìm kiếm với phân trang, và frontend (React Native) với giao diện tìm kiếm trực quan trên màn hình bản đồ.

## Glossary

- **Place**: Địa điểm - một thực thể đại diện cho một vị trí địa lý có thể được tìm kiếm và đánh giá
- **Category**: Phân loại - nhóm các địa điểm theo loại hình (ví dụ: nhà hàng, khách sạn, công viên)
- **Rating**: Đánh giá - điểm số trung bình từ 1-5 sao mà người dùng đã cho địa điểm
- **Backend System**: Hệ thống Spring Boot xử lý logic nghiệp vụ và lưu trữ dữ liệu
- **Frontend Application**: Ứng dụng React Native hiển thị giao diện người dùng
- **Search Query**: Truy vấn tìm kiếm - chuỗi từ khóa người dùng nhập vào
- **Filter Criteria**: Tiêu chí lọc - các điều kiện để thu hẹp kết quả tìm kiếm
- **Pagination**: Phân trang - chia kết quả thành nhiều trang để tải dần
- **Bottom Sheet**: Bảng điều khiển trượt từ dưới lên chứa các tuỳ chọn lọc

## Requirements

### Requirement 1

**User Story:** As a user, I want to search for places by name, so that I can quickly find specific locations I'm interested in.

#### Acceptance Criteria

1. WHEN a user enters a search keyword THEN the Backend System SHALL query the database using pattern matching on the place name field
2. WHEN the search query contains special characters THEN the Backend System SHALL sanitize the input to prevent SQL injection
3. WHEN search results are returned THEN the Backend System SHALL include place id, name, description, coordinates, average rating, and category for each result
4. WHEN a user types in the search bar THEN the Frontend Application SHALL debounce input for 500 milliseconds before sending the API request
5. WHEN the search API is called THEN the Frontend Application SHALL display a loading indicator until results are received

### Requirement 2

**User Story:** As a user, I want to filter places by category, so that I can narrow down results to specific types of locations.

#### Acceptance Criteria

1. WHEN a user selects a category filter THEN the Backend System SHALL return only places matching that category
2. WHEN no category is selected THEN the Backend System SHALL return places from all categories
3. WHEN a user opens the filter panel THEN the Frontend Application SHALL display all available categories as radio button options
4. WHEN a user selects a category THEN the Frontend Application SHALL update the search results immediately
5. WHERE the filter panel is implemented THEN the Frontend Application SHALL use a Bottom Sheet component

### Requirement 3

**User Story:** As a user, I want to filter places by minimum rating, so that I can find highly-rated locations.

#### Acceptance Criteria

1. WHEN a user sets a minimum rating threshold THEN the Backend System SHALL return only places with average rating greater than or equal to the threshold
2. WHEN the minimum rating is set to zero THEN the Backend System SHALL return places with any rating including unrated places
3. WHEN a user adjusts the rating slider THEN the Frontend Application SHALL display the current rating value
4. WHEN a user releases the rating slider THEN the Frontend Application SHALL trigger a new search with the updated rating filter
5. WHERE the rating filter is implemented THEN the Frontend Application SHALL use a slider component with range from 0 to 5

### Requirement 4

**User Story:** As a user, I want search results to be paginated, so that the application loads quickly and I can browse through many results efficiently.

#### Acceptance Criteria

1. WHEN the search API is called THEN the Backend System SHALL accept page number and page size as query parameters
2. WHEN pagination parameters are provided THEN the Backend System SHALL return results for the specified page with the specified size
3. WHEN the Backend System returns paginated results THEN it SHALL include metadata containing total elements, total pages, current page number, and page size
4. WHEN a user scrolls to the end of the results list THEN the Frontend Application SHALL automatically load the next page
5. WHEN loading additional pages THEN the Frontend Application SHALL append new results to the existing list without replacing previous results

### Requirement 5

**User Story:** As a developer, I want the search API to be RESTful and well-structured, so that it is maintainable and follows best practices.

#### Acceptance Criteria

1. WHEN the search endpoint is defined THEN the Backend System SHALL expose it at path GET /api/v1/places/search
2. WHEN the search API is called THEN the Backend System SHALL accept query parameters: keyword, category, minRating, page, and size
3. WHEN implementing the search logic THEN the Backend System SHALL use Spring Data JPA with @Query annotation or Specification pattern
4. WHEN the Place entity is created THEN the Backend System SHALL include fields: id, name, description, latitude, longitude, averageRating, and category
5. WHEN the PlaceRepository is implemented THEN the Backend System SHALL provide methods supporting keyword search, category filtering, and rating filtering

### Requirement 6

**User Story:** As a user, I want to see search results displayed on the map screen, so that I can visualize where places are located.

#### Acceptance Criteria

1. WHEN search results are received THEN the Frontend Application SHALL display them as markers on the map
2. WHEN a user taps a result marker THEN the Frontend Application SHALL show a preview card with basic place information
3. WHERE the search bar is placed THEN the Frontend Application SHALL position it at the top of the map screen
4. WHERE the filter button is placed THEN the Frontend Application SHALL position it adjacent to the search bar with a funnel icon
5. WHEN displaying multiple results THEN the Frontend Application SHALL optionally show a horizontal carousel overlay on the map for easy browsing

### Requirement 7

**User Story:** As a user, I want the search interface to be responsive and provide feedback, so that I understand what the application is doing.

#### Acceptance Criteria

1. WHEN a search is in progress THEN the Frontend Application SHALL display a loading spinner or skeleton screen
2. WHEN no results are found THEN the Frontend Application SHALL display a friendly message indicating no places match the criteria
3. WHEN a search error occurs THEN the Frontend Application SHALL display an error message with option to retry
4. WHEN filters are applied THEN the Frontend Application SHALL show visual indicators of active filters
5. WHEN a user clears all filters THEN the Frontend Application SHALL reset to showing all places without restrictions

### Requirement 8

**User Story:** As a developer, I want the frontend search feature to be modular and maintainable, so that it can be easily extended and tested.

#### Acceptance Criteria

1. WHEN implementing the search UI THEN the Frontend Application SHALL update the file app/(app)/(tabs)/index.tsx with the search bar component
2. WHEN implementing the filter UI THEN the Frontend Application SHALL create a new component at src/features/map/components/FilterBottomSheet.tsx
3. WHEN implementing API integration THEN the Frontend Application SHALL add search functions to src/services/location/location.service.ts
4. WHEN managing search state THEN the Frontend Application SHALL use LocationContext or create a custom hook useLocationSearch
5. WHERE search results are stored THEN the Frontend Application SHALL maintain them in a centralized state management solution
