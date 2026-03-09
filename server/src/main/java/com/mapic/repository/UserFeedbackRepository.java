package com.mapic.repository;

import com.mapic.entity.UserFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface UserFeedbackRepository extends JpaRepository<UserFeedback, Long> {
    
    /**
     * Check if user has given feedback for a post
     */
    boolean existsByUserIdAndPostId(UUID userId, Long postId);
    
    /**
     * Get all negative feedback from a user
     */
    @Query("SELECT f FROM UserFeedback f WHERE f.user.id = :userId " +
           "AND f.feedbackType IN ('NOT_INTERESTED', 'HIDE_POST', 'NOT_RELEVANT') " +
           "AND f.createdAt > :since")
    List<UserFeedback> findNegativeFeedbackByUser(
        @Param("userId") UUID userId,
        @Param("since") LocalDateTime since
    );
    
    /**
     * Get posts user is not interested in
     */
    @Query("SELECT f.post.id FROM UserFeedback f WHERE f.user.id = :userId " +
           "AND f.feedbackType = 'NOT_INTERESTED'")
    List<Long> findNotInterestedPostIds(@Param("userId") UUID userId);
    
    /**
     * Count feedback by type for analytics
     */
    @Query("SELECT f.feedbackType, COUNT(f) FROM UserFeedback f " +
           "WHERE f.createdAt > :since GROUP BY f.feedbackType")
    List<Object[]> countFeedbackByType(@Param("since") LocalDateTime since);
}
