package com.mapic.service;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for proximity detection and notifications.
 * Monitors friend locations and sends notifications when friends are nearby.
 */
public interface ProximityService {
    
    /**
     * Check all users for nearby friends and send proximity notifications.
     * This method should be called periodically (e.g., every minute) by a scheduled task.
     * 
     * For each user:
     * - Gets their current location
     * - Finds friends within 500m
     * - Sends notifications if not already sent within the last hour
     */
    void checkProximityForAllUsers();
    
    /**
     * Check proximity for a specific user and send notifications if friends are nearby.
     * 
     * @param userId The user ID to check proximity for
     * @return List of friend IDs that are nearby (within 500m)
     */
    List<UUID> checkProximityForUser(UUID userId);
    
    /**
     * Calculate distance between two users based on their current locations.
     * 
     * @param userId1 First user ID
     * @param userId2 Second user ID
     * @return Distance in meters, or null if either user has no location
     */
    Double calculateDistanceBetweenUsers(UUID userId1, UUID userId2);
}
