# Social Posts API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>` header, except where noted.

---

## Post Management

### Create Post
```http
POST /api/posts
Content-Type: application/json
Authorization: Bearer <token>

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

**Response:** `201 Created`
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
  "likeCount": 0,
  "commentCount": 0,
  "isLiked": false,
  "viewCount": 0,
  "hashtags": ["sunset", "beach"],
  "createdAt": "2026-03-07T10:30:00Z",
  "updatedAt": "2026-03-07T10:30:00Z"
}
```

### Get Post by ID
```http
GET /api/posts/{id}
Authorization: Bearer <token>
```

**Response:** `200 OK` - Same structure as Create Post response

### Update Post
```http
PUT /api/posts/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "content": "Updated content #newhashtag",
  "privacy": "FRIENDS_ONLY",
  "locationName": "Updated location"
}
```

**Response:** `200 OK` - Updated post object

### Delete Post
```http
DELETE /api/posts/{id}
Authorization: Bearer <token>
```

**Response:** `204 No Content`

### Get Nearby Posts
```http
GET /api/posts/nearby?latitude=10.762622&longitude=106.660172&radius=5
Authorization: Bearer <token> (optional)
```

**Query Parameters:**
- `latitude` (required): Latitude coordinate
- `longitude` (required): Longitude coordinate
- `radius` (optional): Radius in kilometers (default: 5.0)

**Response:** `200 OK`
```json
[
  {
    "id": 123,
    "user": {...},
    "content": "...",
    ...
  }
]
```

### Get Feed Posts
```http
GET /api/posts/feed?page=0&size=20
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20)
- `sort` (optional): Sort field (default: createdAt)
- `direction` (optional): Sort direction (default: DESC)

**Response:** `200 OK`
```json
{
  "content": [...],
  "pageable": {...},
  "totalPages": 5,
  "totalElements": 100,
  "last": false,
  "size": 20,
  "number": 0
}
```

### Get Posts by User
```http
GET /api/posts/user/{userId}?page=0&size=20
Authorization: Bearer <token> (optional)
```

**Response:** `200 OK` - Paginated posts

### Get Posts by Hashtag
```http
GET /api/posts/hashtag/{name}?page=0&size=20
Authorization: Bearer <token> (optional)
```

**Response:** `200 OK` - Paginated posts

### Get User's Post Count
```http
GET /api/posts/user/{userId}/count
```

**Response:** `200 OK`
```json
42
```

---

## Post Interactions

### Like Post
```http
POST /api/posts/{id}/like
Authorization: Bearer <token>
```

**Response:** `201 Created`

### Unlike Post
```http
DELETE /api/posts/{id}/like
Authorization: Bearer <token>
```

**Response:** `204 No Content`

### Get Likes
```http
GET /api/posts/{id}/likes?page=0&size=20
```

**Response:** `200 OK`
```json
{
  "content": [
    {
      "id": "uuid-123",
      "username": "john_doe",
      "nickName": "John Doe",
      "avatarUrl": "https://..."
    }
  ],
  "totalElements": 42
}
```

### Check if Post is Liked
```http
GET /api/posts/{id}/liked
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
true
```

### Get Like Count
```http
GET /api/posts/{id}/likes/count
```

**Response:** `200 OK`
```json
42
```

### Add Comment
```http
POST /api/posts/{id}/comments
Content-Type: application/json
Authorization: Bearer <token>

{
  "content": "Great photo!"
}
```

**Response:** `201 Created`
```json
{
  "id": 456,
  "postId": 123,
  "user": {
    "id": "uuid-123",
    "username": "john_doe",
    "nickName": "John Doe",
    "avatarUrl": "https://..."
  },
  "content": "Great photo!",
  "createdAt": "2026-03-07T10:30:00Z",
  "updatedAt": "2026-03-07T10:30:00Z"
}
```

### Get Comments
```http
GET /api/posts/{id}/comments?page=0&size=20
```

**Response:** `200 OK` - Paginated comments

### Update Comment
```http
PUT /api/posts/comments/{commentId}
Content-Type: application/json
Authorization: Bearer <token>

{
  "content": "Updated comment"
}
```

**Response:** `200 OK` - Updated comment object

### Delete Comment
```http
DELETE /api/posts/comments/{commentId}
Authorization: Bearer <token>
```

**Response:** `204 No Content`

### Get Comment Count
```http
GET /api/posts/{id}/comments/count
```

**Response:** `200 OK`
```json
15
```

---

## Hashtags

### Get Trending Hashtags
```http
GET /api/hashtags/trending?page=0&size=20
```

**Response:** `200 OK`
```json
{
  "content": [
    {
      "id": 1,
      "name": "sunset",
      "usageCount": 234
    },
    {
      "id": 2,
      "name": "beach",
      "usageCount": 189
    }
  ]
}
```

### Get Top N Trending Hashtags
```http
GET /api/hashtags/top?limit=10
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "sunset",
    "usageCount": 234
  }
]
```

### Search Hashtags
```http
GET /api/hashtags/search?q=sun&limit=10
```

**Query Parameters:**
- `q` (required): Search prefix
- `limit` (optional): Max results (default: 10)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "sunset",
    "usageCount": 234
  },
  {
    "id": 2,
    "name": "sunrise",
    "usageCount": 156
  }
]
```

---

## Privacy Settings

### PUBLIC
- Visible to everyone
- Appears in nearby searches for all users
- Appears in hashtag searches

### FRIENDS_ONLY
- Visible only to friends
- Appears in nearby searches only for friends
- Does not appear in public hashtag searches

### PRIVATE
- Visible only to the owner
- Does not appear in any searches
- Draft mode

---

## Error Responses

### 400 Bad Request
```json
{
  "timestamp": "2026-03-07T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": [
    {
      "field": "content",
      "message": "Content is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "timestamp": "2026-03-07T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "timestamp": "2026-03-07T10:30:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Not authorized to update this post"
}
```

### 404 Not Found
```json
{
  "timestamp": "2026-03-07T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Post not found"
}
```

---

## Rate Limits

- Post creation: 10 posts per user per day
- Likes: 100 likes per user per hour
- Comments: 50 comments per user per hour

---

## Testing with cURL

### Create a post
```bash
curl -X POST http://localhost:8080/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test post #test",
    "latitude": 10.762622,
    "longitude": 106.660172,
    "locationName": "Test Location",
    "privacy": "PUBLIC",
    "imageUrls": []
  }'
```

### Get nearby posts
```bash
curl -X GET "http://localhost:8080/api/posts/nearby?latitude=10.762622&longitude=106.660172&radius=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Like a post
```bash
curl -X POST http://localhost:8080/api/posts/123/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Add a comment
```bash
curl -X POST http://localhost:8080/api/posts/123/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Great post!"
  }'
```
