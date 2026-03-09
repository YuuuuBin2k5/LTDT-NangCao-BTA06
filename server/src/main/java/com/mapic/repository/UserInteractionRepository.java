package com.mapic.repository;

import com.mapic.entity.UserInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface UserInteractionRepository extends JpaRepository<UserInteraction, Long> {
    
    /**
     * Get recent interactions for a user
     */
    List<UserInteraction> findByUserIdAndTimestampAfterOrderByTimestampDesc(
        UUID userId, 
        LocalDateTime after
    );
    
    /**
     * Get user's most interacted hashtags
     */
    @Query("""
        SELECT h.name, COUNT(ui.id) as count
        FROM UserInteraction ui
        JOIN ui.post p
        JOIN p.hashtags h
        WHERE ui.user.id = :userId
        AND ui.timestamp > :after
        GROUP BY h.name
        ORDER BY count DESC
        """)
    List<Object[]> findTopHashtagsByUser(
        @Param("userId") UUID userId,
        @Param("after") LocalDateTime after
    );
    
    /**
     * Get users with similar interests (collaborative filtering)
     */
    @Query("""
        SELECT ui2.user.id, COUNT(DISTINCT ui2.post.id) as commonPosts
        FROM UserInteraction ui1
        JOIN UserInteraction ui2 ON ui1.post.id = ui2.post.id
        WHERE ui1.user.id = :userId
        AND ui2.user.id != :userId
        AND ui1.timestamp > :after
        AND ui2.timestamp > :after
        GROUP BY ui2.user.id
        ORDER BY commonPosts DESC
        """)
    List<Object[]> findSimilarUsers(
        @Param("userId") UUID userId,
        @Param("after") LocalDateTime after
    );
    
    /**
     * Count interactions by post and type
     */
    Long countByPostIdAndInteractionType(Long postId, UserInteraction.InteractionType type);
    
    /**
     * Check if user has interacted with post
     */
    boolean existsByUserIdAndPostId(UUID userId, Long postId);
}
