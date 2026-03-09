# Social Posts on Map - Requirements

## Tổng quan
Chuyển đổi app từ "review places" sang "social posting map" - nơi người dùng có thể đăng tin (posts) với ảnh tại bất kỳ vị trí nào, và các posts này hiển thị trên bản đồ cho mọi người xem.

## Mục tiêu
- Người dùng có thể dễ dàng tạo post mới thông qua nút "+" trên map
- Post có thể có ảnh, text, và vị trí tùy chỉnh
- Posts hiển thị trên bản đồ dưới dạng markers với thumbnail ảnh
- Ẩn reviews của places khỏi bản đồ (chỉ hiển thị user posts)
- Bản đồ trở thành nơi giao lưu xã hội

## User Stories

### 1. Tạo Post Mới
**Là người dùng, tôi muốn:**
- Nhấn nút "+" floating button trên map screen
- Chọn vị trí cho post (có thể dùng vị trí hiện tại hoặc chọn trên map)
- Thêm ảnh từ thư viện hoặc chụp ảnh mới (tối đa 5 ảnh)
- Viết nội dung text cho post
- Thêm hashtags (optional)
- Chọn privacy (public/friends only/private)
- Đăng post lên map

### 2. Xem Posts Trên Map
**Là người dùng, tôi muốn:**
- Thấy posts của mọi người hiển thị trên bản đồ
- Markers hiển thị thumbnail ảnh đầu tiên của post (nếu có)
- Markers có avatar của người đăng
- Nhấn vào marker để xem preview post
- Nhấn vào preview để xem chi tiết đầy đủ

### 3. Tương Tác Với Posts
**Là người dùng, tôi muốn:**
- Like/unlike posts
- Comment trên posts
- Share posts
- Xem danh sách người like
- Xem profile người đăng

### 4. Quản Lý Posts Của Mình
**Là người dùng, tôi muốn:**
- Xem tất cả posts của mình trên profile
- Chỉnh sửa post (text, privacy)
- Xóa post
- Xem thống kê (views, likes, comments)

### 5. Feed Timeline
**Là người dùng, tôi muốn:**
- Xem feed timeline của posts từ bạn bè
- Xem posts gần đây trong khu vực
- Filter posts theo khoảng cách, thời gian
- Search posts theo hashtags

## Functional Requirements

### Backend (Spring Boot)

#### 1. Post Entity
```
- id: Long (PK)
- user_id: UUID (FK to users)
- content: TEXT
- latitude: DOUBLE
- longitude: DOUBLE
- location_name: VARCHAR(255) (optional, địa chỉ readable)
- privacy: ENUM (PUBLIC, FRIENDS_ONLY, PRIVATE)
- view_count: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 2. PostImage Entity
```
- id: Long (PK)
- post_id: Long (FK to posts)
- image_url: TEXT
- display_order: INTEGER
- created_at: TIMESTAMP
```

#### 3. PostLike Entity
```
- id: Long (PK)
- post_id: Long (FK to posts)
- user_id: UUID (FK to users)
- created_at: TIMESTAMP
- UNIQUE(post_id, user_id)
```

#### 4. PostComment Entity
```
- id: Long (PK)
- post_id: Long (FK to posts)
- user_id: UUID (FK to users)
- content: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 5. PostHashtag & Hashtag Entities
```
Hashtag:
- id: Long (PK)
- name: VARCHAR(100) UNIQUE
- usage_count: INTEGER

PostHashtag:
- post_id: Long (FK)
- hashtag_id: Long (FK)
- PRIMARY KEY(post_id, hashtag_id)
```

#### 6. API Endpoints

**Post Management:**
- `POST /api/posts` - Tạo post mới
- `GET /api/posts/{id}` - Lấy chi tiết post
- `PUT /api/posts/{id}` - Cập nhật post
- `DELETE /api/posts/{id}` - Xóa post
- `GET /api/posts/nearby` - Lấy posts gần vị trí (với radius)
- `GET /api/posts/feed` - Lấy feed timeline
- `GET /api/posts/user/{userId}` - Lấy posts của user

**Post Interactions:**
- `POST /api/posts/{id}/like` - Like post
- `DELETE /api/posts/{id}/like` - Unlike post
- `GET /api/posts/{id}/likes` - Lấy danh sách likes
- `POST /api/posts/{id}/comments` - Thêm comment
- `GET /api/posts/{id}/comments` - Lấy comments
- `PUT /api/posts/comments/{commentId}` - Sửa comment
- `DELETE /api/posts/comments/{commentId}` - Xóa comment

**Image Upload:**
- `POST /api/posts/images/upload` - Upload ảnh (multipart)

**Hashtags:**
- `GET /api/hashtags/trending` - Lấy trending hashtags
- `GET /api/posts/hashtag/{name}` - Tìm posts theo hashtag

### Frontend (React Native)

#### 1. Map Screen Updates
- Thêm floating "+" button (bottom right)
- Hiển thị post markers thay vì place markers
- Custom marker với thumbnail + avatar
- Cluster posts khi zoom out
- Ẩn place reviews khỏi map

#### 2. Create Post Screen
- Camera/Gallery picker
- Multi-image upload (max 5)
- Text editor với hashtag support
- Location picker (map view)
- Privacy selector
- Submit button

#### 3. Post Detail Screen
- Image carousel
- Post content
- User info (avatar, name)
- Like/Comment buttons
- Comment list
- Share button
- Map preview (small)

#### 4. Post Card Component
- Thumbnail image
- User avatar
- Post preview text
- Like/Comment counts
- Time ago
- Location name

#### 5. Feed Screen Updates
- Timeline view của posts
- Pull to refresh
- Infinite scroll
- Filter options

## Non-Functional Requirements

### Performance
- Posts trong radius 10km load trong < 2s
- Image upload < 5s per image
- Map markers render smooth với 1000+ posts
- Clustering algorithm efficient

### Security
- Chỉ owner có thể edit/delete post
- Privacy settings được enforce
- Image upload có validation (size, type)
- Rate limiting cho post creation

### Scalability
- Support 10,000+ posts trong database
- Efficient spatial queries với PostGIS
- Image CDN cho fast loading
- Pagination cho all lists

## Technical Considerations

### Database
- Thêm spatial index cho (latitude, longitude) trong posts table
- Index cho (user_id, created_at) cho user posts query
- Index cho (created_at) cho feed query
- Composite index cho privacy + location queries

### Image Storage
- Lưu images trên cloud storage (AWS S3, Cloudinary, etc.)
- Generate thumbnails cho map markers
- Compress images trước khi upload
- Lazy loading images trong feed

### Map Performance
- Chỉ load posts trong viewport + buffer
- Clustering với supercluster algorithm
- Debounce map region changes
- Cache loaded posts

### Privacy
- PUBLIC: Ai cũng thấy
- FRIENDS_ONLY: Chỉ bạn bè thấy
- PRIVATE: Chỉ mình thấy (draft mode)

## Migration Strategy

### Phase 1: Backend Foundation
1. Tạo entities (Post, PostImage, PostLike, PostComment, Hashtag)
2. Tạo repositories với spatial queries
3. Tạo services với business logic
4. Tạo controllers với API endpoints
5. Add migrations
6. Write tests

### Phase 2: Image Upload
1. Setup image storage service
2. Implement upload endpoint
3. Image processing (resize, compress)
4. Generate thumbnails

### Phase 3: Frontend Core
1. Create Post screen
2. Post service layer
3. Map markers update
4. Post detail screen
5. Post card component

### Phase 4: Social Features
1. Like/Unlike functionality
2. Comment system
3. Feed timeline
4. Hashtag support

### Phase 5: Polish & Optimization
1. Performance optimization
2. Clustering optimization
3. Image lazy loading
4. Error handling
5. Loading states
6. Empty states

## Success Metrics
- Users can create posts in < 30 seconds
- Map loads posts in < 2 seconds
- 90%+ posts have images
- Average 5+ posts per active user per week
- Feed engagement rate > 30%

## Out of Scope (Future)
- Video posts
- Stories (24h posts)
- Post reactions (beyond like)
- Post sharing to external platforms
- Advanced filters (by user, by date range)
- Notifications for likes/comments
- Real-time updates (WebSocket)
