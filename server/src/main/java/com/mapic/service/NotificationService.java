package com.mapic.service;

import com.mapic.dto.notification.ProximityNotificationDTO;

/**
 * Service interface for sending push notifications.
 * This is a placeholder for future FCM integration.
 */
public interface NotificationService {
    
    /**
     * Send a proximity notification to a user.
     * 
     * @param notification The notification details
     * @return true if notification was sent successfully, false otherwise
     */
    boolean sendProximityNotification(ProximityNotificationDTO notification);
    
    /**
     * Register a device token for push notifications.
     * 
     * @param userId The user ID
     * @param deviceToken The FCM device token
     */
    void registerDeviceToken(String userId, String deviceToken);
    
    /**
     * Unregister a device token.
     * 
     * @param userId The user ID
     * @param deviceToken The FCM device token
     */
    void unregisterDeviceToken(String userId, String deviceToken);
}
