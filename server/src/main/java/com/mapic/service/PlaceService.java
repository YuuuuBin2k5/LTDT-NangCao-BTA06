package com.mapic.service;

import com.mapic.dto.PagedResponse;
import com.mapic.dto.PlaceDTO;
import com.mapic.entity.PlaceCategory;

/**
 * Service interface for Place-related operations.
 * Provides search functionality with filtering and pagination.
 */
public interface PlaceService {
    
    /**
     * Search places with optional filters and pagination.
     * 
     * @param keyword Search term to match against place names (optional)
     * @param category Filter by specific place category (optional)
     * @param minRating Filter by minimum average rating (optional)
     * @param hasPost Filter by places with posts (optional, true = only places with posts)
     * @param page Page number (0-indexed)
     * @param size Number of items per page
     * @return Paged response containing matching places and pagination metadata
     */
    PagedResponse<PlaceDTO> searchPlaces(
        String keyword,
        PlaceCategory category,
        Double minRating,
        Boolean hasPost,
        int page,
        int size
    );
    
    /**
     * Get place details by ID.
     * 
     * @param id Place ID
     * @return PlaceDTO with all place details
     * @throws jakarta.persistence.EntityNotFoundException if place not found
     */
    PlaceDTO getPlaceById(Long id);
}
