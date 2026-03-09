package com.mapic.dto.feed;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilterConfigDTO {
    
    private String id;
    
    @NotNull(message = "Filter type is required")
    private FilterType type;
    
    @NotNull(message = "Filter value is required")
    private String value;
    
    private String label;
    
    @Builder.Default
    private Map<String, Object> params = new HashMap<>();
}
