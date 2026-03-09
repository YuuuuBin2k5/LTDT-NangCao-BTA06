package com.mapic.service;

import com.mapic.dto.FriendshipDTO;
import com.mapic.dto.UserDTO;
import com.mapic.entity.Friendship;
import com.mapic.entity.FriendshipStatus;
import com.mapic.entity.User;
import com.mapic.repository.FriendshipRepository;
import com.mapic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of FriendshipService.
 * Handles bidirectional friendship logic where a friendship can be stored
 * with either user as userId1 or userId2.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FriendshipServiceImpl implements FriendshipService {
    
    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    
    /**
     * Get all friend IDs for a given user.
     * Implements bidirectional logic: if the user is userId1, returns userId2, and vice versa.
     * 
     * @param userId The user ID to get friends for
     * @return Set of friend user IDs
     */
    @Override
    public Set<UUID> getFriendIds(UUID userId) {
        log.debug("Getting friend IDs for user: {}", userId);
        
        List<Friendship> friendships = friendshipRepository.findAcceptedFriendshipsByUserId(userId);
        
        Set<UUID> friendIds = friendships.stream()
            .map(friendship -> {
                // If the user is userId, return friendId, otherwise return userId
                if (friendship.getUserId().equals(userId)) {
                    return friendship.getFriendId();
                } else {
                    return friendship.getUserId();
                }
            })
            .collect(Collectors.toSet());
        
        log.debug("Found {} friends for user: {}", friendIds.size(), userId);
        return friendIds;
    }
    
    /**
     * Check if two users are friends.
     * Uses bidirectional query to check both possible orderings of the user IDs.
     * 
     * @param userId1 First user ID
     * @param userId2 Second user ID
     * @return true if users are friends (ACCEPTED status), false otherwise
     */
    @Override
    public boolean areFriends(UUID userId1, UUID userId2) {
        log.debug("Checking if users {} and {} are friends", userId1, userId2);
        
        boolean areFriends = friendshipRepository.existsByUserIdsAndStatus(
            userId1, 
            userId2, 
            FriendshipStatus.ACCEPTED
        );
        
        log.debug("Users {} and {} are friends: {}", userId1, userId2, areFriends);
        return areFriends;
    }
    
    /**
     * Send a friend request from one user to another.
     * Creates a new Friendship record with status PENDING.
     * 
     * @param fromUserId The user sending the friend request
     * @param toUserId The user receiving the friend request
     * @return FriendshipDTO containing the created friendship data
     * @throws RuntimeException if users are the same, users don't exist, or friendship already exists
     */
    @Override
    @Transactional
    public FriendshipDTO sendFriendRequest(UUID fromUserId, UUID toUserId) {
        log.debug("Sending friend request from {} to {}", fromUserId, toUserId);
        
        // Validate: cannot send to self
        if (fromUserId.equals(toUserId)) {
            log.warn("User {} attempted to send friend request to themselves", fromUserId);
            throw new RuntimeException("Cannot send friend request to yourself");
        }
        
        // Validate: both users must exist
        if (!userRepository.existsById(fromUserId)) {
            log.warn("User {} not found when sending friend request", fromUserId);
            throw new RuntimeException("User not found");
        }
        
        if (!userRepository.existsById(toUserId)) {
            log.warn("Target user {} not found when sending friend request", toUserId);
            throw new RuntimeException("Target user not found");
        }
        
        // Check for existing friendship
        if (friendshipRepository.existsByUserIds(fromUserId, toUserId)) {
            log.warn("Friendship already exists between {} and {}", fromUserId, toUserId);
            throw new RuntimeException("Friend request already exists");
        }
        
        // Create new friendship
        Friendship friendship = Friendship.builder()
            .userId(fromUserId)
            .friendId(toUserId)
            .status(FriendshipStatus.PENDING)
            .build();
        
        Friendship savedFriendship = friendshipRepository.save(friendship);
        log.info("Friend request created with ID {} from {} to {}", 
                 savedFriendship.getId(), fromUserId, toUserId);
        
        return convertToDTO(savedFriendship);
    }
    
    /**
     * Delete a friendship.
     * Removes the friendship record from the database.
     * 
     * @param friendshipId The ID of the friendship to delete
     * @param userId The user requesting the deletion (must be part of the friendship)
     * @throws RuntimeException if friendship not found or user not authorized
     */
    @Override
    @Transactional
    public void deleteFriendship(UUID friendshipId, UUID userId) {
        log.debug("Deleting friendship {} by user {}", friendshipId, userId);
        
        Friendship friendship = friendshipRepository.findById(friendshipId)
            .orElseThrow(() -> {
                log.warn("Friendship {} not found", friendshipId);
                return new RuntimeException("Friendship not found");
            });
        
        // Verify user is part of this friendship
        if (!friendship.getUserId().equals(userId) && 
            !friendship.getFriendId().equals(userId)) {
            log.warn("User {} not authorized to delete friendship {}", userId, friendshipId);
            throw new RuntimeException("Not authorized to delete this friendship");
        }
        
        friendshipRepository.delete(friendship);
        log.info("Friendship {} deleted by user {}", friendshipId, userId);
    }
    
    /**
     * Get the friendship status between two users.
     * Returns the current status if a friendship exists, null otherwise.
     * 
     * @param userId1 First user ID
     * @param userId2 Second user ID
     * @return FriendshipStatus if friendship exists, null otherwise
     */
    @Override
    public FriendshipStatus getFriendshipStatus(UUID userId1, UUID userId2) {
        log.debug("Getting friendship status between {} and {}", userId1, userId2);
        
        return friendshipRepository.findByUserIds(userId1, userId2)
            .map(Friendship::getStatus)
            .orElse(null);
    }
    
    /**
     * Convert Friendship entity to DTO.
     * 
     * @param friendship The friendship entity
     * @return FriendshipDTO
     */
    private FriendshipDTO convertToDTO(Friendship friendship) {
        return FriendshipDTO.builder()
            .id(friendship.getId())
            .userId1(friendship.getUserId())
            .userId2(friendship.getFriendId())
            .status(friendship.getStatus())
            .createdAt(friendship.getCreatedAt())
            .build();
    }
    
    /**
     * Get list of friends for a user.
     * Returns users who have an ACCEPTED friendship with the specified user.
     * 
     * @param userId The user ID to get friends for
     * @return List of UserDTO representing friends
     */
    @Override
    public List<UserDTO> getFriends(UUID userId) {
        log.debug("Getting friends list for user: {}", userId);
        
        List<Friendship> friendships = friendshipRepository.findAcceptedFriendshipsByUserId(userId);
        
        // Create a map of friend ID to friendship for easy lookup
        Map<UUID, Friendship> friendshipMap = new HashMap<>();
        List<UUID> friendIds = friendships.stream()
            .map(friendship -> {
                UUID friendId;
                if (friendship.getUserId().equals(userId)) {
                    friendId = friendship.getFriendId();
                } else {
                    friendId = friendship.getUserId();
                }
                friendshipMap.put(friendId, friendship);
                return friendId;
            })
            .collect(Collectors.toList());
        
        // Fetch user details for all friend IDs
        List<User> friends = userRepository.findAllById(friendIds);
        
        log.debug("Found {} friends for user: {}", friends.size(), userId);
        
        return friends.stream()
            .map(friend -> {
                Friendship friendship = friendshipMap.get(friend.getId());
                return convertUserToDTO(friend, friendship);
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Get list of pending friend requests for a user.
     * Returns users who have sent PENDING friend requests to the specified user.
     * 
     * @param userId The user ID to get friend requests for
     * @return List of UserDTO representing users who sent friend requests
     */
    @Override
    public List<UserDTO> getFriendRequests(UUID userId) {
        log.debug("Getting friend requests for user: {}", userId);
        
        // Find friendships where the user is friendId and status is PENDING
        List<Friendship> pendingRequests = friendshipRepository.findByFriendIdAndStatus(userId, FriendshipStatus.PENDING);
        
        // Create a map of sender ID to friendship for easy lookup
        Map<UUID, Friendship> friendshipMap = new HashMap<>();
        List<UUID> senderIds = pendingRequests.stream()
            .map(friendship -> {
                UUID senderId = friendship.getUserId();
                friendshipMap.put(senderId, friendship);
                return senderId;
            })
            .collect(Collectors.toList());
        
        // Fetch user details for all sender IDs
        List<User> requesters = userRepository.findAllById(senderIds);
        
        log.debug("Found {} friend requests for user: {}", requesters.size(), userId);
        
        return requesters.stream()
            .map(requester -> {
                Friendship friendship = friendshipMap.get(requester.getId());
                return convertUserToDTO(requester, friendship);
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Convert User entity to UserDTO with friendship information.
     * 
     * @param user The user entity
     * @param friendship The friendship entity (can be null)
     * @return UserDTO
     */
    private UserDTO convertUserToDTO(User user, Friendship friendship) {
        return UserDTO.builder()
            .id(user.getId())
            .username(user.getUsername())
            .name(user.getNickName()) // Use nickName as name
            .avatarUrl(user.getAvatarUrl())
            .friendshipId(friendship != null ? friendship.getId() : null)
            .friendshipStatus(friendship != null ? friendship.getStatus() : null)
            .build();
    }
    
    /**
     * Accept a friend request.
     * Updates the friendship status from PENDING to ACCEPTED.
     * 
     * @param friendshipId The ID of the friendship to accept
     * @param userId The user accepting the request (must be userId2)
     * @return FriendshipDTO containing the updated friendship data
     * @throws RuntimeException if friendship not found or user not authorized
     */
    @Override
    @Transactional
    public FriendshipDTO acceptFriendRequest(UUID friendshipId, UUID userId) {
        log.debug("Accepting friend request {} by user {}", friendshipId, userId);
        
        Friendship friendship = friendshipRepository.findById(friendshipId)
            .orElseThrow(() -> {
                log.warn("Friendship {} not found", friendshipId);
                return new RuntimeException("Friendship not found");
            });
        
        // Verify user is the recipient (friendId)
        if (!friendship.getFriendId().equals(userId)) {
            log.warn("User {} not authorized to accept friendship {}", userId, friendshipId);
            throw new RuntimeException("Not authorized to accept this friend request");
        }
        
        // Verify status is PENDING
        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            log.warn("Friendship {} is not pending (status: {})", friendshipId, friendship.getStatus());
            throw new RuntimeException("Friend request is not pending");
        }
        
        // Update status to ACCEPTED
        friendship.setStatus(FriendshipStatus.ACCEPTED);
        Friendship savedFriendship = friendshipRepository.save(friendship);
        
        log.info("Friend request {} accepted by user {}", friendshipId, userId);
        return convertToDTO(savedFriendship);
    }
    
    /**
     * Reject a friend request.
     * Deletes the friendship record.
     * 
     * @param friendshipId The ID of the friendship to reject
     * @param userId The user rejecting the request (must be userId2)
     * @throws RuntimeException if friendship not found or user not authorized
     */
    @Override
    @Transactional
    public void rejectFriendRequest(UUID friendshipId, UUID userId) {
        log.debug("Rejecting friend request {} by user {}", friendshipId, userId);
        
        Friendship friendship = friendshipRepository.findById(friendshipId)
            .orElseThrow(() -> {
                log.warn("Friendship {} not found", friendshipId);
                return new RuntimeException("Friendship not found");
            });
        
        // Verify user is the recipient (friendId)
        if (!friendship.getFriendId().equals(userId)) {
            log.warn("User {} not authorized to reject friendship {}", userId, friendshipId);
            throw new RuntimeException("Not authorized to reject this friend request");
        }
        
        // Verify status is PENDING
        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            log.warn("Friendship {} is not pending (status: {})", friendshipId, friendship.getStatus());
            throw new RuntimeException("Friend request is not pending");
        }
        
        // Delete the friendship
        friendshipRepository.delete(friendship);
        log.info("Friend request {} rejected by user {}", friendshipId, userId);
    }
}
