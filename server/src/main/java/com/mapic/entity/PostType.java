package com.mapic.entity;

/**
 * Enum representing the type of post
 * NORMAL: Regular post, place optional, no rating
 * REVIEW: Review post, place required, rating required (1-5 stars)
 */
public enum PostType {
    /**
     * Regular post without rating
     * - Place is optional
     * - Rating must be null
     */
    NORMAL,
    
    /**
     * Review post with rating
     * - Place is required
     * - Rating is required (1-5 stars)
     */
    REVIEW
}
