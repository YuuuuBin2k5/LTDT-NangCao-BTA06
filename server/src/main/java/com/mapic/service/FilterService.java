package com.mapic.service;

import com.mapic.dto.feed.FilterConfigDTO;
import com.mapic.entity.Post;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.UUID;

public interface FilterService {
    
    /**
     * Build JPA Specification from filter configurations
     */
    Specification<Post> buildSpecification(List<FilterConfigDTO> filters, UUID userId, Double userLat, Double userLng);
    
    /**
     * Validate filter configurations
     */
    void validateFilters(List<FilterConfigDTO> filters);
    
    /**
     * Detect conflicting filters
     */
    List<String> detectConflicts(List<FilterConfigDTO> filters);
    
    /**
     * Check if two filters conflict
     */
    boolean hasConflict(FilterConfigDTO filter1, FilterConfigDTO filter2);
}
