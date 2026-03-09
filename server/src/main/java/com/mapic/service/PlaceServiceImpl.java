package com.mapic.service;

import com.mapic.dto.PagedResponse;
import com.mapic.dto.PlaceDTO;
import com.mapic.entity.Place;
import com.mapic.entity.PlaceCategory;
import com.mapic.repository.PlaceRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of PlaceService.
 * Handles place search logic, filtering, pagination, and entity-to-DTO mapping.
 */
@Service
@RequiredArgsConstructor
public class PlaceServiceImpl implements PlaceService {

    private final PlaceRepository placeRepository;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PlaceDTO> searchPlaces(
            String keyword,
            PlaceCategory category,
            Double minRating,
            Boolean hasPost,
            int page,
            int size) {
        
        // Create pageable with page number and size
        Pageable pageable = PageRequest.of(page, size);
        
        // Execute search query
        Page<Place> placePage = placeRepository.searchPlaces(keyword, category, minRating, hasPost, pageable);
        
        // Map entities to DTOs
        List<PlaceDTO> placeDTOs = placePage.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        
        // Build and return paged response
        return PagedResponse.<PlaceDTO>builder()
                .content(placeDTOs)
                .totalElements(placePage.getTotalElements())
                .totalPages(placePage.getTotalPages())
                .currentPage(placePage.getNumber())
                .pageSize(placePage.getSize())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PlaceDTO getPlaceById(Long id) {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Place not found with id: " + id));
        return mapToDTO(place);
    }

    /**
     * Maps Place entity to PlaceDTO.
     * 
     * @param place Place entity
     * @return PlaceDTO with all required fields
     */
    private PlaceDTO mapToDTO(Place place) {
        return PlaceDTO.builder()
                .id(place.getId())
                .name(place.getName())
                .description(place.getDescription())
                .latitude(place.getLatitude())
                .longitude(place.getLongitude())
                .averageRating(place.getAverageRating())
                .category(place.getCategory())
                .coverImageUrl(place.getCoverImageUrl())
                .address(place.getAddress())
                .build();
    }
}
