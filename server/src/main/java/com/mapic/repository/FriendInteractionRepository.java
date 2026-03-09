package com.mapic.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mapic.entity.FriendInteraction;

@Repository
public interface FriendInteractionRepository extends JpaRepository<FriendInteraction, Long> {
    
    @Query("SELECT fi FROM FriendInteraction fi WHERE fi.toUser.id = :userId " +
           "ORDER BY fi.createdAt DESC")
    List<FriendInteraction> findReceivedInteractions(@Param("userId") UUID userId, Pageable pageable);
    
    @Query("SELECT fi FROM FriendInteraction fi WHERE fi.fromUser.id = :userId " +
           "ORDER BY fi.createdAt DESC")
    List<FriendInteraction> findSentInteractions(@Param("userId") UUID userId);
    
    @Query(value = "SELECT fi FROM FriendInteraction fi WHERE fi.fromUser.id = :fromUserId " +
           "ORDER BY fi.createdAt DESC")
    List<FriendInteraction> findLastInteractionByUserList(@Param("fromUserId") UUID fromUserId, Pageable pageable);
    
    default Optional<FriendInteraction> findLastInteractionByUser(UUID fromUserId) {
        List<FriendInteraction> results = findLastInteractionByUserList(fromUserId, Pageable.ofSize(1));
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }
    
    @Query("SELECT COUNT(fi) FROM FriendInteraction fi WHERE fi.fromUser.id = :userId " +
           "AND fi.interactionType = :type")
    Long countSentByType(@Param("userId") UUID userId, @Param("type") FriendInteraction.InteractionType type);
    
    @Query("SELECT COUNT(fi) FROM FriendInteraction fi WHERE fi.toUser.id = :userId " +
           "AND fi.interactionType = :type")
    Long countReceivedByType(@Param("userId") UUID userId, @Param("type") FriendInteraction.InteractionType type);
    
    @Query("SELECT fi.toUser.id, COUNT(fi) as count FROM FriendInteraction fi " +
           "WHERE fi.fromUser.id = :userId " +
           "GROUP BY fi.toUser.id " +
           "ORDER BY count DESC")
    List<Object[]> findTopInteractionPartners(@Param("userId") UUID userId, Pageable pageable);
}
