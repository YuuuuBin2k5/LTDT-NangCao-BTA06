package com.mapic.service;

import org.springframework.stereotype.Service;

import com.mapic.dto.notification.ProximityNotificationDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Implementation of NotificationService.
 * Currently logs notifications - can be extended with FCM integration.
 * 
 * To integrate with Firebase Cloud Messaging (FCM):
 * 1. Add firebase-admin dependency to pom.xml
 * 2. Add Firebase service account JSON to resources
 * 3. Initialize Firebase in a @PostConstruct method
 * 4. Use FirebaseMessaging.getInstance().send() to send notifications
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {
    
    @Override
    public boolean sendProximityNotification(ProximityNotificationDTO notification) {
        // TODO: Integrate with Firebase Cloud Messaging (FCM)
        // For now, just log the notification
        
        if (notification.getNearbyFriends() != null && notification.getNearbyFriends().size() > 1) {
            // Multiple friends nearby
            log.info("📱 PROXIMITY NOTIFICATION: {} friends are nearby user {}", 
                notification.getNearbyFriends().size(), 
                notification.getUserId());
            log.info("   Title: {}", notification.getTitle());
            log.info("   Body: {}", notification.getBody());
            
            for (ProximityNotificationDTO.NearbyFriend friend : notification.getNearbyFriends()) {
                log.info("   - {} ({}m away)", friend.getFriendName(), 
                    Math.round(friend.getDistanceMeters()));
            }
        } else {
            // Single friend nearby
            log.info("📱 PROXIMITY NOTIFICATION: {} is nearby user {} at {}m", 
                notification.getFriendName(),
                notification.getUserId(),
                Math.round(notification.getDistanceMeters()));
            log.info("   Title: {}", notification.getTitle());
            log.info("   Body: {}", notification.getBody());
        }
        
        // Return true to indicate notification was "sent" (logged)
        return true;
    }
    
    @Override
    public void registerDeviceToken(String userId, String deviceToken) {
        // TODO: Store device token in database for FCM
        log.info("📱 Device token registered for user {}: {}", userId, deviceToken);
    }
    
    @Override
    public void unregisterDeviceToken(String userId, String deviceToken) {
        // TODO: Remove device token from database
        log.info("📱 Device token unregistered for user {}: {}", userId, deviceToken);
    }
}
