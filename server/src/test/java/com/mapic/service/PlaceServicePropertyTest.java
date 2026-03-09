package com.mapic.service;

import com.mapic.dto.PagedResponse;
import com.mapic.dto.PlaceDTO;
import com.mapic.entity.Place;
import com.mapic.entity.PlaceCategory;
import com.mapic.repository.PlaceRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Property-based tests for PlaceService.
 * Tests universal properties that should hold across all inputs.
 * Each test runs 100+ iterations with randomly generated data.
 */
@SpringBootTest
@Transactional
class PlaceServicePropertyTest {

    @Autowired
    private PlaceService placeService;

    @Autowired
    private PlaceRepository placeRepository;

    private final Random random = new Random();

    /**
     * Feature: place-search-filter, Property 1: Keyword search returns matching results
     * Validates: Requirements 1.1
     * 
     * For any search keyword and place database, all returned results should contain 
     * the keyword in their name (case-insensitive).
     */
    @Test
    void keywordSearchReturnsMatchingResults() {
        int iterations = 100;
        
        for (int i = 0; i < iterations; i++) {
            // Generate random keyword and places
            String keyword = generateRandomKeyword();
            List<Place> places = generateRandomPlaces(5, 10, keyword);
            
            // Setup: Clear database and save test places
            placeRepository.deleteAll();
            placeRepository.flush();
            placeRepository.saveAll(places);
            placeRepository.flush();
            
            // Execute: Search with keyword
            PagedResponse<PlaceDTO> response = placeService.searchPlaces(keyword, null, null, 0, 100);
            
            // Verify: All results contain the keyword (case-insensitive)
            String lowerKeyword = keyword.toLowerCase();
            for (PlaceDTO place : response.getContent()) {
                assertThat(place.getName().toLowerCase())
                        .as("Iteration %d: Place name should contain keyword '%s'", i, keyword)
                        .contains(lowerKeyword);
            }
        }
    }

    /**
     * Feature: place-search-filter, Property 2: SQL injection prevention
     * Validates: Requirements 1.2
     * 
     * For any search query containing SQL special characters, the system should 
     * sanitize the input and execute safely without SQL errors or unauthorized data access.
     */
    @Test
    void sqlInjectionPrevention() {
        String[] sqlInjectionAttempts = {
            "'; DROP TABLE places; --",
            "' OR '1'='1",
            "'; DELETE FROM places WHERE '1'='1",
            "' UNION SELECT * FROM users --",
            "admin'--",
            "' OR 1=1--",
            "'; UPDATE places SET name='hacked' --",
            "1' AND '1'='1",
            "' OR 'x'='x",
            "%'; DROP TABLE places; --"
        };
        
        for (int i = 0; i < 100; i++) {
            // Generate random places
            List<Place> places = generateRandomPlaces(3, 8, null);
            
            // Setup: Clear database and save test places
            placeRepository.deleteAll();
            placeRepository.flush();
            placeRepository.saveAll(places);
            placeRepository.flush();
            long initialCount = placeRepository.count();
            
            // Select random SQL injection attempt
            String maliciousKeyword = sqlInjectionAttempts[random.nextInt(sqlInjectionAttempts.length)];
            
            // Execute: Search with potentially malicious input
            // Should not throw exception
            PagedResponse<PlaceDTO> response = placeService.searchPlaces(maliciousKeyword, null, null, 0, 100);
            
            // Verify: Database integrity maintained
            long finalCount = placeRepository.count();
            assertThat(finalCount)
                    .as("Iteration %d: Database should not be modified by SQL injection attempt", i)
                    .isEqualTo(initialCount);
            
            // Verify: Response is valid (not null)
            assertThat(response).isNotNull();
            assertThat(response.getContent()).isNotNull();
        }
    }

    /**
     * Feature: place-search-filter, Property 3: Search results completeness
     * Validates: Requirements 1.3
     * 
     * For any search result returned by the API, it should contain all required fields: 
     * id, name, description, latitude, longitude, averageRating, and category.
     */
    @Test
    void searchResultsCompleteness() {
        int iterations = 100;
        
        for (int i = 0; i < iterations; i++) {
            // Generate random search parameters
            String keyword = random.nextBoolean() ? null : generateRandomKeyword();
            PlaceCategory category = random.nextBoolean() ? null : randomCategory();
            Double minRating = random.nextBoolean() ? null : random.nextDouble() * 5.0;
            
            // Generate random places
            List<Place> places = generateRandomPlaces(5, 10, keyword);
            
            // Setup: Clear database and save test places
            placeRepository.deleteAll();
            placeRepository.flush();
            placeRepository.saveAll(places);
            placeRepository.flush();
            
            // Execute: Search with various filters
            PagedResponse<PlaceDTO> response = placeService.searchPlaces(keyword, category, minRating, 0, 100);
            
            // Verify: All results have complete fields
            for (PlaceDTO place : response.getContent()) {
                assertThat(place.getId())
                        .as("Iteration %d: Place should have an ID", i)
                        .isNotNull();
                assertThat(place.getName())
                        .as("Iteration %d: Place should have a name", i)
                        .isNotNull()
                        .isNotEmpty();
                assertThat(place.getDescription())
                        .as("Iteration %d: Place should have a description", i)
                        .isNotNull();
                assertThat(place.getLatitude())
                        .as("Iteration %d: Place should have latitude", i)
                        .isNotNull();
                assertThat(place.getLongitude())
                        .as("Iteration %d: Place should have longitude", i)
                        .isNotNull();
                assertThat(place.getAverageRating())
                        .as("Iteration %d: Place should have average rating", i)
                        .isNotNull();
                assertThat(place.getCategory())
                        .as("Iteration %d: Place should have a category", i)
                        .isNotNull();
            }
        }
    }

    /**
     * Feature: place-search-filter, Property 4: Category filter accuracy
     * Validates: Requirements 2.1
     * 
     * For any selected category and place database, all returned results should have 
     * a category field matching the selected category.
     */
    @Test
    void categoryFilterAccuracy() {
        int iterations = 100;
        
        for (int i = 0; i < iterations; i++) {
            // Generate random category to filter by
            PlaceCategory targetCategory = randomCategory();
            
            // Generate random places with various categories
            List<Place> places = generateRandomPlaces(10, 20, null);
            
            // Setup: Clear database and save test places
            placeRepository.deleteAll();
            placeRepository.flush();
            placeRepository.saveAll(places);
            placeRepository.flush();
            
            // Execute: Search with category filter
            PagedResponse<PlaceDTO> response = placeService.searchPlaces(null, targetCategory, null, 0, 100);
            
            // Verify: All results match the target category
            for (PlaceDTO place : response.getContent()) {
                assertThat(place.getCategory())
                        .as("Iteration %d: Place category should match filter '%s'", i, targetCategory)
                        .isEqualTo(targetCategory);
            }
        }
    }

    /**
     * Feature: place-search-filter, Property 5: Rating filter threshold
     * Validates: Requirements 3.1
     * 
     * For any minimum rating threshold and place database, all returned results should 
     * have an averageRating greater than or equal to the threshold.
     */
    @Test
    void ratingFilterThreshold() {
        int iterations = 100;
        
        for (int i = 0; i < iterations; i++) {
            // Generate random minimum rating threshold (0.0 to 5.0)
            double minRating = random.nextDouble() * 5.0;
            
            // Generate random places with various ratings
            List<Place> places = generateRandomPlaces(10, 20, null);
            
            // Setup: Clear database and save test places
            placeRepository.deleteAll();
            placeRepository.flush();
            placeRepository.saveAll(places);
            placeRepository.flush();
            
            // Execute: Search with rating filter
            PagedResponse<PlaceDTO> response = placeService.searchPlaces(null, null, minRating, 0, 100);
            
            // Verify: All results have rating >= minRating
            for (PlaceDTO place : response.getContent()) {
                assertThat(place.getAverageRating())
                        .as("Iteration %d: Place rating should be >= %.2f", i, minRating)
                        .isGreaterThanOrEqualTo(minRating);
            }
        }
    }

    /**
     * Feature: place-search-filter, Property 6: Pagination correctness
     * Validates: Requirements 4.2, 4.3
     * 
     * For any page number and page size, the returned results should correspond to 
     * the correct slice of the total dataset, and the metadata should accurately 
     * reflect pagination state.
     */
    @Test
    void paginationCorrectness() {
        int iterations = 100;
        
        for (int i = 0; i < iterations; i++) {
            // Generate random places (enough for multiple pages)
            List<Place> places = generateRandomPlaces(15, 30, null);
            
            // Setup: Clear database and save test places
            placeRepository.deleteAll();
            placeRepository.flush();
            placeRepository.saveAll(places);
            placeRepository.flush();
            
            long totalPlaces = placeRepository.count();
            
            // Generate random page size (between 3 and 10)
            int pageSize = 3 + random.nextInt(8);
            int totalPages = (int) Math.ceil((double) totalPlaces / pageSize);
            
            // Test random page number (ensure it's within valid range)
            int pageNumber = totalPages > 0 ? random.nextInt(totalPages) : 0;
            
            // Execute: Search with pagination
            PagedResponse<PlaceDTO> response = placeService.searchPlaces(null, null, null, pageNumber, pageSize);
            
            // Verify: Pagination metadata is correct
            assertThat(response.getTotalElements())
                    .as("Iteration %d: Total elements should match database count", i)
                    .isEqualTo(totalPlaces);
            
            assertThat(response.getTotalPages())
                    .as("Iteration %d: Total pages should be correctly calculated", i)
                    .isEqualTo(totalPages);
            
            assertThat(response.getCurrentPage())
                    .as("Iteration %d: Current page should match requested page", i)
                    .isEqualTo(pageNumber);
            
            assertThat(response.getPageSize())
                    .as("Iteration %d: Page size should match requested size", i)
                    .isEqualTo(pageSize);
            
            // Verify: Content size is correct for the page
            int expectedContentSize;
            if (pageNumber < totalPages - 1) {
                // Not the last page - should be full
                expectedContentSize = pageSize;
            } else {
                // Last page - might be partial
                expectedContentSize = (int) (totalPlaces - (pageNumber * pageSize));
            }
            
            assertThat(response.getContent().size())
                    .as("Iteration %d: Content size should match expected size for page %d", i, pageNumber)
                    .isEqualTo(expectedContentSize);
        }
    }

    /**
     * Test for getPlaceById method.
     * Verifies that the method returns the correct place with all fields including new fields.
     */
    @Test
    void getPlaceByIdReturnsCompletePlace() {
        // Setup: Create a place with all fields including coverImageUrl and address
        Place place = Place.builder()
                .name("Test Place")
                .description("Test Description")
                .latitude(10.0)
                .longitude(20.0)
                .averageRating(4.5)
                .category(PlaceCategory.RESTAURANT)
                .coverImageUrl("https://example.com/image.jpg")
                .address("123 Test Street")
                .build();
        
        placeRepository.deleteAll();
        placeRepository.flush();
        Place savedPlace = placeRepository.save(place);
        placeRepository.flush();
        
        // Execute: Get place by ID
        PlaceDTO result = placeService.getPlaceById(savedPlace.getId());
        
        // Verify: All fields are present and correct
        assertThat(result.getId()).isEqualTo(savedPlace.getId());
        assertThat(result.getName()).isEqualTo("Test Place");
        assertThat(result.getDescription()).isEqualTo("Test Description");
        assertThat(result.getLatitude()).isEqualTo(10.0);
        assertThat(result.getLongitude()).isEqualTo(20.0);
        assertThat(result.getAverageRating()).isEqualTo(4.5);
        assertThat(result.getCategory()).isEqualTo(PlaceCategory.RESTAURANT);
        assertThat(result.getCoverImageUrl()).isEqualTo("https://example.com/image.jpg");
        assertThat(result.getAddress()).isEqualTo("123 Test Street");
    }

    /**
     * Test for getPlaceById method with non-existent ID.
     * Verifies that EntityNotFoundException is thrown when place doesn't exist.
     */
    @Test
    void getPlaceByIdThrowsExceptionWhenNotFound() {
        // Setup: Clear database
        placeRepository.deleteAll();
        placeRepository.flush();
        
        // Execute & Verify: Should throw EntityNotFoundException
        assertThatThrownBy(() -> placeService.getPlaceById(999L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Place not found with id: 999");
    }

    /**
     * Feature: place-details-reviews, Property 1: Place details completeness
     * Validates: Requirements 1.1
     * 
     * For any valid place ID, the API response should contain all required fields: 
     * id, name, description, latitude, longitude, averageRating, category, and coverImageUrl.
     */
    @Test
    void placeDetailsCompleteness() {
        int iterations = 100;
        
        for (int i = 0; i < iterations; i++) {
            // Generate random place with all fields
            Place place = Place.builder()
                    .name(generateRandomName(null))
                    .description(generateRandomDescription())
                    .latitude(-90.0 + random.nextDouble() * 180.0)
                    .longitude(-180.0 + random.nextDouble() * 360.0)
                    .averageRating(random.nextDouble() * 5.0)
                    .category(randomCategory())
                    .coverImageUrl("https://example.com/image" + i + ".jpg")
                    .address(generateRandomAddress())
                    .build();
            
            // Setup: Clear database and save test place
            placeRepository.deleteAll();
            placeRepository.flush();
            Place savedPlace = placeRepository.save(place);
            placeRepository.flush();
            
            // Execute: Get place by ID
            PlaceDTO result = placeService.getPlaceById(savedPlace.getId());
            
            // Verify: All required fields are present
            assertThat(result.getId())
                    .as("Iteration %d: Place should have an ID", i)
                    .isNotNull()
                    .isEqualTo(savedPlace.getId());
            
            assertThat(result.getName())
                    .as("Iteration %d: Place should have a name", i)
                    .isNotNull()
                    .isNotEmpty();
            
            assertThat(result.getDescription())
                    .as("Iteration %d: Place should have a description", i)
                    .isNotNull();
            
            assertThat(result.getLatitude())
                    .as("Iteration %d: Place should have latitude", i)
                    .isNotNull()
                    .isBetween(-90.0, 90.0);
            
            assertThat(result.getLongitude())
                    .as("Iteration %d: Place should have longitude", i)
                    .isNotNull()
                    .isBetween(-180.0, 180.0);
            
            assertThat(result.getAverageRating())
                    .as("Iteration %d: Place should have average rating", i)
                    .isNotNull()
                    .isBetween(0.0, 5.0);
            
            assertThat(result.getCategory())
                    .as("Iteration %d: Place should have a category", i)
                    .isNotNull();
            
            assertThat(result.getCoverImageUrl())
                    .as("Iteration %d: Place should have a cover image URL", i)
                    .isNotNull();
            
            assertThat(result.getAddress())
                    .as("Iteration %d: Place should have an address", i)
                    .isNotNull();
        }
    }

    // ==================== Helper Methods (Generators) ====================

    private String generateRandomKeyword() {
        int length = 3 + random.nextInt(15);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append((char) ('a' + random.nextInt(26)));
        }
        return sb.toString();
    }

    private PlaceCategory randomCategory() {
        PlaceCategory[] categories = PlaceCategory.values();
        return categories[random.nextInt(categories.length)];
    }

    private List<Place> generateRandomPlaces(int minSize, int maxSize, String keyword) {
        int size = minSize + random.nextInt(maxSize - minSize + 1);
        List<Place> places = new ArrayList<>();
        
        for (int i = 0; i < size; i++) {
            String name = generateRandomName(keyword);
            Place place = Place.builder()
                    .name(name)
                    .description(generateRandomDescription())
                    .latitude(-90.0 + random.nextDouble() * 180.0)
                    .longitude(-180.0 + random.nextDouble() * 360.0)
                    .averageRating(random.nextDouble() * 5.0)
                    .category(randomCategory())
                    .build();
            places.add(place);
        }
        
        return places;
    }

    private String generateRandomName(String keyword) {
        String baseName = generateRandomKeyword();
        
        // If keyword is provided, ensure some places contain it
        if (keyword != null && random.nextBoolean()) {
            // Insert keyword at random position
            int position = random.nextInt(baseName.length() + 1);
            baseName = baseName.substring(0, position) + keyword + baseName.substring(position);
        }
        
        return baseName;
    }

    private String generateRandomDescription() {
        int length = 20 + random.nextInt(100);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append((char) ('a' + random.nextInt(26)));
            if (i % 10 == 9) {
                sb.append(' ');
            }
        }
        return sb.toString();
    }

    private String generateRandomAddress() {
        int streetNumber = 1 + random.nextInt(9999);
        String streetName = generateRandomKeyword();
        String[] streetTypes = {"Street", "Avenue", "Road", "Boulevard", "Lane", "Drive"};
        String streetType = streetTypes[random.nextInt(streetTypes.length)];
        return streetNumber + " " + streetName + " " + streetType;
    }
}
