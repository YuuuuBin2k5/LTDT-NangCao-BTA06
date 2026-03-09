package com.mapic.entity;

/**
 * Privacy settings for posts
 */
public enum PostPrivacy {
    /**
     * Post is visible to everyone
     */
    PUBLIC,
    
    /**
     * Post is visible only to friends
     */
    FRIENDS_ONLY,
    
    /**
     * Post is visible only to the owner (draft mode)
     */
    PRIVATE
}
