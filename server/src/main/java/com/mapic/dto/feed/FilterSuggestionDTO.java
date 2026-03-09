package com.mapic.dto.feed;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilterSuggestionDTO {
    
    private FilterConfigDTO filter;
    private String reason;
    private Long estimatedResults;
}
