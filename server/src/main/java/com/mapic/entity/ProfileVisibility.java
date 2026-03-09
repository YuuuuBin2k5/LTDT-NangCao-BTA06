package com.mapic.entity;

/**
 * Enum representing the visibility level of a user's profile.
 * Determines who can find and view the user's profile in search results.
 */
public enum ProfileVisibility {
    /**
     * Profile is visible to all users in search results
     */
    PUBLIC,
    
    /**
     * Profile is not visible in any search results
     */
    PRIVATE,
    
    /**
     * Profile is only visible to friends in search results
     */
    FRIENDS_ONLY
}
