package com.mapic.repository;

import com.mapic.entity.Place;
import com.mapic.entity.PlaceCategory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test class for PlaceRepository.
 * Tests search functionality and SQL injection prevention.
 */
@SpringBootTest
@Transactional
class PlaceRepositoryTest {

    @Autowired
    private PlaceRepository placeRepository;

    @BeforeEach
    void setUp() {
        // Clear any existing data
        placeRepository.deleteAll();

        // Create test data
        Place restaurant1 = Place.builder()
                .name("Pizza Palace")
                .description("Best pizza in town")
                .latitude(10.762622)
                .longitude(106.660172)
                .averageRating(4.5)
                .category(PlaceCategory.RESTAURANT)
                .build();

        Place restaurant2 = Place.builder()
                .name("Burger House")
                .description("Delicious burgers")
                .latitude(10.762622)
                .longitude(106.660172)
                .averageRating(3.8)
                .category(PlaceCategory.RESTAURANT)
                .build();

        Place hotel = Place.builder()
                .name("Grand Hotel")
                .description("Luxury accommodation")
                .latitude(10.762622)
                .longitude(106.660172)
                .averageRating(4.8)
                .category(PlaceCategory.HOTEL)
                .build();

        Place park = Place.builder()
                .name("Central Park")
                .description("Beautiful green space")
                .latitude(10.762622)
                .longitude(106.660172)
                .averageRating(4.2)
                .category(PlaceCategory.PARK)
                .build();

        placeRepository.save(restaurant1);
        placeRepository.save(restaurant2);
        placeRepository.save(hotel);
        placeRepository.save(park);
    }

    @Test
    void testSearchPlaces_WithKeyword() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Place> results = placeRepository.searchPlaces("pizza", null, null, pageable);

        // Then
        assertThat(results.getContent()).hasSize(1);
        assertThat(results.getContent().get(0).getName()).isEqualTo("Pizza Palace");
    }

    @Test
    void testSearchPlaces_WithCategory() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Place> results = placeRepository.searchPlaces(null, PlaceCategory.RESTAURANT, null, pageable);

        // Then
        assertThat(results.getContent()).hasSize(2);
        assertThat(results.getContent())
                .allMatch(place -> place.getCategory() == PlaceCategory.RESTAURANT);
    }

    @Test
    void testSearchPlaces_WithMinRating() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Place> results = placeRepository.searchPlaces(null, null, 4.0, pageable);

        // Then
        assertThat(results.getContent()).hasSize(3);
        assertThat(results.getContent())
                .allMatch(place -> place.getAverageRating() >= 4.0);
    }

    @Test
    void testSearchPlaces_WithAllFilters() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Place> results = placeRepository.searchPlaces("pizza", PlaceCategory.RESTAURANT, 4.0, pageable);

        // Then
        assertThat(results.getContent()).hasSize(1);
        assertThat(results.getContent().get(0).getName()).isEqualTo("Pizza Palace");
        assertThat(results.getContent().get(0).getCategory()).isEqualTo(PlaceCategory.RESTAURANT);
        assertThat(results.getContent().get(0).getAverageRating()).isGreaterThanOrEqualTo(4.0);
    }

    @Test
    void testSearchPlaces_NoFilters() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Place> results = placeRepository.searchPlaces(null, null, null, pageable);

        // Then
        assertThat(results.getContent()).hasSize(4);
    }

    @Test
    void testSearchPlaces_CaseInsensitiveKeyword() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Place> results = placeRepository.searchPlaces("PIZZA", null, null, pageable);

        // Then
        assertThat(results.getContent()).hasSize(1);
        assertThat(results.getContent().get(0).getName()).isEqualTo("Pizza Palace");
    }

    @Test
    void testSearchPlaces_PartialMatch() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Place> results = placeRepository.searchPlaces("pal", null, null, pageable);

        // Then
        assertThat(results.getContent()).hasSize(1);
        assertThat(results.getContent().get(0).getName()).contains("Palace");
    }

    @Test
    void testSearchPlaces_NoResults() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Place> results = placeRepository.searchPlaces("nonexistent", null, null, pageable);

        // Then
        assertThat(results.getContent()).isEmpty();
    }

    @Test
    void testSearchPlaces_SqlInjectionPrevention() {
        // Given - SQL injection attempt in keyword
        String maliciousKeyword = "'; DROP TABLE places; --";
        Pageable pageable = PageRequest.of(0, 10);

        // When - Should not throw exception and should safely handle the input
        Page<Place> results = placeRepository.searchPlaces(maliciousKeyword, null, null, pageable);

        // Then - Query should execute safely without dropping the table
        assertThat(results.getContent()).isEmpty();
        
        // Verify table still exists by counting all records
        long count = placeRepository.count();
        assertThat(count).isEqualTo(4);
    }

    @Test
    void testSearchPlaces_Pagination() {
        // Given
        Pageable firstPage = PageRequest.of(0, 2);
        Pageable secondPage = PageRequest.of(1, 2);

        // When
        Page<Place> firstResults = placeRepository.searchPlaces(null, null, null, firstPage);
        Page<Place> secondResults = placeRepository.searchPlaces(null, null, null, secondPage);

        // Then
        assertThat(firstResults.getContent()).hasSize(2);
        assertThat(secondResults.getContent()).hasSize(2);
        assertThat(firstResults.getTotalElements()).isEqualTo(4);
        assertThat(firstResults.getTotalPages()).isEqualTo(2);
    }
}
