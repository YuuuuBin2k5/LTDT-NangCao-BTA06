package com.mapic.dto.notification;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProximityNotificationDTO {
    
    /**
     * The user who will receive the notification
     */
    private UUID userId;
    
    /**
     * Single friend who is nearby (for single friend notifications)
     */
    private UUID friendId;
    
    /**
     * Friend's name
     */
    private String friendName;
    
    /**
     * Distance to friend in meters
     */
    private Float distanceMeters;
    
    /**
     * Multiple friends who are nearby (for grouped notifications)
     */
    private List<NearbyFriend> nearbyFriends;
    
    /**
     * Notification title
     */
    private String title;
    
    /**
     * Notification body/message
     */
    private String body;
    
    /**
     * Data payload for the notification (used to open specific screen)
     */
    private NotificationData data;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NearbyFriend {
        private UUID friendId;
        private String friendName;
        private Float distanceMeters;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationData {
        private String type; // "proximity"
        private UUID friendId; // For single friend
        private List<UUID> friendIds; // For multiple friends
        private String action; // "open_map"
    }
}
