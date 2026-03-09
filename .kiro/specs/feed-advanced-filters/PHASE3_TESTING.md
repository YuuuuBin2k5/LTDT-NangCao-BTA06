# Phase 3 Testing Guide

## Server Status
✅ Server running on port 8081
✅ V9 migration applied (user_interactions table created)

## Testing Endpoints

### 1. Test "For You" Feed

```bash
# Get personalized recommendations
curl -X GET "http://10.10.1.109:8081/api/recommendations/for-you?page=0&size=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "content": [
    {
      "id": 123,
      "content": "Post content...",
      "user": {...},
      "likes": [...],
      "comments": [...]
    }
  ],
  "totalElements": 50,
  "totalPages": 3,
  "number": 0,
  "size": 20,
  "last": false
}
```

### 2. Test Discovery Feed

```bash
# Get discovery feed with location
curl -X GET "http://10.10.1.109:8081/api/recommendations/discovery?latitude=10.762622&longitude=106.660172&page=0&size=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get discovery feed without location
curl -X GET "http://10.10.1.109:8081/api/recommendations/discovery?page=0&size=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Interaction Tracking

```bash
# Track a view
curl -X POST "http://10.10.1.109:8081/api/recommendations/track" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": 123,
    "interactionType": "VIEW",
    "durationSeconds": 5
  }'

# Track a like
curl -X POST "http://10.10.1.109:8081/api/recommendations/track" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": 123,
    "interactionType": "LIKE"
  }'

# Track a comment
curl -X POST "http://10.10.1.109:8081/api/recommendations/track" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": 123,
    "interactionType": "COMMENT"
  }'
```

**Expected Response:** 200 OK (empty body)

### 4. Test Recommendation Reason

```bash
# Get reason for a post
curl -X GET "http://10.10.1.109:8081/api/recommendations/reason/123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```
"Từ người dùng có sở thích tương tự"
```

or

```
"Chủ đề bạn quan tâm"
```

or

```
"Đang được nhiều người quan tâm"
```

## Testing Scenarios

### Scenario 1: New User (Cold Start)
1. Create a new user account
2. Call `/api/recommendations/for-you`
3. **Expected:** Returns popular posts (no personalization yet)
4. User likes some posts
5. Track interactions
6. Call `/api/recommendations/for-you` again
7. **Expected:** Starts showing personalized content

### Scenario 2: Active User with History
1. Use existing user with interaction history
2. Call `/api/recommendations/for-you`
3. **Expected:** Returns posts based on:
   - Favorite hashtags
   - Similar users' posts
4. Check recommendation reasons
5. **Expected:** Reasons explain why posts were shown

### Scenario 3: Discovery Mode
1. User with friends
2. Call `/api/recommendations/discovery` with location
3. **Expected:** Returns posts:
   - NOT from friends
   - NOT already seen
   - Prioritizes nearby posts
   - Only public posts
4. User interacts with discovery posts
5. Track interactions
6. Future recommendations improve

### Scenario 4: Interaction Tracking
1. User views a post for 5 seconds
2. Track VIEW interaction
3. User likes the post
4. Track LIKE interaction
5. User comments
6. Track COMMENT interaction
7. Check database: `SELECT * FROM user_interactions WHERE user_id = ?`
8. **Expected:** All interactions recorded

## Database Verification

### Check user_interactions table
```sql
-- See all interactions for a user
SELECT * FROM user_interactions 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY timestamp DESC;

-- Count interactions by type
SELECT interaction_type, COUNT(*) 
FROM user_interactions 
WHERE user_id = 'YOUR_USER_ID' 
GROUP BY interaction_type;

-- See user's favorite hashtags
SELECT h.name, COUNT(*) as count
FROM user_interactions ui
JOIN posts p ON ui.post_id = p.id
JOIN post_hashtags ph ON p.id = ph.post_id
JOIN hashtags h ON ph.hashtag_id = h.id
WHERE ui.user_id = 'YOUR_USER_ID'
  AND ui.timestamp > NOW() - INTERVAL '30 days'
GROUP BY h.name
ORDER BY count DESC
LIMIT 5;
```

## Frontend Testing

### Test "For You" Filter
1. Open Mapic app
2. Go to Feed screen
3. Tap "✨ Dành cho bạn" in FilterBar
4. **Expected:** 
   - Feed loads with personalized posts
   - Recommendation badges appear
   - Reasons are shown

### Test Discovery Mode
1. Open Mapic app
2. Go to Feed screen
3. Tap "+" button
4. Filter sheet opens
5. See "✨ Gợi ý thông minh" section
6. Tap "🔍 Khám phá"
7. **Expected:**
   - Discovery feed loads
   - Posts from outside network
   - Nearby posts prioritized

### Test View Tracking
1. Scroll through feed
2. View a post for >2 seconds
3. Check network tab
4. **Expected:** POST to `/api/recommendations/track` with VIEW

### Test Interaction Tracking
1. Like a post
2. Check network tab
3. **Expected:** POST to `/api/recommendations/track` with LIKE
4. Comment on a post
5. **Expected:** POST to `/api/recommendations/track` with COMMENT

## Performance Testing

### Load Test
```bash
# Install Apache Bench (if not installed)
# Windows: Download from Apache website
# Mac: brew install httpd
# Linux: sudo apt-get install apache2-utils

# Test For You endpoint
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  "http://10.10.1.109:8081/api/recommendations/for-you?page=0&size=20"

# Test Discovery endpoint
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  "http://10.10.1.109:8081/api/recommendations/discovery?page=0&size=20"
```

**Expected:**
- P95 response time <500ms
- No errors
- Consistent performance

## Known Issues to Test

1. **Cold start problem** - New users get generic recommendations
2. **Empty discovery feed** - If no posts outside network
3. **Duplicate tracking** - Ensure views aren't tracked multiple times
4. **Performance with large history** - Test with users who have 1000+ interactions

## Success Criteria

- [ ] All endpoints return 200 OK
- [ ] Personalized feed shows relevant posts
- [ ] Discovery feed shows posts outside network
- [ ] Interaction tracking works correctly
- [ ] Recommendation reasons are accurate
- [ ] No errors in server logs
- [ ] Performance meets targets (<500ms p95)
- [ ] Frontend UI works smoothly
- [ ] View tracking doesn't impact scroll performance

## Next Steps After Testing

1. Fix any bugs found
2. Optimize slow queries
3. Add more recommendation reasons
4. Implement "Not Interested" feedback
5. Add recommendation analytics
6. Write comprehensive tests
7. Deploy to production

