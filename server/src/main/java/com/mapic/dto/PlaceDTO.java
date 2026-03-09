package com.mapic.dto;

import com.mapic.entity.PlaceCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for Place entity.
 * Contains all required fields for API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceDTO {
    private Long id;
    private String name;
    private String description;
    private Double latitude;
    private Double longitude;
    private Double averageRating;
    private PlaceCategory category;
    private String coverImageUrl;
    private String address;
}
