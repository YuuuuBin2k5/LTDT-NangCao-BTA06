package com.mapic.repository;

import com.mapic.entity.Post;
import com.mapic.entity.PostPrivacy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, Long>, JpaSpecificationExecutor<Post> {

    /**
     * Find nearby public posts using simple distance calculation
     * Uses Haversine formula for distance calculation
     */
    @Query(value = """
        SELECT p.* FROM posts p
        WHERE p.privacy = 'PUBLIC'
        AND (
            6371000 * acos(
                cos(radians(:latitude)) * cos(radians(p.latitude)) *
                cos(radians(p.longitude) - radians(:longitude)) +
                sin(radians(:latitude)) * sin(radians(p.latitude))
            )
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

    /**
     * Find nearby posts visible to a specific user (includes friends-only posts)
     */
    @Query(value = """
        SELECT DISTINCT p.* FROM posts p
        LEFT JOIN friendships f1 ON (f1.user_id = :userId AND f1.friend_id = p.user_id AND f1.status = 'ACCEPTED')
        LEFT JOIN friendships f2 ON (f2.friend_id = :userId AND f2.user_id = p.user_id AND f2.status = 'ACCEPTED')
        WHERE (
            6371000 * acos(
                cos(radians(:latitude)) * cos(radians(p.latitude)) *
                cos(radians(p.longitude) - radians(:longitude)) +
                sin(radians(:latitude)) * sin(radians(p.latitude))
            )
        ) <= :radiusMeters
        AND (
            p.privacy = 'PUBLIC'
            OR (p.privacy = 'FRIENDS_ONLY' AND (f1.id IS NOT NULL OR f2.id IS NOT NULL OR p.user_id = :userId))
            OR (p.privacy = 'PRIVATE' AND p.user_id = :userId)
        )
        ORDER BY p.created_at DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Post> findNearbyPostsForUser(
        @Param("latitude") Double latitude,
        @Param("longitude") Double longitude,
        @Param("radiusMeters") Double radiusMeters,
        @Param("userId") UUID userId,
        @Param("limit") Integer limit
    );

    /**
     * Find posts by user ID
     */
    @Query("SELECT p FROM Post p WHERE p.user.id = :userId ORDER BY p.createdAt DESC")
    Page<Post> findByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Find posts by user ID with privacy filter
     */
    @Query("SELECT p FROM Post p WHERE p.user.id = :userId AND p.privacy = :privacy ORDER BY p.createdAt DESC")
    Page<Post> findByUserIdAndPrivacy(
        @Param("userId") UUID userId,
        @Param("privacy") PostPrivacy privacy,
        Pageable pageable
    );

    /**
     * Find feed posts (posts from friends)
     * Includes PUBLIC and FRIENDS_ONLY posts from friends, and own posts
     */
    @Query("""
        SELECT p FROM Post p
        WHERE p.user.id IN :userIds
        AND p.privacy IN ('PUBLIC', 'FRIENDS_ONLY')
        ORDER BY p.createdAt DESC
        """)
    Page<Post> findFeedPosts(@Param("userIds") List<UUID> userIds, Pageable pageable);

    /**
     * Find posts by hashtag
     */
    @Query("""
        SELECT p FROM Post p
        JOIN p.hashtags h
        WHERE h.name = :hashtagName
        AND p.privacy = 'PUBLIC'
        ORDER BY p.createdAt DESC
        """)
    Page<Post> findByHashtag(@Param("hashtagName") String hashtagName, Pageable pageable);

    /**
     * Find post by ID with user eager loaded
     */
    @Query("SELECT p FROM Post p JOIN FETCH p.user WHERE p.id = :id")
    Optional<Post> findByIdWithUser(@Param("id") Long id);

    /**
     * Find post by ID with all relationships eager loaded
     */
    @Query("""
        SELECT DISTINCT p FROM Post p
        LEFT JOIN FETCH p.user
        LEFT JOIN FETCH p.images
        LEFT JOIN FETCH p.hashtags
        WHERE p.id = :id
        """)
    Optional<Post> findByIdWithDetails(@Param("id") Long id);

    /**
     * Count posts by user
     */
    @Query("SELECT COUNT(p) FROM Post p WHERE p.user.id = :userId")
    Long countByUserId(@Param("userId") UUID userId);

    /**
     * Count public posts by user
     */
    @Query("SELECT COUNT(p) FROM Post p WHERE p.user.id = :userId AND p.privacy = 'PUBLIC'")
    Long countPublicPostsByUserId(@Param("userId") UUID userId);

    /**
     * Check if user owns post
     */
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Post p WHERE p.id = :postId AND p.user.id = :userId")
    boolean isPostOwnedByUser(@Param("postId") Long postId, @Param("userId") UUID userId);

    /**
     * Delete posts by user ID (for user deletion)
     */
    void deleteByUserId(UUID userId);

    // NEW: Place-based queries for unified post-place system

    /**
     * Find posts by place ID and optional post type
     * @param placeId The place ID
     * @param postType Optional post type filter (null = all types)
     * @param pageable Pagination and sorting
     * @return Page of posts at the place
     */
    @Query("""
        SELECT p FROM Post p
        WHERE p.place.id = :placeId
        AND (:postType IS NULL OR p.postType = :postType)
        AND p.privacy = 'PUBLIC'
        ORDER BY 
            CASE WHEN :sortBy = 'highest_rated' THEN p.rating END DESC NULLS LAST,
            CASE WHEN :sortBy = 'recent' THEN p.createdAt END DESC,
            p.createdAt DESC
        """)
    Page<Post> findByPlaceIdAndType(
        @Param("placeId") Long placeId,
        @Param("postType") com.mapic.entity.PostType postType,
        @Param("sortBy") String sortBy,
        Pageable pageable
    );

    /**
     * Calculate average rating for a place from REVIEW posts
     * @param placeId The place ID
     * @return Average rating or null if no reviews
     */
    @Query("""
        SELECT AVG(CAST(p.rating AS double))
        FROM Post p
        WHERE p.place.id = :placeId
        AND p.postType = 'REVIEW'
        AND p.rating IS NOT NULL
        """)
    Double calculateAverageRatingForPlace(@Param("placeId") Long placeId);

    /**
     * Count posts by place ID
     * @param placeId The place ID
     * @return Total post count
     */
    @Query("SELECT COUNT(p) FROM Post p WHERE p.place.id = :placeId")
    Long countByPlaceId(@Param("placeId") Long placeId);

    /**
     * Count REVIEW posts by place ID
     * @param placeId The place ID
     * @return Review post count
     */
    @Query("SELECT COUNT(p) FROM Post p WHERE p.place.id = :placeId AND p.postType = 'REVIEW'")
    Long countReviewsByPlaceId(@Param("placeId") Long placeId);
}
