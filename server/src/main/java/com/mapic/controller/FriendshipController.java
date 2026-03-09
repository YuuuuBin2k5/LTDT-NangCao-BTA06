package com.mapic.controller;

import com.mapic.dto.FriendshipDTO;
import com.mapic.dto.UserDTO;
import com.mapic.entity.User;
import com.mapic.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for friendship management.
 * Provides endpoints for sending friend requests and deleting friendships.
 */
@RestController
@RequestMapping("/api/friendships")
@RequiredArgsConstructor
@Slf4j
public class FriendshipController {
    
    private final FriendshipService friendshipService;
    
    /**
     * Send a friend request to another user.
     * 
     * @param user The authenticated user sending the request
     * @param request Request body containing the target user ID
     * @return FriendshipDTO with the created friendship data
     */
    @PostMapping
    public ResponseEntity<?> sendFriendRequest(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> request) {
        
        UUID fromUserId = user.getId();
        String toUserIdStr = request.get("toUserId");
        
        log.info("Friend request from user {} to user {}", fromUserId, toUserIdStr);
        
        try {
            UUID toUserId = UUID.fromString(toUserIdStr);
            FriendshipDTO friendship = friendshipService.sendFriendRequest(fromUserId, toUserId);
            
            log.info("Friend request created successfully: {}", friendship.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(friendship);
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid UUID format: {}", toUserIdStr);
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Invalid user ID format"));
                
        } catch (RuntimeException e) {
            String message = e.getMessage();
            log.warn("Failed to send friend request: {}", message);
            
            // Map specific error messages to appropriate HTTP status codes
            if (message.contains("Cannot send friend request to yourself")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", message));
                    
            } else if (message.contains("already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", message));
                    
            } else if (message.contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", message));
                    
            } else {
                return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to send friend request"));
            }
        }
    }
    
    /**
     * Delete a friendship (cancel friend request or unfriend).
     * 
     * @param user The authenticated user requesting the deletion
     * @param friendshipId The ID of the friendship to delete
     * @return Success message
     */
    @DeleteMapping("/{friendshipId}")
    public ResponseEntity<?> deleteFriendship(
            @AuthenticationPrincipal User user,
            @PathVariable UUID friendshipId) {
        
        UUID userId = user.getId();
        
        log.info("Delete friendship {} requested by user {}", friendshipId, userId);
        
        try {
            friendshipService.deleteFriendship(friendshipId, userId);
            
            log.info("Friendship {} deleted successfully", friendshipId);
            return ResponseEntity.ok()
                .body(Map.of("message", "Friendship deleted successfully"));
                
        } catch (RuntimeException e) {
            String message = e.getMessage();
            log.warn("Failed to delete friendship: {}", message);
            
            // Map specific error messages to appropriate HTTP status codes
            if (message.contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", message));
                    
            } else if (message.contains("Not authorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", message));
                    
            } else {
                return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to delete friendship"));
            }
        }
    }
    
    /**
     * Get list of friends for the authenticated user.
     * 
     * @param user The authenticated user
     * @return List of UserDTO representing friends
     */
    @GetMapping("/friends")
    public ResponseEntity<List<UserDTO>> getFriends(@AuthenticationPrincipal User user) {
        UUID userId = user.getId();
        
        log.info("Getting friends list for user {}", userId);
        
        try {
            List<UserDTO> friends = friendshipService.getFriends(userId);
            
            log.info("Found {} friends for user {}", friends.size(), userId);
            return ResponseEntity.ok(friends);
            
        } catch (RuntimeException e) {
            log.error("Failed to get friends list: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get list of pending friend requests for the authenticated user.
     * 
     * @param user The authenticated user
     * @return List of UserDTO representing users who sent friend requests
     */
    @GetMapping("/requests")
    public ResponseEntity<List<UserDTO>> getFriendRequests(@AuthenticationPrincipal User user) {
        UUID userId = user.getId();
        
        log.info("Getting friend requests for user {}", userId);
        
        try {
            List<UserDTO> requests = friendshipService.getFriendRequests(userId);
            
            log.info("Found {} friend requests for user {}", requests.size(), userId);
            return ResponseEntity.ok(requests);
            
        } catch (RuntimeException e) {
            log.error("Failed to get friend requests: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Accept a friend request.
     * 
     * @param user The authenticated user
     * @param friendshipId The ID of the friendship to accept
     * @return FriendshipDTO with updated status
     */
    @PutMapping("/{friendshipId}/accept")
    public ResponseEntity<?> acceptFriendRequest(
            @AuthenticationPrincipal User user,
            @PathVariable UUID friendshipId) {
        
        UUID userId = user.getId();
        
        log.info("Accept friend request {} by user {}", friendshipId, userId);
        
        try {
            FriendshipDTO friendship = friendshipService.acceptFriendRequest(friendshipId, userId);
            
            log.info("Friend request {} accepted successfully", friendshipId);
            return ResponseEntity.ok(friendship);
            
        } catch (RuntimeException e) {
            String message = e.getMessage();
            log.warn("Failed to accept friend request: {}", message);
            
            if (message.contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", message));
            } else if (message.contains("Not authorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", message));
            } else if (message.contains("not pending")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", message));
            } else {
                return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to accept friend request"));
            }
        }
    }
    
    /**
     * Reject a friend request.
     * 
     * @param user The authenticated user
     * @param friendshipId The ID of the friendship to reject
     * @return Success message
     */
    @PutMapping("/{friendshipId}/reject")
    public ResponseEntity<?> rejectFriendRequest(
            @AuthenticationPrincipal User user,
            @PathVariable UUID friendshipId) {
        
        UUID userId = user.getId();
        
        log.info("Reject friend request {} by user {}", friendshipId, userId);
        
        try {
            friendshipService.rejectFriendRequest(friendshipId, userId);
            
            log.info("Friend request {} rejected successfully", friendshipId);
            return ResponseEntity.ok()
                .body(Map.of("message", "Friend request rejected successfully"));
            
        } catch (RuntimeException e) {
            String message = e.getMessage();
            log.warn("Failed to reject friend request: {}", message);
            
            if (message.contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", message));
            } else if (message.contains("Not authorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", message));
            } else if (message.contains("not pending")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", message));
            } else {
                return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to reject friend request"));
            }
        }
    }
}
