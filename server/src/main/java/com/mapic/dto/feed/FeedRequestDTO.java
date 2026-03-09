package com.mapic.dto.feed;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedRequestDTO {
    
    @Builder.Default
    private int page = 0;
    
    @Builder.Default
    private int size = 20;
    
    @Valid
    @Builder.Default
    private List<FilterConfigDTO> filters = new ArrayList<>();
    
    @Builder.Default
    private String sortBy = "recent"; // recent, popular, recommended
    
    // User context for location-based filters
    private Double latitude;
    private Double longitude;
    
    // For time filters
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    
    // For location filters
    private Double radius; // in kilometers
}
