package com.mapic.service;

import com.mapic.entity.Friendship;
import com.mapic.entity.Post;
import com.mapic.entity.User;
import com.mapic.entity.UserInteraction;
import com.mapic.repository.FriendshipRepository;
import com.mapic.repository.PostRepository;
import com.mapic.repository.UserInteractionRepository;
import com.mapic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationServiceImpl implements RecommendationService {
    
    private final UserInteractionRepository interactionRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;
    private final FeedbackService feedbackService;
    
    private static final int INTERACTION_HISTORY_DAYS = 30;
    private static final int SIMILAR_USERS_LIMIT = 10;
    private static final double NEARBY_RADIUS_KM = 50.0;
    
    @Override
    @Transactional(readOnly = true)
    public Page<Post> getPersonalizedFeed(UUID userId, Pageable pageable) {
        log.info("Getting personalized feed for user: {}", userId);
        
        // Get posts user is not interested in
        List<Long> notInterestedPostIds = feedbackService.getNotInterestedPostIds(userId);
        
        // Get user's interaction history
        LocalDateTime since = LocalDateTime.now().minusDays(INTERACTION_HISTORY_DAYS);
        List<UserInteraction> recentInteractions = interactionRepository
            .findByUserIdAndTimestampAfterOrderByTimestampDesc(userId, since);
        
        if (recentInteractions.isEmpty()) {
            // No history - return popular posts
            return postRepository.findAll(pageable);
        }
        
        // Get user's favorite hashtags
        List<Object[]> topHashtags = interactionRepository.findTopHashtagsByUser(userId, since);
        Set<String> favoriteHashtags = topHashtags.stream()
            .limit(5)
            .map(row -> (String) row[0])
            .collect(Collectors.toSet());
        
        // Get similar users
        List<Object[]> similarUsersData = interactionRepository.findSimilarUsers(userId, since);
        Set<UUID> similarUserIds = similarUsersData.stream()
            .limit(SIMILAR_USERS_LIMIT)
            .map(row -> (UUID) row[0])
            .collect(Collectors.toSet());
        
        // Get posts from similar users with favorite hashtags
        List<Post> recommendedPosts = new ArrayList<>();
        
        // Strategy 1: Posts with favorite hashtags
        if (!favoriteHashtags.isEmpty()) {
            List<Post> hashtagPosts = postRepository.findAll().stream()
                .filter(post -> post.getHashtags().stream()
                    .anyMatch(hashtag -> favoriteHashtags.contains(hashtag.getName())))
                .filter(post -> !interactionRepository.existsByUserIdAndPostId(userId, post.getId()))
                .filter(post -> !notInterestedPostIds.contains(post.getId())) // Filter out not interested
                .limit(pageable.getPageSize() / 2)
                .collect(Collectors.toList());
            recommendedPosts.addAll(hashtagPosts);
        }
        
        // Strategy 2: Posts from similar users
        if (!similarUserIds.isEmpty()) {
            List<Post> similarUserPosts = postRepository.findAll().stream()
                .filter(post -> similarUserIds.contains(post.getUser().getId()))
                .filter(post -> !interactionRepository.existsByUserIdAndPostId(userId, post.getId()))
                .filter(post -> !notInterestedPostIds.contains(post.getId())) // Filter out not interested
                .limit(pageable.getPageSize() / 2)
                .collect(Collectors.toList());
            recommendedPosts.addAll(similarUserPosts);
        }
        
        // Remove duplicates and sort by engagement
        List<Post> uniquePosts = recommendedPosts.stream()
            .distinct()
            .sorted((p1, p2) -> Integer.compare(
                p2.getLikes().size() + p2.getComments().size(),
                p1.getLikes().size() + p1.getComments().size()
            ))
            .limit(pageable.getPageSize())
            .collect(Collectors.toList());
        
        return new PageImpl<>(uniquePosts, pageable, uniquePosts.size());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<Post> getDiscoveryFeed(UUID userId, Double latitude, Double longitude, Pageable pageable) {
        log.info("Getting discovery feed for user: {}", userId);
        
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return Page.empty(pageable);
        }
        
        // Get user's friend IDs
        List<Friendship> friendships = friendshipRepository.findAcceptedFriendshipsByUserId(userId);
        Set<UUID> friendIds = friendships.stream()
            .map(f -> f.getUserId().equals(userId) ? f.getFriendId() : f.getUserId())
            .collect(Collectors.toSet());
        
        // Get posts NOT from friends, NOT already seen
        LocalDateTime since = LocalDateTime.now().minusDays(7);
        List<Post> discoveryPosts = postRepository.findAll().stream()
            .filter(post -> !friendIds.contains(post.getUser().getId()))
            .filter(post -> !post.getUser().getId().equals(userId))
            .filter(post -> !interactionRepository.existsByUserIdAndPostId(userId, post.getId()))
            .filter(post -> post.getCreatedAt().isAfter(since))
            .filter(post -> "PUBLIC".equals(post.getPrivacy()))
            .collect(Collectors.toList());
        
        // If location provided, prioritize nearby posts
        if (latitude != null && longitude != null) {
            discoveryPosts.sort((p1, p2) -> {
                double dist1 = calculateDistance(latitude, longitude, p1.getLatitude(), p1.getLongitude());
                double dist2 = calculateDistance(latitude, longitude, p2.getLatitude(), p2.getLongitude());
                
                // Prioritize nearby posts
                if (dist1 < NEARBY_RADIUS_KM && dist2 >= NEARBY_RADIUS_KM) return -1;
                if (dist2 < NEARBY_RADIUS_KM && dist1 >= NEARBY_RADIUS_KM) return 1;
                
                // Then by engagement
                int engagement1 = p1.getLikes().size() + p1.getComments().size();
                int engagement2 = p2.getLikes().size() + p2.getComments().size();
                return Integer.compare(engagement2, engagement1);
            });
        } else {
            // Sort by engagement only
            discoveryPosts.sort((p1, p2) -> {
                int engagement1 = p1.getLikes().size() + p1.getComments().size();
                int engagement2 = p2.getLikes().size() + p2.getComments().size();
                return Integer.compare(engagement2, engagement1);
            });
        }
        
        List<Post> pagedPosts = discoveryPosts.stream()
            .skip(pageable.getOffset())
            .limit(pageable.getPageSize())
            .collect(Collectors.toList());
        
        return new PageImpl<>(pagedPosts, pageable, discoveryPosts.size());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Post> getRecommendedPosts(UUID userId, int limit) {
        Page<Post> personalizedFeed = getPersonalizedFeed(userId, Pageable.ofSize(limit));
        return personalizedFeed.getContent();
    }
    
    @Override
    @Transactional
    public void trackInteraction(UUID userId, Long postId, String interactionType, Integer durationSeconds) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            Post post = postRepository.findById(postId).orElse(null);
            
            if (user == null || post == null) {
                log.warn("Cannot track interaction - user or post not found");
                return;
            }
            
            UserInteraction interaction = UserInteraction.builder()
                .user(user)
                .post(post)
                .interactionType(UserInteraction.InteractionType.valueOf(interactionType.toUpperCase()))
                .durationSeconds(durationSeconds)
                .timestamp(LocalDateTime.now())
                .build();
            
            interactionRepository.save(interaction);
            log.debug("Tracked {} interaction for user {} on post {}", interactionType, userId, postId);
        } catch (Exception e) {
            log.error("Error tracking interaction", e);
        }
    }
    
    @Override
    public String getRecommendationReason(UUID userId, Long postId) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) {
            return "Bài viết phổ biến";
        }
        
        // Check if from similar users
        LocalDateTime since = LocalDateTime.now().minusDays(INTERACTION_HISTORY_DAYS);
        List<Object[]> similarUsers = interactionRepository.findSimilarUsers(userId, since);
        Set<UUID> similarUserIds = similarUsers.stream()
            .limit(SIMILAR_USERS_LIMIT)
            .map(row -> (UUID) row[0])
            .collect(Collectors.toSet());
        
        if (similarUserIds.contains(post.getUser().getId())) {
            return "Từ người dùng có sở thích tương tự";
        }
        
        // Check if has favorite hashtags
        List<Object[]> topHashtags = interactionRepository.findTopHashtagsByUser(userId, since);
        Set<String> favoriteHashtags = topHashtags.stream()
            .limit(5)
            .map(row -> (String) row[0])
            .collect(Collectors.toSet());
        
        boolean hasFavoriteHashtag = post.getHashtags().stream()
            .anyMatch(hashtag -> favoriteHashtags.contains(hashtag.getName()));
        
        if (hasFavoriteHashtag) {
            return "Chủ đề bạn quan tâm";
        }
        
        // Check engagement
        int engagement = post.getLikes().size() + post.getComments().size();
        if (engagement > 10) {
            return "Đang được nhiều người quan tâm";
        }
        
        return "Gợi ý cho bạn";
    }
    
    private double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return Double.MAX_VALUE;
        }
        
        final int R = 6371; // Earth radius in km
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }
}
