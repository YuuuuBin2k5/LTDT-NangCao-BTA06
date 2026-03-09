package com.mapic.service;

import com.mapic.dto.ReviewAuthorDTO;
import com.mapic.dto.ReviewDTO;
import com.mapic.entity.Review;
import com.mapic.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of ReviewService.
 * Implements critical permission logic for review visibility:
 * - Public reviews are visible to everyone
 * - Private reviews are only visible to friends of the author
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReviewServiceImpl implements ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final FriendshipService friendshipService;
    
    /**
     * Get all reviews for a place that the authenticated user is authorized to view.
     * Implements three-step permission logic:
     * 1. Get all public reviews for the place
     * 2. Get friend IDs of authenticated user via FriendshipService
     * 3. Get private reviews from friends only
     * 
     * @param placeId The ID of the place
     * @param authenticatedUserId The ID of the authenticated user requesting reviews
     * @return List of ReviewDTO objects the user is authorized to view
     */
    @Override
    public List<ReviewDTO> getReviewsForPlace(Long placeId, UUID authenticatedUserId) {
        log.debug("Getting reviews for place {} for user {}", placeId, authenticatedUserId);
        
        // Step 1: Get all public reviews for the place
        List<Review> publicReviews = reviewRepository.findByPlaceIdAndIsPublicTrue(placeId);
        log.debug("Found {} public reviews for place {}", publicReviews.size(), placeId);
        
        // Step 2: Get friend IDs of authenticated user via FriendshipService
        Set<UUID> friendIds = friendshipService.getFriendIds(authenticatedUserId);
        log.debug("User {} has {} friends", authenticatedUserId, friendIds.size());
        
        // Step 3: Get private reviews from friends only
        List<Review> privateReviewsFromFriends = new ArrayList<>();
        if (!friendIds.isEmpty()) {
            privateReviewsFromFriends = reviewRepository
                .findByPlaceIdAndIsPublicFalseAndUserIdIn(placeId, friendIds);
            log.debug("Found {} private reviews from friends for place {}", 
                privateReviewsFromFriends.size(), placeId);
        }
        
        // Step 4: Combine and convert to DTOs
        List<Review> allReviews = new ArrayList<>();
        allReviews.addAll(publicReviews);
        allReviews.addAll(privateReviewsFromFriends);
        
        List<ReviewDTO> reviewDTOs = allReviews.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        
        log.debug("Returning {} total reviews for place {} to user {}", 
            reviewDTOs.size(), placeId, authenticatedUserId);
        
        return reviewDTOs;
    }
    
    /**
     * Convert Review entity to ReviewDTO.
     * Excludes sensitive user data (email, phone, password) from the response.
     * 
     * @param review The Review entity to convert
     * @return ReviewDTO with safe user information
     */
    private ReviewDTO convertToDTO(Review review) {
        ReviewAuthorDTO author = ReviewAuthorDTO.builder()
            .id(review.getUser().getId().toString())
            .name(review.getUser().getNickName())
            .avatarUrl(review.getUser().getAvatarUrl())
            .build();
        
        return ReviewDTO.builder()
            .id(review.getId())
            .content(review.getContent())
            .rating(review.getRating())
            .isPublic(review.getIsPublic())
            .createdAt(review.getCreatedAt())
            .author(author)
            .build();
    }
}
