package com.mapic.controller;

import com.mapic.dto.PagedResponse;
import com.mapic.dto.PlaceDTO;
import com.mapic.entity.Place;
import com.mapic.entity.PlaceCategory;
import com.mapic.repository.PlaceRepository;
import com.mapic.service.PlaceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for PlaceController endpoints.
 * Tests successful searches, empty results, invalid input handling, and error responses.
 * Validates: Requirements 5.1, 5.2
 */
@SpringBootTest
@Transactional
class PlaceControllerTest {

    @Autowired
    private PlaceController placeController;

    @Autowired
    private PlaceRepository placeRepository;

    @Autowired
    private PlaceService placeService;

    @BeforeEach
    void setUp() {
        // Clear database before each test
        placeRepository.deleteAll();
        placeRepository.flush();
    }

    /**
     * Test successful search with keyword parameter.
     */
    @Test
    void searchPlaces_WithKeyword_ReturnsMatchingResults() {
        // Setup: Create test places
        List<Place> places = new ArrayList<>();
        places.add(createPlace("Pizza Palace", "Great pizza", 40.7128, -74.0060, 4.5, PlaceCategory.RESTAURANT));
        places.add(createPlace("Pizza Hut", "Chain restaurant", 40.7580, -73.9855, 3.8, PlaceCategory.RESTAURANT));
        places.add(createPlace("Burger King", "Fast food", 40.7489, -73.9680, 3.2, PlaceCategory.RESTAURANT));
        placeRepository.saveAll(places);
        placeRepository.flush();

        // Execute: Search for "pizza"
        PagedResponse<PlaceDTO> response = placeController.searchPlaces("pizza", null, null, 0, 20).getBody();

        // Verify
        assertThat(response).isNotNull();
        assertThat(response.getContent()).hasSize(2);
        assertThat(response.getTotalElements()).isEqualTo(2);
    }

    /**
     * Test successful search with category filter.
     */
    @Test
    void searchPlaces_WithCategory_ReturnsFilteredResults() {
        // Setup: Create test places with different categories
        List<Place> places = new ArrayList<>();
        places.add(createPlace("Central Park", "Beautiful park", 40.7829, -73.9654, 4.8, PlaceCategory.PARK));
        places.add(createPlace("Hotel Plaza", "Luxury hotel", 40.7614, -73.9776, 4.2, PlaceCategory.HOTEL));
        places.add(createPlace("Riverside Park", "Scenic park", 40.7957, -73.9389, 4.5, PlaceCategory.PARK));
        placeRepository.saveAll(places);
        placeRepository.flush();

        // Execute: Search for PARK category
        PagedResponse<PlaceDTO> response = placeController.searchPlaces(null, PlaceCategory.PARK, null, 0, 20).getBody();

        // Verify
        assertThat(response).isNotNull();
        assertThat(response.getContent()).hasSize(2);
        assertThat(response.getContent())
                .allMatch(place -> place.getCategory() == PlaceCategory.PARK);
    }

    /**
     * Test successful search with minimum rating filter.
     */
    @Test
    void searchPlaces_WithMinRating_ReturnsFilteredResults() {
        // Setup: Create test places with different ratings
        List<Place> places = new ArrayList<>();
        places.add(createPlace("Excellent Restaurant", "Top rated", 40.7128, -74.0060, 4.8, PlaceCategory.RESTAURANT));
        places.add(createPlace("Good Restaurant", "Nice place", 40.7580, -73.9855, 4.2, PlaceCategory.RESTAURANT));
        places.add(createPlace("Average Restaurant", "Okay food", 40.7489, -73.9680, 3.0, PlaceCategory.RESTAURANT));
        placeRepository.saveAll(places);
        placeRepository.flush();

        // Execute: Search for places with rating >= 4.0
        PagedResponse<PlaceDTO> response = placeController.searchPlaces(null, null, 4.0, 0, 20).getBody();

        // Verify
        assertThat(response).isNotNull();
        assertThat(response.getContent()).hasSize(2);
        assertThat(response.getContent())
                .allMatch(place -> place.getAverageRating() >= 4.0);
    }

    /**
     * Test successful search with pagination.
     */
    @Test
    void searchPlaces_WithPagination_ReturnsCorrectPage() {
        // Setup: Create multiple test places
        List<Place> places = new ArrayList<>();
        for (int i = 0; i < 15; i++) {
            places.add(createPlace("Place " + i, "Description " + i, 40.0 + i, -74.0 + i, 4.0, PlaceCategory.OTHER));
        }
        placeRepository.saveAll(places);
        placeRepository.flush();

        // Execute: Request page 1 with size 5
        PagedResponse<PlaceDTO> response = placeController.searchPlaces(null, null, null, 1, 5).getBody();

        // Verify
        assertThat(response).isNotNull();
        assertThat(response.getContent()).hasSize(5);
        assertThat(response.getCurrentPage()).isEqualTo(1);
        assertThat(response.getPageSize()).isEqualTo(5);
        assertThat(response.getTotalElements()).isEqualTo(15);
        assertThat(response.getTotalPages()).isEqualTo(3);
    }

    /**
     * Test successful search with multiple filters combined.
     */
    @Test
    void searchPlaces_WithMultipleFilters_ReturnsFilteredResults() {
        // Setup: Create test places
        List<Place> places = new ArrayList<>();
        places.add(createPlace("Great Pizza Place", "Excellent pizza", 40.7128, -74.0060, 4.8, PlaceCategory.RESTAURANT));
        places.add(createPlace("Pizza Express", "Fast pizza", 40.7580, -73.9855, 3.5, PlaceCategory.RESTAURANT));
        places.add(createPlace("Pizza Museum", "Pizza history", 40.7489, -73.9680, 4.2, PlaceCategory.MUSEUM));
        placeRepository.saveAll(places);
        placeRepository.flush();

        // Execute: Search with keyword, category, and minRating
        PagedResponse<PlaceDTO> response = placeController.searchPlaces("pizza", PlaceCategory.RESTAURANT, 4.0, 0, 20).getBody();

        // Verify
        assertThat(response).isNotNull();
        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).getName()).isEqualTo("Great Pizza Place");
    }

    /**
     * Test empty results scenario.
     */
    @Test
    void searchPlaces_NoMatches_ReturnsEmptyResults() {
        // Setup: Create test places
        List<Place> places = new ArrayList<>();
        places.add(createPlace("Restaurant A", "Description", 40.7128, -74.0060, 4.0, PlaceCategory.RESTAURANT));
        placeRepository.saveAll(places);
        placeRepository.flush();

        // Execute: Search for non-existent keyword
        PagedResponse<PlaceDTO> response = placeController.searchPlaces("nonexistent", null, null, 0, 20).getBody();

        // Verify
        assertThat(response).isNotNull();
        assertThat(response.getContent()).isEmpty();
        assertThat(response.getTotalElements()).isEqualTo(0);
    }

    /**
     * Test invalid input: negative page number.
     */
    @Test
    void searchPlaces_NegativePage_ThrowsException() {
        // Execute & Verify: Request with negative page should throw exception
        assertThatThrownBy(() -> placeController.searchPlaces(null, null, null, -1, 20))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Page number cannot be negative");
    }

    /**
     * Test invalid input: zero page size.
     */
    @Test
    void searchPlaces_ZeroPageSize_ThrowsException() {
        // Execute & Verify: Request with zero page size should throw exception
        assertThatThrownBy(() -> placeController.searchPlaces(null, null, null, 0, 0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Page size must be greater than zero");
    }

    /**
     * Test invalid input: page size exceeds maximum.
     */
    @Test
    void searchPlaces_ExcessivePageSize_ThrowsException() {
        // Execute & Verify: Request with page size > 100 should throw exception
        assertThatThrownBy(() -> placeController.searchPlaces(null, null, null, 0, 101))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Page size cannot exceed 100");
    }

    /**
     * Test invalid input: rating below minimum.
     */
    @Test
    void searchPlaces_NegativeRating_ThrowsException() {
        // Execute & Verify: Request with negative rating should throw exception
        assertThatThrownBy(() -> placeController.searchPlaces(null, null, -1.0, 0, 20))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Minimum rating must be between 0 and 5");
    }

    /**
     * Test invalid input: rating above maximum.
     */
    @Test
    void searchPlaces_ExcessiveRating_ThrowsException() {
        // Execute & Verify: Request with rating > 5.0 should throw exception
        assertThatThrownBy(() -> placeController.searchPlaces(null, null, 6.0, 0, 20))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Minimum rating must be between 0 and 5");
    }

    // ==================== Helper Methods ====================

    private Place createPlace(String name, String description, double latitude, double longitude, 
                             double rating, PlaceCategory category) {
        return Place.builder()
                .name(name)
                .description(description)
                .latitude(latitude)
                .longitude(longitude)
                .averageRating(rating)
                .category(category)
                .build();
    }
}
