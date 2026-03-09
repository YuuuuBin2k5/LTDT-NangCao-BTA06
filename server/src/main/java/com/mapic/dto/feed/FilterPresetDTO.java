package com.mapic.dto.feed;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilterPresetDTO {
    
    private Long id;
    private String name;
    private String description;
    private List<FilterConfigDTO> filters;
    private Boolean isDefault;
    private Boolean isPublic;
    private String shareToken;
    private Integer usageCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
