package com.mapic.dto;

import lombok.*;

/**
 * Data Transfer Object for Review Author information.
 * Contains minimal author details for review display.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewAuthorDTO {
    
    private String id;
    
    private String name;
    
    private String avatarUrl;
}
