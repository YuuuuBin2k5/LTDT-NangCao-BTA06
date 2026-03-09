package com.mapic.repository;

import com.mapic.entity.Review;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Repository interface for Review entity operations.
 * Provides query methods for retrieving reviews with permission-based filtering.
 * Uses @EntityGraph to eagerly fetch author information and avoid N+1 query problems.
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    /**
     * Find all public reviews for a specific place.
     * Uses @EntityGraph to eagerly fetch the user (author) relationship to avoid N+1 queries.
     * 
     * @param placeId The ID of the place
     * @return List of public reviews with author information loaded
     */
    @EntityGraph(attributePaths = {"user"})
    List<Review> findByPlaceIdAndIsPublicTrue(Long placeId);

    /**
     * Find all private reviews for a specific place written by users in the provided set.
     * This is used to retrieve private reviews from friends only.
     * Uses @EntityGraph to eagerly fetch the user (author) relationship to avoid N+1 queries.
     * 
     * @param placeId The ID of the place
     * @param userIds Set of user IDs (typically friend IDs of the authenticated user)
     * @return List of private reviews from specified users with author information loaded
     */
    @EntityGraph(attributePaths = {"user"})
    List<Review> findByPlaceIdAndIsPublicFalseAndUserIdIn(Long placeId, Set<UUID> userIds);
}
