package com.mapic.service;

import com.mapic.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface RecommendationService {
    
    /**
     * Get personalized "For You" feed
     */
    Page<Post> getPersonalizedFeed(UUID userId, Pageable pageable);
    
    /**
     * Get discovery posts (outside user's network)
     */
    Page<Post> getDiscoveryFeed(UUID userId, Double latitude, Double longitude, Pageable pageable);
    
    /**
     * Get recommended posts based on user's interests
     */
    List<Post> getRecommendedPosts(UUID userId, int limit);
    
    /**
     * Track user interaction with post
     */
    void trackInteraction(UUID userId, Long postId, String interactionType, Integer durationSeconds);
    
    /**
     * Get explanation for why a post was recommended
     */
    String getRecommendationReason(UUID userId, Long postId);
}
