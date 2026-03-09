package com.mapic.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mapic.entity.UserLocation;

@Repository
public interface UserLocationRepository extends JpaRepository<UserLocation, Long> {
    
    @Query("SELECT ul FROM UserLocation ul WHERE ul.user.id = :userId AND ul.isCurrent = true")
    Optional<UserLocation> findCurrentLocationByUserId(@Param("userId") UUID userId);
    
    @Query("SELECT ul FROM UserLocation ul WHERE ul.user.id = :userId ORDER BY ul.timestamp DESC")
    List<UserLocation> findLocationHistoryByUserId(@Param("userId") UUID userId);
    
    @Query("SELECT ul FROM UserLocation ul WHERE ul.user.id = :userId " +
           "AND ul.timestamp >= :since ORDER BY ul.timestamp DESC")
    List<UserLocation> findLocationHistoryByUserIdSince(
        @Param("userId") UUID userId, 
        @Param("since") LocalDateTime since
    );
    
    @Modifying
    @Query("UPDATE UserLocation ul SET ul.isCurrent = false WHERE ul.user.id = :userId")
    void markAllAsNotCurrent(@Param("userId") UUID userId);
    
    @Modifying
    @Query("DELETE FROM UserLocation ul WHERE ul.timestamp < :cutoffDate")
    void deleteOldLocations(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    @Query(value = "SELECT ul.* FROM user_locations ul " +
           "INNER JOIN friendships f ON (f.user_id = :userId AND f.friend_id = ul.user_id AND f.status = 'ACCEPTED') " +
           "WHERE ul.is_current = true " +
           "AND ul.privacy_mode != 'GHOST_MODE'",
           nativeQuery = true)
    List<UserLocation> findFriendLocations(@Param("userId") UUID userId);
    
    /**
     * Calculate distance between two user locations using Haversine formula.
     * Returns distance in meters.
     */
    @Query(value = "SELECT 6371000 * acos(" +
           "cos(radians(ul1.latitude)) * cos(radians(ul2.latitude)) * " +
           "cos(radians(ul2.longitude) - radians(ul1.longitude)) + " +
           "sin(radians(ul1.latitude)) * sin(radians(ul2.latitude))" +
           ") FROM user_locations ul1, user_locations ul2 " +
           "WHERE ul1.id = :location1Id AND ul2.id = :location2Id",
           nativeQuery = true)
    Double calculateDistance(@Param("location1Id") Long location1Id, @Param("location2Id") Long location2Id);
    
    /**
     * Find all current locations for all users.
     * Used by proximity service to check all users.
     */
    @Query("SELECT ul FROM UserLocation ul WHERE ul.isCurrent = true")
    List<UserLocation> findAllCurrentLocations();
    
    /**
     * Calculate distance between two user locations using Haversine formula.
     * Returns distance in meters.
     */
    @Query(value = "SELECT 6371000 * acos(" +
           "cos(radians(ul1.latitude)) * cos(radians(ul2.latitude)) * " +
           "cos(radians(ul2.longitude) - radians(ul1.longitude)) + " +
           "sin(radians(ul1.latitude)) * sin(radians(ul2.latitude))" +
           ") FROM user_locations ul1, user_locations ul2 " +
           "WHERE ul1.id = :location1Id AND ul2.id = :location2Id",
           nativeQuery = true)
    Double calculateDistanceBetweenLocations(
        @Param("location1Id") Long location1Id, 
        @Param("location2Id") Long location2Id
    );
}
