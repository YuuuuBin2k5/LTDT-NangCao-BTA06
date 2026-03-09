package com.mapic.service;

import com.mapic.dto.feed.UserFeedbackDTO;
import com.mapic.entity.UserFeedback;

import java.util.List;
import java.util.UUID;

/**
 * Service for handling user feedback on posts
 */
public interface FeedbackService {
    
    /**
     * Submit user feedback for a post
     */
    void submitFeedback(UUID userId, UserFeedbackDTO feedbackDTO);
    
    /**
     * Get posts user is not interested in
     */
    List<Long> getNotInterestedPostIds(UUID userId);
    
    /**
     * Check if user has given feedback for a post
     */
    boolean hasFeedback(UUID userId, Long postId);
    
    /**
     * Get user's negative feedback for filtering recommendations
     */
    List<UserFeedback> getNegativeFeedback(UUID userId, int days);
}
