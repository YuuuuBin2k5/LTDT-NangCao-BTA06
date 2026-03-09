package com.mapic.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mapic.entity.ProximityNotification;

@Repository
public interface ProximityNotificationRepository extends JpaRepository<ProximityNotification, Long> {
    
    /**
     * Find the most recent proximity notification between a user and a friend.
     * Used to check if a notification was already sent within the deduplication window.
     */
    @Query("SELECT pn FROM ProximityNotification pn " +
           "WHERE pn.user.id = :userId AND pn.friend.id = :friendId " +
           "ORDER BY pn.notifiedAt DESC")
    Optional<ProximityNotification> findMostRecentNotification(
        @Param("userId") UUID userId, 
        @Param("friendId") UUID friendId
    );
    
    /**
     * Find all proximity notifications for a user within a time window.
     * Used to group multiple nearby friends in a single notification.
     */
    @Query("SELECT pn FROM ProximityNotification pn " +
           "WHERE pn.user.id = :userId " +
           "AND pn.notifiedAt > :since " +
           "ORDER BY pn.notifiedAt DESC")
    List<ProximityNotification> findRecentNotifications(
        @Param("userId") UUID userId,
        @Param("since") LocalDateTime since
    );
    
    /**
     * Check if a notification was sent to a user about a friend within the last hour.
     * Returns true if a notification exists within the deduplication window.
     */
    @Query("SELECT COUNT(pn) > 0 FROM ProximityNotification pn " +
           "WHERE pn.user.id = :userId " +
           "AND pn.friend.id = :friendId " +
           "AND pn.notifiedAt > :since")
    boolean existsRecentNotification(
        @Param("userId") UUID userId,
        @Param("friendId") UUID friendId,
        @Param("since") LocalDateTime since
    );
}
