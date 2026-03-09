package com.mapic.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Review entity.
 * Contains review information with author details, excluding sensitive user data.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO {
    
    private Long id;
    
    private String content;
    
    private Integer rating;
    
    private Boolean isPublic;
    
    private LocalDateTime createdAt;
    
    // Author information (excluding sensitive data like email, phone, password)
    private ReviewAuthorDTO author;
}
