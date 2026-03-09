package com.mapic.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mapic.dto.PagedResponse;
import com.mapic.dto.PlaceDTO;
import com.mapic.dto.ReviewDTO;
import com.mapic.entity.PlaceCategory;
import com.mapic.entity.User;
import com.mapic.service.PlaceService;
import com.mapic.service.ReviewService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * REST controller for place-related operations.
 * Provides endpoints for searching and filtering places.
 */
@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;
    private final ReviewService reviewService;

    /**
     * Search places with optional filters and pagination.
     * 
     * @param keyword Search term to match against place names (optional)
     * @param category Filter by specific place category (optional)
     * @param minRating Filter by minimum average rating (optional)
     * @param hasPost Filter by places with posts (optional, true = only places with posts)
     * @param page Page number (0-indexed, default: 0)
     * @param size Number of items per page (default: 20)
     * @return Paged response containing matching places and pagination metadata
     */
    @GetMapping("/search")
    public ResponseEntity<PagedResponse<PlaceDTO>> searchPlaces(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) PlaceCategory category,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Boolean hasPost,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        // Validate input parameters
        if (page < 0) {
            throw new IllegalArgumentException("Page number cannot be negative");
        }
        
        if (size <= 0) {
            throw new IllegalArgumentException("Page size must be greater than zero");
        }
        
        if (size > 100) {
            throw new IllegalArgumentException("Page size cannot exceed 100");
        }
        
        if (minRating != null && (minRating < 0 || minRating > 5)) {
            throw new IllegalArgumentException("Minimum rating must be between 0 and 5");
        }
        
        // Execute search
        PagedResponse<PlaceDTO> response = placeService.searchPlaces(
            keyword, 
            category, 
            minRating,
            hasPost,
            page, 
            size
        );
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get place details by ID.
     * 
     * @param id Place ID
     * @return PlaceDTO with all place details
     * @throws EntityNotFoundException if place not found (handled by exception handler)
     */
    @GetMapping("/{id}")
    public ResponseEntity<PlaceDTO> getPlaceById(@PathVariable Long id) {
        PlaceDTO place = placeService.getPlaceById(id);
        return ResponseEntity.ok(place);
    }

    /**
     * Get reviews for a specific place with permission-based filtering.
     * Returns all public reviews plus private reviews from the authenticated user's friends.
     * 
     * @param id Place ID
     * @param user Authenticated user (extracted from JWT token)
     * @return List of reviews the user is authorized to view
     * @throws EntityNotFoundException if place not found (handled by exception handler)
     */
    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<ReviewDTO>> getPlaceReviews(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        
        // Verify place exists (will throw EntityNotFoundException if not)
        placeService.getPlaceById(id);
        
        // Get reviews with permission filtering
        List<ReviewDTO> reviews = reviewService.getReviewsForPlace(id, user.getId());
        
        return ResponseEntity.ok(reviews);
    }

    /**
     * Exception handler for EntityNotFoundException.
     * Returns 404 Not Found with error message.
     * 
     * @param ex The exception
     * @return ResponseEntity with error details
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleEntityNotFound(EntityNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", ex.getMessage()));
    }
}
