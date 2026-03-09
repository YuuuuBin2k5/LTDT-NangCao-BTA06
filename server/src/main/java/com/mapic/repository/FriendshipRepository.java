package com.mapic.repository;

import com.mapic.entity.Friendship;
import com.mapic.entity.FriendshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, UUID> {
    
    /**
     * Find all accepted friendships for a given user.
     * Supports bidirectional lookup - user can be in either user_id or friend_id column.
     * 
     * @param userId The user ID to find friendships for
     * @return List of accepted friendships where the user is either userId or friendId
     */
    @Query("SELECT f FROM Friendship f WHERE " +
           "(f.userId = :userId OR f.friendId = :userId) " +
           "AND f.status = 'ACCEPTED'")
    List<Friendship> findAcceptedFriendshipsByUserId(@Param("userId") UUID userId);
    
    /**
     * Check if a friendship exists between two users with a specific status.
     * Supports bidirectional lookup - checks both (user1, user2) and (user2, user1) combinations.
     * 
     * @param userId1 First user ID
     * @param userId2 Second user ID
     * @param status The friendship status to check for
     * @return true if a friendship exists with the given status, false otherwise
     */
    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Friendship f WHERE " +
           "((f.userId = :userId1 AND f.friendId = :userId2) OR " +
           "(f.userId = :userId2 AND f.friendId = :userId1)) " +
           "AND f.status = :status")
    boolean existsByUserIdsAndStatus(
        @Param("userId1") UUID userId1,
        @Param("userId2") UUID userId2,
        @Param("status") FriendshipStatus status
    );
    
    /**
     * Check if any friendship exists between two users (regardless of status).
     * Supports bidirectional lookup - checks both (user1, user2) and (user2, user1) combinations.
     * 
     * @param userId1 First user ID
     * @param userId2 Second user ID
     * @return true if any friendship exists, false otherwise
     */
    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Friendship f WHERE " +
           "(f.userId = :userId1 AND f.friendId = :userId2) OR " +
           "(f.userId = :userId2 AND f.friendId = :userId1)")
    boolean existsByUserIds(
        @Param("userId1") UUID userId1,
        @Param("userId2") UUID userId2
    );
    
    /**
     * Find a friendship between two users (regardless of status).
     * Supports bidirectional lookup - checks both (user1, user2) and (user2, user1) combinations.
     * 
     * @param userId1 First user ID
     * @param userId2 Second user ID
     * @return Optional containing the friendship if found, empty otherwise
     */
    @Query("SELECT f FROM Friendship f WHERE " +
           "(f.userId = :userId1 AND f.friendId = :userId2) OR " +
           "(f.userId = :userId2 AND f.friendId = :userId1)")
    Optional<Friendship> findByUserIds(
        @Param("userId1") UUID userId1,
        @Param("userId2") UUID userId2
    );
    
    /**
     * Find all friendships where the user is friendId with a specific status.
     * Used to find incoming friend requests.
     * 
     * @param friendId The user ID who received the friend request
     * @param status The friendship status to filter by
     * @return List of friendships where friendId matches and status matches
     */
    List<Friendship> findByFriendIdAndStatus(UUID friendId, FriendshipStatus status);
}
