package com.mapic.service;

import com.mapic.dto.FriendshipDTO;
import com.mapic.dto.UserDTO;
import com.mapic.entity.FriendshipStatus;

import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Service interface for Friendship-related operations.
 * Provides methods to check friendship status and retrieve friend lists.
 */
public interface FriendshipService {
    
    /**
     * Get all friend IDs for a given user.
     * Returns IDs of users who have an ACCEPTED friendship with the specified user.
     * 
     * @param userId The user ID to get friends for
     * @return Set of friend user IDs
     */
    Set<UUID> getFriendIds(UUID userId);
    
    /**
     * Check if two users are friends.
     * Returns true if there is an ACCEPTED friendship between the two users.
     * 
     * @param userId1 First user ID
     * @param userId2 Second user ID
     * @return true if users are friends (ACCEPTED status), false otherwise
     */
    boolean areFriends(UUID userId1, UUID userId2);
    
    /**
     * Send a friend request from one user to another.
     * Creates a new Friendship record with status PENDING.
     * 
     * @param fromUserId The user sending the friend request
     * @param toUserId The user receiving the friend request
     * @return FriendshipDTO containing the created friendship data
     * @throws RuntimeException if users are the same, users don't exist, or friendship already exists
     */
    FriendshipDTO sendFriendRequest(UUID fromUserId, UUID toUserId);
    
    /**
     * Delete a friendship.
     * Removes the friendship record from the database.
     * 
     * @param friendshipId The ID of the friendship to delete
     * @param userId The user requesting the deletion (must be part of the friendship)
     * @throws RuntimeException if friendship not found or user not authorized
     */
    void deleteFriendship(UUID friendshipId, UUID userId);
    
    /**
     * Get the friendship status between two users.
     * Returns the current status if a friendship exists, null otherwise.
     * 
     * @param userId1 First user ID
     * @param userId2 Second user ID
     * @return FriendshipStatus if friendship exists, null otherwise
     */
    FriendshipStatus getFriendshipStatus(UUID userId1, UUID userId2);
    
    /**
     * Get list of friends for a user.
     * Returns users who have an ACCEPTED friendship with the specified user.
     * 
     * @param userId The user ID to get friends for
     * @return List of UserDTO representing friends
     */
    List<UserDTO> getFriends(UUID userId);
    
    /**
     * Get list of pending friend requests for a user.
     * Returns users who have sent PENDING friend requests to the specified user.
     * 
     * @param userId The user ID to get friend requests for
     * @return List of UserDTO representing users who sent friend requests
     */
    List<UserDTO> getFriendRequests(UUID userId);
    
    /**
     * Accept a friend request.
     * Updates the friendship status from PENDING to ACCEPTED.
     * 
     * @param friendshipId The ID of the friendship to accept
     * @param userId The user accepting the request (must be friendId)
     * @return FriendshipDTO containing the updated friendship data
     * @throws RuntimeException if friendship not found or user not authorized
     */
    FriendshipDTO acceptFriendRequest(UUID friendshipId, UUID userId);
    
    /**
     * Reject a friend request.
     * Deletes the friendship record.
     * 
     * @param friendshipId The ID of the friendship to reject
     * @param userId The user rejecting the request (must be friendId)
     * @throws RuntimeException if friendship not found or user not authorized
     */
    void rejectFriendRequest(UUID friendshipId, UUID userId);
}
