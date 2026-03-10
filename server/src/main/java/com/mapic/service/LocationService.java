package com.mapic.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mapic.dto.LocationRequest;
import com.mapic.dto.location.FriendLocationDTO;
import com.mapic.dto.location.LocationHistoryDTO;
import com.mapic.entity.CurrentLocation;
import com.mapic.entity.User;
import com.mapic.entity.UserLocation;
import com.mapic.repository.CurrentLocationRepository;
import com.mapic.repository.UserLocationRepository;
import com.mapic.repository.UserAvatarFrameRepository;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final CurrentLocationRepository locationRepository;
    private final UserLocationRepository userLocationRepository;
    private final UserAvatarFrameRepository userAvatarFrameRepository;
    private final EntityManager entityManager;
    
    @Transactional
    public void updateLocation(User user, LocationRequest request) {
        CurrentLocation currentLocation = locationRepository.findById(user.getId()).orElse(null);
        
        if (currentLocation == null) {
            // Tạo location mới và persist trực tiếp
            currentLocation = new CurrentLocation();
            currentLocation.setUserId(user.getId());
            currentLocation.setUser(user);
            currentLocation.setLatitude(request.getLatitude());
            currentLocation.setLongitude(request.getLongitude());
            currentLocation.setHeading(request.getHeading());
            currentLocation.setSpeed(request.getSpeed());
            currentLocation.setBatteryLevel(request.getBatteryLevel());
            
            entityManager.persist(currentLocation);
        } else {
            // Cập nhật location đã tồn tại
            currentLocation.setLatitude(request.getLatitude());
            currentLocation.setLongitude(request.getLongitude());
            currentLocation.setHeading(request.getHeading());
            currentLocation.setSpeed(request.getSpeed());
            currentLocation.setBatteryLevel(request.getBatteryLevel());
            // Không cần gọi save vì entity đã được managed trong transaction
        }
        
        // Also save to location history
        saveLocationHistory(user, request);
    }
    
    @Transactional
    public void saveLocationHistory(User user, LocationRequest request) {
        // Mark all previous locations as not current
        userLocationRepository.markAllAsNotCurrent(user.getId());
        
        // Create new location history entry
        UserLocation userLocation = UserLocation.builder()
            .user(user)
            .latitude(request.getLatitude())
            .longitude(request.getLongitude())
            .accuracy(request.getAccuracy())
            .speed(request.getSpeed())
            .heading(request.getHeading())
            .timestamp(LocalDateTime.now())
            .isCurrent(true)
            .privacyMode(request.getPrivacyMode() != null ? request.getPrivacyMode() : UserLocation.PrivacyMode.ALL_FRIENDS)
            .statusMessage(request.getStatusMessage())
            .statusEmoji(request.getStatusEmoji())
            .build();
        
        userLocationRepository.save(userLocation);
    }
    
    @Transactional(readOnly = true)
    public List<FriendLocationDTO> getFriendLocations(UUID userId) {
        List<UserLocation> friendLocations = userLocationRepository.findFriendLocations(userId);
        
        return friendLocations.stream()
            .map(this::mapToFriendLocationDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<LocationHistoryDTO> getLocationHistory(UUID userId, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<UserLocation> history = userLocationRepository.findLocationHistoryByUserIdSince(userId, since);
        
        return history.stream()
            .map(this::mapToLocationHistoryDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void clearLocationHistory(UUID userId) {
        List<UserLocation> history = userLocationRepository.findLocationHistoryByUserId(userId);
        userLocationRepository.deleteAll(history);
    }
    
    @Transactional
    public void cleanupOldLocations() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        userLocationRepository.deleteOldLocations(cutoffDate);
    }
    
    public Double calculateDistance(Long location1Id, Long location2Id) {
        return userLocationRepository.calculateDistance(location1Id, location2Id);
    }
    
    private FriendLocationDTO mapToFriendLocationDTO(UserLocation location) {
        User friend = location.getUser();
        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(location.getTimestamp(), now);
        long minutesAgo = duration.toMinutes();
        boolean isOnline = minutesAgo < 5;
        
        // Fetch selected frame
        com.mapic.dto.avatar.AvatarFrameDTO selectedFrame = userAvatarFrameRepository.findSelectedFrameByUserId(friend.getId().toString())
            .map(uaf -> {
                com.mapic.entity.AvatarFrame frame = uaf.getFrame();
                return com.mapic.dto.avatar.AvatarFrameDTO.builder()
                    .id(frame.getId())
                    .name(frame.getName())
                    .frameType(frame.getFrameType())
                    .svgPath(frame.getSvgPath())
                    .isPremium(frame.getIsPremium())
                    .isSelected(true)
                    .isUnlocked(true)
                    .build();
            })
            .orElse(null);
            
        return FriendLocationDTO.builder()
            .userId(friend.getId())  // Changed from friendId to userId
            .name(friend.getNickName())
            .username(friend.getUsername())
            .avatarUrl(friend.getAvatarUrl())
            .selectedFrame(selectedFrame)
            .latitude(location.getLatitude())
            .longitude(location.getLongitude())
            .timestamp(location.getTimestamp())
            .isOnline(isOnline)
            .lastSeenMinutes(isOnline ? null : (int) minutesAgo)
            .statusMessage(location.getStatusMessage())
            .statusEmoji(location.getStatusEmoji())
            .build();
    }
    
    private LocationHistoryDTO mapToLocationHistoryDTO(UserLocation location) {
        return LocationHistoryDTO.builder()
            .id(location.getId())
            .latitude(location.getLatitude())
            .longitude(location.getLongitude())
            .timestamp(location.getTimestamp())
            .statusMessage(location.getStatusMessage())
            .statusEmoji(location.getStatusEmoji())
            .build();
    }
}