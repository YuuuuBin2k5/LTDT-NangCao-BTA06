package com.mapic.dto.feed;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePresetDTO {
    
    @NotBlank(message = "Preset name is required")
    @Size(min = 1, max = 100, message = "Preset name must be between 1 and 100 characters")
    private String name;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    @NotNull(message = "Filters are required")
    @Size(min = 1, message = "At least one filter is required")
    private List<FilterConfigDTO> filters;
    
    @Builder.Default
    private Boolean isPublic = false;
}
