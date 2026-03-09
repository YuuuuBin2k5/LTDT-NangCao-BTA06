package com.mapic.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mapic.entity.ProximityNotification;
import com.mapic.entity.User;
import com.mapic.entity.UserLocation;
import com.mapic.repository.ProximityNotificationRepository;
import com.mapic.repository.UserLocationRepository;
import com.mapic.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProximityServiceImpl implements ProximityService {
    
    private final UserLocationRepository userLocationRepository;
    private final ProximityNotificationRepository proximityNotificationRepository;
    private final FriendshipService friendshipService;
    private final UserRepository userRepository;
    
    private static final double PROXIMITY_THRESHOLD_METERS = 500.0;
    private static final int NOTIFICATION_COOLDOWN_HOURS = 1;
    
    /**
     * Scheduled task that runs every minute to check proximity for all users.
     * This is disabled by default - uncomment @Scheduled to enable.
     */
    // @Scheduled(fixedRate = 60000) // Run every 60 seconds
    @Override
    @Transactional
    public void checkProximityForAllUsers() {
        log.info("Starting proximity check for all users");
        
        try {
            // Get all users who have current locations
            List<UserLocation> allCurrentLocations = userLocationRepository.findAllCurrentLocations();
            log.info("Found {} users with current locations", allCurrentLocations.size());
            
            int notificationsSent = 0;
            for (UserLocation userLocation : allCurrentLocations) {
                try {
                    List<UUID> nearbyFriends = checkProximityForUser(userLocation.getUser().getId());
                    notificationsSent += nearbyFriends.size();
                } catch (Exception e) {
                    log.error("Error checking proximity for user {}: {}", 
                        userLocation.getUser().getId(), e.getMessage());
                }
            }
            
            log.info("Proximity check completed. Sent {} notifications", notificationsSent);
        } catch (Exception e) {
            log.error("Error in proximity check: {}", e.getMessage(), e);
        }
    }
    
    @Override
    @Transactional
    public List<UUID> checkProximityForUser(UUID userId) {
        log.debug("Checking proximity for user {}", userId);
        
        List<UUID> nearbyFriendIds = new ArrayList<>();
        
        // Get user's current location
        UserLocation userLocation = userLocationRepository.findCurrentLocationByUserId(userId)
            .orElse(null);
        
        if (userLocation == null) {
            log.debug("User {} has no current location", userId);
            return nearbyFriendIds;
        }
        
        // Check if user is in Ghost Mode
        if (userLocation.getPrivacyMode() == UserLocation.PrivacyMode.GHOST_MODE) {
            log.debug("User {} is in Ghost Mode, skipping proximity check", userId);
            return nearbyFriendIds;
        }
        
        // Get all friends
        Set<UUID> friendIds = friendshipService.getFriendIds(userId);
        if (friendIds.isEmpty()) {
            log.debug("User {} has no friends", userId);
            return nearbyFriendIds;
        }
        
        log.debug("User {} has {} friends to check", userId, friendIds.size());
        
        // Check each friend's proximity
        LocalDateTime cooldownThreshold = LocalDateTime.now().minusHours(NOTIFICATION_COOLDOWN_HOURS);
        
        for (UUID friendId : friendIds) {
            try {
                // Check if notification was already sent within cooldown period
                boolean recentNotificationExists = proximityNotificationRepository
                    .existsRecentNotification(userId, friendId, cooldownThreshold);
                
                if (recentNotificationExists) {
                    log.debug("Skipping friend {} - notification sent within last hour", friendId);
                    continue;
                }
                
                // Get friend's current location
                UserLocation friendLocation = userLocationRepository.findCurrentLocationByUserId(friendId)
                    .orElse(null);
                
                if (friendLocation == null) {
                    log.debug("Friend {} has no current location", friendId);
                    continue;
                }
                
                // Check if friend is in Ghost Mode
                if (friendLocation.getPrivacyMode() == UserLocation.PrivacyMode.GHOST_MODE) {
                    log.debug("Friend {} is in Ghost Mode", friendId);
                    continue;
                }
                
                // Calculate distance using PostGIS
                Double distance = userLocationRepository.calculateDistanceBetweenLocations(
                    userLocation.getId(), friendLocation.getId());
                
                if (distance != null && distance <= PROXIMITY_THRESHOLD_METERS) {
                    log.info("Friend {} is nearby user {} at distance {}m", friendId, userId, distance);
                    
                    // Create proximity notification record
                    User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                    User friend = userRepository.findById(friendId)
                        .orElseThrow(() -> new RuntimeException("Friend not found"));
                    
                    ProximityNotification notification = ProximityNotification.builder()
                        .user(user)
                        .friend(friend)
                        .distanceMeters(distance.floatValue())
                        .build();
                    
                    proximityNotificationRepository.save(notification);
                    nearbyFriendIds.add(friendId);
                    
                    log.debug("Saved proximity notification for user {} and friend {}", userId, friendId);
                }
            } catch (Exception e) {
                log.error("Error checking proximity for friend {}: {}", friendId, e.getMessage());
            }
        }
        
        log.debug("Found {} nearby friends for user {}", nearbyFriendIds.size(), userId);
        return nearbyFriendIds;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Double calculateDistanceBetweenUsers(UUID userId1, UUID userId2) {
        UserLocation location1 = userLocationRepository.findCurrentLocationByUserId(userId1)
            .orElse(null);
        UserLocation location2 = userLocationRepository.findCurrentLocationByUserId(userId2)
            .orElse(null);
        
        if (location1 == null || location2 == null) {
            return null;
        }
        
        return userLocationRepository.calculateDistanceBetweenLocations(
            location1.getId(), location2.getId());
    }
}
