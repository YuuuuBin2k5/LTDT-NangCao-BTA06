package com.mapic.service;

import com.mapic.dto.ReviewDTO;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for Review-related operations.
 * Provides methods to retrieve reviews with permission-based filtering.
 */
public interface ReviewService {
    
    /**
     * Get all reviews for a place that the authenticated user is authorized to view.
     * Returns:
     * - All public reviews for the place
     * - Private reviews from users who are friends with the authenticated user
     * 
     * @param placeId The ID of the place
     * @param authenticatedUserId The ID of the authenticated user requesting reviews
     * @return List of ReviewDTO objects the user is authorized to view
     */
    List<ReviewDTO> getReviewsForPlace(Long placeId, UUID authenticatedUserId);
}
