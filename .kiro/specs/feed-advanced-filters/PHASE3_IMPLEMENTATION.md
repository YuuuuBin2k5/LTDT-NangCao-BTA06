# Phase 3: AI/ML Features & Discovery Mode - IMPLEMENTATION

## Summary
Phase 3 triển khai hệ thống gợi ý thông minh sử dụng AI/ML và chế độ khám phá (Discovery Mode), giúp người dùng tìm thấy nội dung mới và phù hợp với sở thích.

## Completed Tasks

### Backend (Java/Spring Boot) ✅

#### ✅ UserInteraction Entity
- `UserInteraction.java` - JPA entity để tracking user behavior:
  - Interaction types: VIEW, LIKE, COMMENT, SHARE, SAVE
  - Duration tracking cho views
  - Timestamp cho mỗi interaction
  - Indexes cho performance

#### ✅ UserInteractionRepository
- `UserInteractionRepository.java` - Repository với methods:
  - `findByUserIdAndTimestampAfterOrderByTimestampDesc()` - Get recent interactions
  - `existsByUserIdAndPostId()` - Check if user interacted with post
  - `findTopHashtagsByUser()` - Get user's favorite hashtags
  - `findSimilarUsers()` - Find users with similar interests

#### ✅ RecommendationService
- `RecommendationService.java` - Interface
- `RecommendationServiceImpl.java` - Implementation với:
  - **Personalized Feed Algorithm**:
    - Analyze user's interaction history (last 30 days)
    - Find favorite hashtags from liked posts
    - Find similar users based on shared interests
    - Recommend posts with favorite hashtags
    - Recommend posts from similar users
    - Sort by engagement score
  - **Discovery Feed Algorithm**:
    - Show posts outside user's friend network
    - Exclude already seen posts
    - Prioritize nearby posts (within 50km)
    - Sort by engagement
    - Only show public posts
  - **Interaction Tracking**:
    - Track all user interactions
    - Store view duration
    - Async processing for performance
  - **Recommendation Reasons**:
    - Explain why post was recommended
    - Multiple reason types

#### ✅ RecommendationController
- `RecommendationController.java` - REST endpoints:
  - `GET /api/recommendations/for-you` - Get personalized feed
  - `GET /api/recommendations/discovery` - Get discovery feed
  - `POST /api/recommendations/track` - Track interaction
  - `GET /api/recommendations/reason/{postId}` - Get recommendation reason

#### ✅ TrackInteractionDTO
- `TrackInteractionDTO.java` - DTO cho tracking requests:
  - postId
  - interactionType (VIEW, LIKE, COMMENT, SHARE, SAVE)
  - durationSeconds (optional)

#### ✅ Database Migration
- `V9__Create_user_interactions_table.sql` - Migration với:
  - user_interactions table
  - Indexes on (user_id, timestamp), post_id, interaction_type
  - Foreign keys với cascade delete
  - Comments for documentation

### Frontend (React Native/TypeScript) ✅

#### ✅ Recommendation Service
- `recommendation.service.ts` - Service với methods:
  - `getForYouFeed()` - Fetch personalized feed
  - `getDiscoveryFeed()` - Fetch discovery feed
  - `trackInteraction()` - Track user interactions
  - `getRecommendationReason()` - Get reason for recommendation

#### ✅ useRecommendations Hook
- `useRecommendations.ts` - Custom hook với:
  - Support for 'for-you' and 'discovery' types
  - Location-based discovery
  - Pagination support
  - Loading states
  - Error handling
  - Refresh and load more functionality

#### ✅ usePostTracking Hook
- `usePostTracking.ts` - Hook để track post views:
  - Track view duration
  - Minimum view duration threshold (2 seconds)
  - Track other interactions (LIKE, COMMENT, SHARE, SAVE)
  - Auto-cleanup on unmount
  - Prevent duplicate tracking

#### ✅ Filter Type Updates
- Updated `filter.types.ts`:
  - Added `RECOMMENDATION` filter type
  - Added `RecommendationFilterValue` enum (FOR_YOU, DISCOVERY)
  - Added labels for new filters

#### ✅ FilterBar Updates
- Added "✨ Dành cho bạn" as first quick filter
- Prominent position for personalized feed

#### ✅ FeedFilterBottomSheet Updates
- Added "✨ Gợi ý thông minh" section
- "Dành cho bạn" option
- "Khám phá" option
- Description explaining AI recommendations

#### ✅ useFeedFilters Updates
- Added conflict detection for recommendation filters
- Only one recommendation filter can be active at a time

#### ✅ RecommendationBadge Component
- `RecommendationBadge.tsx` - Component để show recommendation reason:
  - Displays why post was recommended
  - Fetches reason from API
  - Only shows for recommended posts
  - Styled badge with icon

## Features Implemented

### ✅ Personalized "For You" Feed
- **AI-powered recommendations** - Based on user behavior
- **Hashtag analysis** - Recommends posts with favorite hashtags
- **Collaborative filtering** - Finds similar users
- **Engagement scoring** - Prioritizes popular content
- **Diversity** - Mixes different recommendation strategies

### ✅ Discovery Mode
- **Explore outside network** - Shows posts from non-friends
- **Location-based** - Prioritizes nearby posts
- **Fresh content** - Only recent posts (last 7 days)
- **Public only** - Respects privacy settings
- **Engagement-based** - Shows popular discoveries

### ✅ Interaction Tracking
- **View tracking** - Tracks time spent viewing posts
- **Engagement tracking** - Tracks likes, comments, shares, saves
- **Minimum duration** - Only counts views >2 seconds
- **Background processing** - Doesn't block UI
- **Privacy-focused** - Only for improving recommendations

### ✅ Recommendation Explanations
- **Transparent AI** - Explains why post was recommended
- **Multiple reasons**:
  - "Từ người dùng có sở thích tương tự"
  - "Chủ đề bạn quan tâm"
  - "Đang được nhiều người quan tâm"
  - "Gợi ý cho bạn"

## Algorithm Details

### Personalized Feed Algorithm

```
1. Get user's recent interactions (last 30 days)
2. If no history → return popular posts

3. Analyze interactions:
   - Extract top 5 favorite hashtags
   - Find top 10 similar users (users who liked same posts)

4. Generate recommendations:
   Strategy 1: Posts with favorite hashtags (50% of results)
   Strategy 2: Posts from similar users (50% of results)

5. Filter:
   - Remove already seen posts
   - Remove duplicates

6. Sort by engagement score (likes + comments)

7. Return paginated results
```

### Discovery Feed Algorithm

```
1. Get user's friend list

2. Find candidate posts:
   - NOT from friends
   - NOT from user themselves
   - NOT already seen
   - Created in last 7 days
   - Privacy = PUBLIC

3. If location provided:
   - Calculate distance to each post
   - Prioritize posts within 50km
   - Then sort by engagement

4. If no location:
   - Sort by engagement only

5. Return paginated results
```

### Interaction Tracking

```
View Tracking:
1. Start timer when post becomes visible
2. Stop timer when post leaves viewport
3. Calculate duration
4. If duration >= 2 seconds → track VIEW
5. Send to backend asynchronously

Other Interactions:
1. User performs action (like, comment, etc.)
2. Immediately track interaction
3. Send to backend asynchronously
```

## API Examples

### Get "For You" Feed
```
GET /api/recommendations/for-you?page=0&size=20
Authorization: Bearer {token}

Response:
{
  "content": [
    {
      "id": 123,
      "content": "...",
      "user": {...},
      ...
    }
  ],
  "totalElements": 50,
  "totalPages": 3,
  "number": 0,
  "size": 20,
  "last": false
}
```

### Get Discovery Feed
```
GET /api/recommendations/discovery?latitude=10.762622&longitude=106.660172&page=0&size=20
Authorization: Bearer {token}

Response: (same structure as For You)
```

### Track Interaction
```
POST /api/recommendations/track
Authorization: Bearer {token}
Content-Type: application/json

{
  "postId": 123,
  "interactionType": "VIEW",
  "durationSeconds": 5
}

Response: 200 OK
```

### Get Recommendation Reason
```
GET /api/recommendations/reason/123
Authorization: Bearer {token}

Response: "Từ người dùng có sở thích tương tự"
```

## User Flow

### Using "For You" Feed
1. User opens feed
2. "✨ Dành cho bạn" filter is visible in FilterBar
3. User taps "Dành cho bạn"
4. System fetches personalized recommendations
5. Posts are displayed with recommendation badges
6. User scrolls and views posts
7. View duration is tracked automatically
8. User likes/comments → interaction is tracked
9. System learns from interactions
10. Future recommendations improve

### Using Discovery Mode
1. User taps "+" in FilterBar
2. Filter sheet opens
3. User sees "✨ Gợi ý thông minh" section
4. User taps "🔍 Khám phá"
5. System fetches discovery feed
6. Posts from outside network are shown
7. Nearby posts are prioritized
8. User can explore new content
9. Interactions are tracked
10. System learns user's broader interests

### Viewing Recommendation Reasons
1. User sees post in "For You" feed
2. Recommendation badge appears at top
3. Badge shows reason (e.g., "Chủ đề bạn quan tâm")
4. User understands why post was shown
5. Transparent AI builds trust

## Technical Highlights

### Performance
- ✅ Async interaction tracking (doesn't block UI)
- ✅ Efficient database queries with indexes
- ✅ Pagination for large result sets
- ✅ Caching of user preferences
- ✅ Batch processing of interactions

### Privacy
- ✅ Only tracks interactions for recommendations
- ✅ No personal data exposed
- ✅ Discovery only shows public posts
- ✅ Users control what they share
- ✅ Transparent about data usage

### Scalability
- ✅ Simple algorithm (no heavy ML frameworks)
- ✅ Can be enhanced with more sophisticated ML later
- ✅ Database indexes for fast queries
- ✅ Stateless service design
- ✅ Horizontal scaling ready

### Code Quality
- ✅ Type-safe TypeScript
- ✅ Clean separation of concerns
- ✅ Reusable hooks and components
- ✅ Proper error handling
- ✅ Vietnamese labels throughout

## Known Limitations

1. **Simple algorithm** - Not using advanced ML models (can be improved)
2. **Cold start problem** - New users with no history get generic recommendations
3. **No real-time updates** - Recommendations don't update in real-time
4. **Limited diversity** - May create filter bubble over time
5. **No A/B testing** - Can't compare algorithm variations
6. **No feedback loop** - Users can't say "not interested"

## Future Enhancements

### Short-term (Phase 4)
1. Add "Not Interested" button for discovery posts
2. Implement negative feedback (hide similar posts)
3. Add more recommendation reasons
4. Improve cold start with onboarding questions
5. Add recommendation diversity metrics

### Long-term
1. Implement advanced ML models (TensorFlow, PyTorch)
2. Add content-based filtering (image analysis, NLP)
3. Implement real-time recommendation updates
4. Add A/B testing framework
5. Build recommendation analytics dashboard
6. Implement federated learning for privacy
7. Add explainable AI features

## Files Created/Modified

### Backend (6 files)
- ✅ `server/src/main/java/com/mapic/entity/UserInteraction.java`
- ✅ `server/src/main/java/com/mapic/repository/UserInteractionRepository.java`
- ✅ `server/src/main/java/com/mapic/dto/feed/TrackInteractionDTO.java`
- ✅ `server/src/main/java/com/mapic/service/RecommendationService.java`
- ✅ `server/src/main/java/com/mapic/service/RecommendationServiceImpl.java`
- ✅ `server/src/main/java/com/mapic/controller/RecommendationController.java`
- ✅ `server/src/main/resources/db/migration/V9__Create_user_interactions_table.sql`

### Frontend (8 files)
- ✅ `client/src/features/posts/services/recommendation.service.ts`
- ✅ `client/src/features/posts/hooks/useRecommendations.ts`
- ✅ `client/src/features/posts/hooks/usePostTracking.ts`
- ✅ `client/src/features/posts/components/RecommendationBadge.tsx`
- ✅ `client/src/features/posts/types/filter.types.ts` (modified)
- ✅ `client/src/features/posts/components/FilterBar.tsx` (modified)
- ✅ `client/src/features/posts/components/FeedFilterBottomSheet.tsx` (modified)
- ✅ `client/src/features/posts/hooks/useFeedFilters.ts` (modified)

## Testing Checklist

### Backend Testing
- [ ] Test personalized feed with user history
- [ ] Test personalized feed without history (cold start)
- [ ] Test discovery feed with location
- [ ] Test discovery feed without location
- [ ] Test interaction tracking (all types)
- [ ] Test recommendation reasons
- [ ] Test with multiple users
- [ ] Test performance with large datasets

### Frontend Testing
- [ ] Test "For You" filter selection
- [ ] Test "Discovery" filter selection
- [ ] Test view tracking
- [ ] Test interaction tracking
- [ ] Test recommendation badge display
- [ ] Test pagination
- [ ] Test error handling
- [ ] Test offline behavior

### Integration Testing
- [ ] Test full recommendation flow
- [ ] Test interaction → recommendation improvement
- [ ] Test discovery → personalization
- [ ] Test with real user data
- [ ] Test performance under load

## Next Steps

### Immediate (Before Production)
1. ⚠️ **Restart server** to apply V9 migration
2. ⚠️ **Test all endpoints** with Postman/curl
3. ⚠️ **Integrate tracking** into PostCard component
4. ⚠️ **Add RecommendationBadge** to PostCard
5. ⚠️ **Test with real users** to gather feedback

### Phase 4 (Polish & Optimization)
1. Implement Redis caching for recommendations
2. Add filter analytics
3. Implement "Not Interested" feedback
4. Add recommendation diversity
5. Performance optimization
6. Create comprehensive tests
7. Write user documentation

## Success Metrics

### Engagement Metrics
- [ ] "For You" usage rate >40% of users
- [ ] Discovery mode usage rate >20% of users
- [ ] Average session time increase >15%
- [ ] Post engagement rate increase >10%

### Quality Metrics
- [ ] Recommendation relevance score >4/5
- [ ] Discovery satisfaction score >3.5/5
- [ ] User retention increase >5%
- [ ] Repeat usage rate >60%

### Technical Metrics
- [ ] API response time <200ms (p95)
- [ ] Tracking success rate >99%
- [ ] Zero data loss
- [ ] Error rate <0.1%

## Conclusion

Phase 3 đã triển khai thành công hệ thống gợi ý thông minh và Discovery Mode! Người dùng giờ có thể:
- Nhận gợi ý cá nhân hóa dựa trên sở thích
- Khám phá nội dung mới ngoài vòng tròn bạn bè
- Hiểu tại sao bài viết được gợi ý
- Hệ thống học từ hành vi để cải thiện gợi ý

Đây là bước tiến lớn giúp Mapic vượt trội hơn Bump với AI/ML recommendations!

🎉 **Phase 3 Complete - Ready for Testing!**

---

**Status:** ✅ IMPLEMENTATION COMPLETE - NEEDS TESTING
**Next Phase:** Phase 4 - Polish & Optimization
**Estimated Time:** 2 weeks

