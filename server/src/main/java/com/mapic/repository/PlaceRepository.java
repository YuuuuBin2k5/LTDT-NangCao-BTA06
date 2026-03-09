package com.mapic.repository;

import com.mapic.entity.Place;
import com.mapic.entity.PlaceCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Place entity operations.
 * Provides search functionality with keyword, category, and rating filters.
 * Uses parameterized queries to prevent SQL injection attacks.
 */
@Repository
public interface PlaceRepository extends JpaRepository<Place, Long>, JpaSpecificationExecutor<Place> {

    /**
     * Search places with optional filters for keyword, category, minimum rating, and posts.
     * All parameters are optional and use parameterized queries for SQL injection prevention.
     * 
     * @param keyword Search term to match against place names (case-insensitive, partial match)
     * @param category Filter by specific place category
     * @param minRating Filter by minimum average rating
     * @param hasPost Filter by places that have at least one post (true) or all places (false/null)
     * @param pageable Pagination parameters
     * @return Page of places matching the search criteria
     */
    @Query("SELECT DISTINCT p FROM Place p " +
           "LEFT JOIN Post post ON LOWER(post.locationName) = LOWER(p.name) " +
           "WHERE (:keyword IS NULL OR :keyword = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))) AND " +
           "(:category IS NULL OR p.category = :category) AND " +
           "(:minRating IS NULL OR p.averageRating >= :minRating) AND " +
           "(:hasPost IS NULL OR :hasPost = false OR post.id IS NOT NULL)")
    Page<Place> searchPlaces(
        @Param("keyword") String keyword,
        @Param("category") PlaceCategory category,
        @Param("minRating") Double minRating,
        @Param("hasPost") Boolean hasPost,
        Pageable pageable
    );

    // NEW: Count management methods for unified post-place system

    /**
     * Increment post count for a place
     * @param placeId The place ID
     */
    @Query("UPDATE Place p SET p.postCount = p.postCount + 1 WHERE p.id = :placeId")
    @org.springframework.data.jpa.repository.Modifying
    void incrementPostCount(@Param("placeId") Long placeId);

    /**
     * Decrement post count for a place
     * @param placeId The place ID
     */
    @Query("UPDATE Place p SET p.postCount = CASE WHEN p.postCount > 0 THEN p.postCount - 1 ELSE 0 END WHERE p.id = :placeId")
    @org.springframework.data.jpa.repository.Modifying
    void decrementPostCount(@Param("placeId") Long placeId);

    /**
     * Increment review count for a place
     * @param placeId The place ID
     */
    @Query("UPDATE Place p SET p.reviewCount = p.reviewCount + 1 WHERE p.id = :placeId")
    @org.springframework.data.jpa.repository.Modifying
    void incrementReviewCount(@Param("placeId") Long placeId);

    /**
     * Decrement review count for a place
     * @param placeId The place ID
     */
    @Query("UPDATE Place p SET p.reviewCount = CASE WHEN p.reviewCount > 0 THEN p.reviewCount - 1 ELSE 0 END WHERE p.id = :placeId")
    @org.springframework.data.jpa.repository.Modifying
    void decrementReviewCount(@Param("placeId") Long placeId);

    /**
     * Update average rating for a place
     * @param placeId The place ID
     * @param averageRating The new average rating (can be null)
     */
    @Query("UPDATE Place p SET p.averageRating = :averageRating WHERE p.id = :placeId")
    @org.springframework.data.jpa.repository.Modifying
    void updateAverageRating(@Param("placeId") Long placeId, @Param("averageRating") Double averageRating);

    /**
     * Search places with post count filter (improved version)
     * Uses the new post_count column for better performance
     * 
     * @param keyword Search term to match against place names
     * @param category Filter by specific place category
     * @param minRating Filter by minimum average rating
     * @param hasPost Filter by places that have at least one post
     * @param pageable Pagination parameters
     * @return Page of places matching the search criteria
     */
    @Query("SELECT p FROM Place p " +
           "WHERE (:keyword IS NULL OR :keyword = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))) AND " +
           "(:category IS NULL OR p.category = :category) AND " +
           "(:minRating IS NULL OR p.averageRating >= :minRating) AND " +
           "(:hasPost IS NULL OR :hasPost = false OR p.postCount > 0)")
    Page<Place> searchPlacesWithPostCount(
        @Param("keyword") String keyword,
        @Param("category") PlaceCategory category,
        @Param("minRating") Double minRating,
        @Param("hasPost") Boolean hasPost,
        Pageable pageable
    );
}
