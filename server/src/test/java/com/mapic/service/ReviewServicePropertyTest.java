package com.mapic.service;

import com.mapic.dto.ReviewDTO;
import com.mapic.entity.Place;
import com.mapic.entity.PlaceCategory;
import com.mapic.entity.Review;
import com.mapic.entity.User;
import com.mapic.repository.PlaceRepository;
import com.mapic.repository.ReviewRepository;
import com.mapic.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Property-based tests for ReviewService.
 * Tests universal properties that should hold across all inputs.
 * Each test runs 100+ iterations with randomly generated data.
 */
@SpringBootTest
@Transactional
class ReviewServicePropertyTest {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private PlaceRepository placeRepository;

    @Autowired
    private UserRepository userRepository;

    private final Random random = new Random();

    /**
     * Feature: place-details-reviews, Property 2: Public reviews visibility
     * Validates: Requirements 2.1, 4.3
     * 
     * For any place and any authenticated user, all public reviews for that place 
     * should be included in the response.
     */
    @Test
    void publicReviewsVisibility() {
        int iterations = 100;
        
        for (int i = 0; i < iterations; i++) {
            // Setup: Clear database
            reviewRepository.deleteAll();
            placeRepository.deleteAll();
            userRepository.deleteAll();
            reviewRepository.flush();
            placeRepository.flush();
            userRepository.flush();
            
            // Generate random place
            Place place = generateRandomPlace();
            place = placeRepository.saveAndFlush(place);
            
            // Generate random authenticated user (the one requesting reviews)
            User authenticatedUser = generateRandomUser();
            authenticatedUser = userRepository.saveAndFlush(authenticatedUser);
            
            // Generate random number of review authors (3 to 10)
            int numAuthors = 3 + random.nextInt(8);
            List<User> reviewAuthors = new ArrayList<>();
            for (int j = 0; j < numAuthors; j++) {
                User author = generateRandomUser();
                author = userRepository.saveAndFlush(author);
                reviewAuthors.add(author);
            }
            
            // Generate random reviews for the place (mix of public and private)
            List<Review> allReviews = new ArrayList<>();
            List<Review> publicReviews = new ArrayList<>();
            
            for (User author : reviewAuthors) {
                // Each author writes 1-3 reviews
                int numReviews = 1 + random.nextInt(3);
                for (int k = 0; k < numReviews; k++) {
                    boolean isPublic = random.nextBoolean();
                    Review review = generateRandomReview(place, author, isPublic);
                    review = reviewRepository.saveAndFlush(review);
                    allReviews.add(review);
                    
                    if (isPublic) {
                        publicReviews.add(review);
                    }
                }
            }
            
            // Execute: Get reviews for the place as the authenticated user
            List<ReviewDTO> result = reviewService.getReviewsForPlace(place.getId(), authenticatedUser.getId());
            
            // Verify: All public reviews should be in the result
            for (Review publicReview : publicReviews) {
                boolean found = result.stream()
                    .anyMatch(dto -> dto.getId().equals(publicReview.getId()));
                
                assertThat(found)
                    .as("Iteration %d: Public review with ID %d should be visible to user %s", 
                        i, publicReview.getId(), authenticatedUser.getId())
                    .isTrue();
            }
            
            // Additional verification: All returned reviews that are marked as public 
            // should actually be public reviews from the database
            for (ReviewDTO dto : result) {
                if (dto.getIsPublic()) {
                    boolean isActuallyPublic = publicReviews.stream()
                        .anyMatch(r -> r.getId().equals(dto.getId()));
                    
                    assertThat(isActuallyPublic)
                        .as("Iteration %d: Review %d marked as public in DTO should be a public review", 
                            i, dto.getId())
                        .isTrue();
                }
            }
        }
    }

    // ==================== Helper Methods (Generators) ====================

    private Place generateRandomPlace() {
        return Place.builder()
            .name(generateRandomString(10, 30))
            .description(generateRandomString(50, 200))
            .latitude(-90.0 + random.nextDouble() * 180.0)
            .longitude(-180.0 + random.nextDouble() * 360.0)
            .averageRating(random.nextDouble() * 5.0)
            .category(randomCategory())
            .build();
    }

    private User generateRandomUser() {
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8);
        return User.builder()
            .username("user_" + randomSuffix)
            .email("user_" + randomSuffix + "@example.com")
            .password("password123")
            .nickName("User " + randomSuffix)
            .avatarUrl("https://example.com/avatar/" + randomSuffix + ".jpg")
            .isActive(true)
            .build();
    }

    private Review generateRandomReview(Place place, User author, boolean isPublic) {
        return Review.builder()
            .place(place)
            .user(author)
            .content(generateRandomString(20, 200))
            .rating(1 + random.nextInt(5))
            .isPublic(isPublic)
            .build();
    }

    private String generateRandomString(int minLength, int maxLength) {
        int length = minLength + random.nextInt(maxLength - minLength + 1);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append((char) ('a' + random.nextInt(26)));
            if (i > 0 && i % 10 == 0) {
                sb.append(' ');
            }
        }
        return sb.toString().trim();
    }

    private PlaceCategory randomCategory() {
        PlaceCategory[] categories = PlaceCategory.values();
        return categories[random.nextInt(categories.length)];
    }
}
