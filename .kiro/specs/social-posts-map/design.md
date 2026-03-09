# Social Posts on Map - Design Document

## Architecture Overview

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     React Native Client                      │
├─────────────────────────────────────────────────────────────┤
│  Map Screen          Create Post        Post Detail          │
│  - Post Markers      - Image Picker     - Image Carousel     │
│  - Clustering        - Location Picker  - Comments           │
│  - User Location     - Text Editor      - Likes              │
│                                                               │
│  Feed Screen         Profile Screen                          │
│  - Timeline          - User Posts                            │
│  - Filters           - Statistics                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Spring Boot Backend                       │
├─────────────────────────────────────────────────────────────┤
│  Controllers                                                  │
│  - PostController                                            │
│  - PostInteractionController                                 │
│  - ImageUploadController                                     │
│                                                               │
│  Services                                                     │
│  - PostService (CRUD, nearby search)                         │
│  - PostInteractionService (likes, comments)                  │
│  - ImageStorageService (upload, resize)                      │
│  - HashtagService (trending, search)                         │
│                                                               │
│  Repositories                                                 │
│  - PostRepository (spatial queries)                          │
│  - PostLikeRepository                                        │
│  - PostCommentRepository                                     │
│  - HashtagRepository                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL + PostGIS                      │
│  - posts (with spatial index)                                │
│  - post_images                                               │
│  - post_likes                                                │
│  - post_comments                                             │
│  - hashtags                                                  │
│  - post_hashtags                                             │
└─────────────────────────────────────────────────────────────┘
```

## Database Design

### Entity Relationship Diagram
```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    users     │         │    posts     │         │ post_images  │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id (UUID)    │◄───────┤│ id           │◄───────┤│ id           │
│ username     │         │ user_id (FK) │         │ post_id (FK) │
│ email        │         │ content      │         │ image_url    │
│ ...          │         │ latitude     │         │ display_order│
└──────────────┘         │ longitude    │         └──────────────┘
                         │ location_name│
                         │ privacy      │
                         │ view_count   │
                         │ created_at   │
                         └──────────────┘
                              │    │
                    ┌─────────┘    └─────────┐
                    │                         │
                    ▼                         ▼
            ┌──────────────┐         ┌──────────────┐
            │ post_likes   │         │post_comments │
            ├──────────────┤         ├──────────────┤
            │ id           │         │ id           │
            │ post_id (FK) │         │ post_id (FK) │
            │ user_id (FK) │         │ user_id (FK) │
            │ created_at   │         │ content      │
            └──────────────┘         │ created_at   │
                                     └──────────────┘
                    
┌──────────────┐         ┌──────────────┐
│  hashtags    │         │post_hashtags │
├──────────────┤         ├──────────────┤
│ id           │◄───────┤│ post_id (FK) │
│ name (UNIQUE)│         │ hashtag_id   │
│ usage_count  │         └──────────────┘
└──────────────┘
```

### Database Schema

#### posts table
```sql
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_name VARCHAR(255),
    privacy VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Spatial index for location queries
    CONSTRAINT posts_privacy_check CHECK (privacy IN ('PUBLIC', 'FRIENDS_ONLY', 'PRIVATE'))
);

CREATE INDEX idx_posts_location ON posts USING GIST (
    ll_to_earth(latitude, longitude)
);
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_privacy_created ON posts(privacy, created_at DESC);
```

#### post_images table
```sql
CREATE TABLE post_images (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT post_images_order_check CHECK (display_order >= 0)
);

CREATE INDEX idx_post_images_post ON post_images(post_id, display_order);
```

#### post_likes table
```sql
CREATE TABLE post_likes (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT post_likes_unique UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);
```

#### post_comments table
```sql
CREATE TABLE post_comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_post_comments_post ON post_comments(post_id, created_at DESC);
CREATE INDEX idx_post_comments_user ON post_comments(user_id);
```

#### hashtags & post_hashtags tables
```sql
CREATE TABLE hashtags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hashtags_name ON hashtags(name);
CREATE INDEX idx_hashtags_usage ON hashtags(usage_count DESC);

CREATE TABLE post_hashtags (
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    hashtag_id BIGINT NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
    PRIMARY KEY(post_id, hashtag_id)
);

CREATE INDEX idx_post_hashtags_hashtag ON post_hashtags(hashtag_id);
```

## Backend Design

### Entity Classes

#### Post.java
```java
@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @Column(nullable = false)
    private Double latitude;
    
    @Column(nullable = false)
    private Double longitude;
    
    @Column(name = "location_name")
    private String locationName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostPrivacy privacy;
    
    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;
    
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<PostImage> images = new ArrayList<>();
    
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostLike> likes = new ArrayList<>();
    
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    private List<PostComment> comments = new ArrayList<>();
    
    @ManyToMany
    @JoinTable(
        name = "post_hashtags",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "hashtag_id")
    )
    private Set<Hashtag> hashtags = new HashSet<>();
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Helper methods
    public int getLikeCount() {
        return likes.size();
    }
    
    public int getCommentCount() {
        return comments.size();
    }
    
    public boolean isLikedBy(UUID userId) {
        return likes.stream()
            .anyMatch(like -> like.getUser().getId().equals(userId));
    }
}
```

### Repository Layer

#### PostRepository.java
```java
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    // Tìm posts gần vị trí (sử dụng PostGIS)
    @Query(value = """
        SELECT p.* FROM posts p
        WHERE p.privacy = 'PUBLIC'
        AND earth_distance(
            ll_to_earth(p.latitude, p.longitude),
            ll_to_earth(:latitude, :longitude)
        ) <= :radiusMeters
        ORDER BY p.created_at DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Post> findNearbyPublicPosts(
        @Param("latitude") Double latitude,
        @Param("longitude") Double longitude,
        @Param("radiusMeters") Double radiusMeters,
        @Param("limit") Integer limit
    );
    
    // Tìm posts của user
    @Query("SELECT p FROM Post p WHERE p.user.id = :userId ORDER BY p.createdAt DESC")
    Page<Post> findByUserId(@Param("userId") UUID userId, Pageable pageable);
    
    // Feed timeline (posts của bạn bè)
    @Query("""
        SELECT p FROM Post p
        WHERE p.user.id IN :friendIds
        AND p.privacy IN ('PUBLIC', 'FRIENDS_ONLY')
        ORDER BY p.createdAt DESC
        """)
    Page<Post> findFeedPosts(@Param("friendIds") List<UUID> friendIds, Pageable pageable);
    
    // Tìm posts theo hashtag
    @Query("""
        SELECT p FROM Post p
        JOIN p.hashtags h
        WHERE h.name = :hashtagName
        AND p.privacy = 'PUBLIC'
        ORDER BY p.createdAt DESC
        """)
    Page<Post> findByHashtag(@Param("hashtagName") String hashtagName, Pageable pageable);
}
```

### Service Layer

#### PostService.java
```java
@Service
public class PostService {
    
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final HashtagService hashtagService;
    private final FriendshipService friendshipService;
    
    // Tạo post mới
    public PostDTO createPost(CreatePostRequest request, UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException());
        
        Post post = Post.builder()
            .user(user)
            .content(request.getContent())
            .latitude(request.getLatitude())
            .longitude(request.getLongitude())
            .locationName(request.getLocationName())
            .privacy(request.getPrivacy())
            .build();
        
        // Add images
        if (request.getImageUrls() != null) {
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                PostImage image = PostImage.builder()
                    .post(post)
                    .imageUrl(request.getImageUrls().get(i))
                    .displayOrder(i)
                    .build();
                post.getImages().add(image);
            }
        }
        
        // Extract and add hashtags
        Set<String> hashtags = extractHashtags(request.getContent());
        for (String tag : hashtags) {
            Hashtag hashtag = hashtagService.findOrCreate(tag);
            post.getHashtags().add(hashtag);
        }
        
        Post saved = postRepository.save(post);
        return toDTO(saved, userId);
    }
    
    // Lấy posts gần vị trí
    public List<PostDTO> getNearbyPosts(
        Double latitude, 
        Double longitude, 
        Double radiusKm,
        UUID currentUserId
    ) {
        Double radiusMeters = radiusKm * 1000;
        List<Post> posts = postRepository.findNearbyPublicPosts(
            latitude, longitude, radiusMeters, 100
        );
        
        return posts.stream()
            .map(post -> toDTO(post, currentUserId))
            .collect(Collectors.toList());
    }
    
    // Lấy feed timeline
    public Page<PostDTO> getFeedPosts(UUID userId, Pageable pageable) {
        List<UUID> friendIds = friendshipService.getFriendIds(userId);
        friendIds.add(userId); // Include own posts
        
        Page<Post> posts = postRepository.findFeedPosts(friendIds, pageable);
        return posts.map(post -> toDTO(post, userId));
    }
    
    // Helper: Extract hashtags từ content
    private Set<String> extractHashtags(String content) {
        Set<String> hashtags = new HashSet<>();
        Pattern pattern = Pattern.compile("#(\\w+)");
        Matcher matcher = pattern.matcher(content);
        
        while (matcher.find()) {
            hashtags.add(matcher.group(1).toLowerCase());
        }
        
        return hashtags;
    }
    
    // Convert to DTO
    private PostDTO toDTO(Post post, UUID currentUserId) {
        return PostDTO.builder()
            .id(post.getId())
            .user(UserSummaryDTO.from(post.getUser()))
            .content(post.getContent())
            .latitude(post.getLatitude())
            .longitude(post.getLongitude())
            .locationName(post.getLocationName())
            .privacy(post.getPrivacy())
            .images(post.getImages().stream()
                .map(PostImageDTO::from)
                .collect(Collectors.toList()))
            .likeCount(post.getLikeCount())
            .commentCount(post.getCommentCount())
            .isLiked(post.isLikedBy(currentUserId))
            .viewCount(post.getViewCount())
            .createdAt(post.getCreatedAt())
            .build();
    }
}
```

## Frontend Design

### Component Structure

```
src/features/posts/
├── components/
│   ├── PostMarker.tsx              # Custom marker với thumbnail
│   ├── PostCard.tsx                # Card hiển thị post trong feed
│   ├── PostDetailModal.tsx         # Modal chi tiết post
│   ├── CreatePostButton.tsx        # Floating + button
│   ├── ImageCarousel.tsx           # Carousel cho nhiều ảnh
│   ├── CommentList.tsx             # Danh sách comments
│   ├── CommentInput.tsx            # Input để comment
│   └── LikeButton.tsx              # Button like/unlike
├── screens/
│   ├── CreatePostScreen.tsx        # Màn hình tạo post
│   └── PostDetailScreen.tsx        # Màn hình chi tiết post
├── hooks/
│   ├── usePosts.ts                 # Hook quản lý posts
│   ├── useCreatePost.ts            # Hook tạo post
│   ├── usePostInteractions.ts      # Hook like/comment
│   └── useNearbyPosts.ts           # Hook lấy posts gần
├── services/
│   └── post.service.ts             # API calls
└── types/
    └── post.types.ts               # TypeScript types
```

### Key Components

#### PostMarker.tsx
```typescript
interface PostMarkerProps {
  post: Post;
  onPress: (post: Post) => void;
}

export const PostMarker: React.FC<PostMarkerProps> = ({ post, onPress }) => {
  const thumbnailUrl = post.images[0]?.thumbnailUrl;
  
  return (
    <Marker
      coordinate={{
        latitude: post.latitude,
        longitude: post.longitude,
      }}
      onPress={() => onPress(post)}
    >
      <View style={styles.markerContainer}>
        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <Text>📝</Text>
          </View>
        )}
        <Image 
          source={{ uri: post.user.avatarUrl }} 
          style={styles.avatar}
        />
      </View>
    </Marker>
  );
};
```

#### CreatePostScreen.tsx
```typescript
export const CreatePostScreen = () => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [privacy, setPrivacy] = useState<PostPrivacy>('PUBLIC');
  
  const { createPost, isLoading } = useCreatePost();
  
  const handlePickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });
    
    if (!result.canceled) {
      setImages(result.assets.map(asset => asset.uri));
    }
  };
  
  const handleSubmit = async () => {
    if (!location) {
      Alert.alert('Lỗi', 'Vui lòng chọn vị trí');
      return;
    }
    
    await createPost({
      content,
      images,
      latitude: location.latitude,
      longitude: location.longitude,
      privacy,
    });
  };
  
  return (
    <View style={styles.container}>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="Bạn đang nghĩ gì?"
        multiline
      />
      
      <ImageGrid images={images} onRemove={handleRemoveImage} />
      
      <Button title="Thêm ảnh" onPress={handlePickImages} />
      
      <LocationPicker
        location={location}
        onLocationChange={setLocation}
      />
      
      <PrivacySelector
        value={privacy}
        onChange={setPrivacy}
      />
      
      <Button
        title="Đăng"
        onPress={handleSubmit}
        disabled={isLoading || !content.trim()}
      />
    </View>
  );
};
```

### State Management

#### usePosts.ts
```typescript
export const usePosts = (latitude: number, longitude: number, radius: number) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await postService.getNearbyPosts(latitude, longitude, radius);
      setPosts(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude, radius]);
  
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);
  
  return { posts, isLoading, error, refresh: loadPosts };
};
```

## API Design

### Request/Response DTOs

#### CreatePostRequest
```json
{
  "content": "Beautiful sunset at the beach! #sunset #beach",
  "latitude": 10.762622,
  "longitude": 106.660172,
  "locationName": "Bãi biển Vũng Tàu",
  "privacy": "PUBLIC",
  "imageUrls": [
    "https://storage.example.com/images/abc123.jpg",
    "https://storage.example.com/images/def456.jpg"
  ]
}
```

#### PostDTO Response
```json
{
  "id": 123,
  "user": {
    "id": "uuid-123",
    "username": "john_doe",
    "nickName": "John Doe",
    "avatarUrl": "https://..."
  },
  "content": "Beautiful sunset at the beach! #sunset #beach",
  "latitude": 10.762622,
  "longitude": 106.660172,
  "locationName": "Bãi biển Vũng Tàu",
  "privacy": "PUBLIC",
  "images": [
    {
      "id": 1,
      "imageUrl": "https://...",
      "thumbnailUrl": "https://...",
      "displayOrder": 0
    }
  ],
  "likeCount": 42,
  "commentCount": 15,
  "isLiked": true,
  "viewCount": 234,
  "hashtags": ["sunset", "beach"],
  "createdAt": "2026-03-07T10:30:00Z"
}
```

## UI/UX Design

### Map Screen Layout
```
┌─────────────────────────────────────┐
│  [Search Bar]          [Filter]     │ ← Top bar
│                                      │
│                                      │
│         🗺️  Map View                │
│      (with post markers)             │
│                                      │
│                                      │
│                                      │
│                                      │
│                                  [+] │ ← Floating button
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Post Card (selected)          │ │ ← Bottom sheet
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Post Marker Design
```
┌─────────────┐
│  📷 Image   │ ← Thumbnail (40x40)
│  Thumbnail  │
└─────────────┘
     │
     └─ 👤 ← User avatar (20x20, bottom-right corner)
```

### Create Post Flow
```
1. User taps [+] button
   ↓
2. Open Create Post Screen
   - Text input
   - Image picker
   - Location picker (map)
   - Privacy selector
   ↓
3. User fills in details
   ↓
4. User taps "Đăng"
   ↓
5. Upload images → Create post → Show success
   ↓
6. Navigate back to map
   ↓
7. New post appears on map
```

## Performance Optimization

### Backend
1. **Spatial Indexing**: PostGIS với GIST index cho location queries
2. **Pagination**: Limit results, use cursor-based pagination
3. **Eager Loading**: Fetch user + images trong 1 query
4. **Caching**: Cache trending hashtags, user profiles
5. **Database Connection Pool**: Optimize connection management

### Frontend
1. **Image Optimization**:
   - Compress trước khi upload (quality: 0.8)
   - Generate thumbnails cho markers (100x100)
   - Lazy load images trong feed
   - Use expo-image với caching

2. **Map Performance**:
   - Cluster posts khi zoom out (supercluster)
   - Chỉ render markers trong viewport
   - Debounce region changes (500ms)
   - Memoize marker components

3. **List Performance**:
   - FlatList với windowSize optimization
   - Memoize list items
   - Pagination với infinite scroll
   - Pull-to-refresh

## Security Considerations

1. **Authorization**:
   - Chỉ owner có thể edit/delete post
   - Privacy settings được enforce ở backend
   - Friends-only posts chỉ visible cho bạn bè

2. **Input Validation**:
   - Content max length: 5000 chars
   - Max 5 images per post
   - Image size limit: 10MB per image
   - Validate coordinates range

3. **Rate Limiting**:
   - Max 10 posts per user per day
   - Max 100 likes per user per hour
   - Max 50 comments per user per hour

4. **Image Upload**:
   - Validate file type (jpg, png only)
   - Scan for malware
   - Generate unique filenames
   - Use signed URLs for upload

## Testing Strategy

### Backend Tests
- Unit tests cho services
- Integration tests cho repositories
- API tests cho controllers
- Property-based tests cho spatial queries

### Frontend Tests
- Component tests với React Testing Library
- Hook tests
- Integration tests cho screens
- E2E tests với Detox (optional)

## Deployment Considerations

1. **Image Storage**: Setup AWS S3 hoặc Cloudinary
2. **Database**: Enable PostGIS extension
3. **Environment Variables**: API keys, storage credentials
4. **Monitoring**: Log errors, track performance metrics
5. **Backup**: Regular database backups
