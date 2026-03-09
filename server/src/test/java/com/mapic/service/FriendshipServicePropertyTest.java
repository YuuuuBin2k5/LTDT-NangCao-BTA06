package com.mapic.service;

import com.mapic.dto.FriendshipDTO;
import com.mapic.entity.Friendship;
import com.mapic.entity.FriendshipStatus;
import com.mapic.entity.ProfileVisibility;
import com.mapic.entity.User;
import com.mapic.repository.FriendshipRepository;
import com.mapic.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Property-based tests for FriendshipService.
 * Tests universal properties that should hold across all inputs.
 * Each test runs 100+ iterations with randomly generated data.
 */
@SpringBootTest
@Transactional
class FriendshipServicePropertyTest {

    @Autowired
    private FriendshipService friendshipService;

    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private UserRepository userRepository;

    private final Random random = new Random();

    /**
     * Feature: friends-search, Property 10: Friend request creation
     * Validates: Requirements 5.2, 5.3
     * 
     * For any valid friend request (not to self, not duplicate), a Friendship record 
     * with status PENDING should be created with authenticated user as user_id_1.
     */
    @Test
    void friendRequestCreation() {
        int iterations = 100;
        
        for (int i = 0; i < iterations; i++) {
            // Setup: Clear database
            friendshipRepository.deleteAll();
            userRepository.deleteAll();
            friendshipRepository.flush();
            userRepository.flush();
            
            // Generate two different users
            User fromUser = generateRandomUser();
            User toUser = generateRandomUser();
            
            // Save users
            fromUser = userRepository.save(fromUser);
            toUser = userRepository.save(toUser);
            userRepository.flush();
            
            UUID fromUserId = fromUser.getId();
            UUID toUserId = toUser.getId();
            
            // Execute: Send friend request
            FriendshipDTO result = friendshipService.sendFriendRequest(fromUserId, toUserId);
            
            // Verify: Friendship was created
            assertThat(result).isNotNull();
            assertThat(result.getId()).isNotNull();
            
            // Verify: Status is PENDING
            assertThat(result.getStatus())
                    .as("Iteration %d: Friendship status should be PENDING", i)
                    .isEqualTo(FriendshipStatus.PENDING);
            
            // Verify: fromUser is userId1
            assertThat(result.getUserId1())
                    .as("Iteration %d: Authenticated user should be userId1", i)
                    .isEqualTo(fromUserId);
            
            // Verify: toUser is userId2
            assertThat(result.getUserId2())
                    .as("Iteration %d: Target user should be userId2", i)
                    .isEqualTo(toUserId);
            
            // Verify: Friendship exists in database
            Friendship savedFriendship = friendshipRepository.findById(result.getId()).orElse(null);
            assertThat(savedFriendship)
                    .as("Iteration %d: Friendship should exist in database", i)
                    .isNotNull();
            
            assertThat(savedFriendship.getStatus())
                    .as("Iteration %d: Saved friendship should have PENDING status", i)
                    .isEqualTo(FriendshipStatus.PENDING);
        }
    }

    /**
     * Feature: friends-search, Property 12: Friendship deletion
     * Validates: Requirements 6.4
     * 
     * For any delete friendship request, the Friendship record should be removed 
     * from the database.
     */
    @Test
    void friendshipDeletion() {
        int iterations = 100;
        
        for (int i = 0; i < iterations; i++) {
            // Setup: Clear database
            friendshipRepository.deleteAll();
            userRepository.deleteAll();
            friendshipRepository.flush();
            userRepository.flush();
            
            // Generate two users
            User user1 = generateRandomUser();
            User user2 = generateRandomUser();
            
            user1 = userRepository.save(user1);
            user2 = userRepository.save(user2);
            userRepository.flush();
            
            // Create a friendship
            Friendship friendship = Friendship.builder()
                    .userId1(user1.getId())
                    .userId2(user2.getId())
                    .status(randomFriendshipStatus())
                    .build();
            
            friendship = friendshipRepository.save(friendship);
            friendshipRepository.flush();
            
            Long friendshipId = friendship.getId();
            
            // Randomly choose which user deletes the friendship
            UUID deletingUserId = random.nextBoolean() ? user1.getId() : user2.getId();
            
            // Execute: Delete friendship
            friendshipService.deleteFriendship(friendshipId, deletingUserId);
            friendshipRepository.flush();
            
            // Verify: Friendship no longer exists in database
            boolean exists = friendshipRepository.existsById(friendshipId);
            assertThat(exists)
                    .as("Iteration %d: Friendship should be deleted from database", i)
                    .isFalse();
        }
    }

    // ==================== Helper Methods (Generators) ====================

    private User generateRandomUser() {
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        
        return User.builder()
                .username("user_" + uniqueId)
                .email("user_" + uniqueId + "@example.com")
                .password("password123")
                .nickName("User " + uniqueId)
                .profileVisibility(ProfileVisibility.PUBLIC)
                .isActive(true)
                .build();
    }

    private FriendshipStatus randomFriendshipStatus() {
        FriendshipStatus[] statuses = FriendshipStatus.values();
        return statuses[random.nextInt(statuses.length)];
    }

    // ==================== Unit Tests for Edge Cases ====================

    /**
     * Test self friend request throws RuntimeException.
     * Validates: Requirements 8.3
     */
    @Test
    void selfFriendRequestThrowsException() {
        // Setup: Create a user
        User user = generateRandomUser();
        user = userRepository.save(user);
        userRepository.flush();
        
        UUID userId = user.getId();
        
        // Execute & Verify: Attempt to send friend request to self should throw exception
        try {
            friendshipService.sendFriendRequest(userId, userId);
            assertThat(false).as("Should have thrown RuntimeException for self friend request").isTrue();
        } catch (RuntimeException e) {
            assertThat(e.getMessage()).contains("Cannot send friend request to yourself");
        }
    }

    /**
     * Test duplicate friend request throws RuntimeException.
     * Validates: Requirements 8.4
     */
    @Test
    void duplicateFriendRequestThrowsException() {
        // Setup: Create two users and an existing friendship
        User user1 = generateRandomUser();
        User user2 = generateRandomUser();
        
        user1 = userRepository.save(user1);
        user2 = userRepository.save(user2);
        userRepository.flush();
        
        // Create existing friendship
        Friendship existingFriendship = Friendship.builder()
                .userId1(user1.getId())
                .userId2(user2.getId())
                .status(FriendshipStatus.PENDING)
                .build();
        
        friendshipRepository.save(existingFriendship);
        friendshipRepository.flush();
        
        // Execute & Verify: Attempt to send duplicate friend request should throw exception
        try {
            friendshipService.sendFriendRequest(user1.getId(), user2.getId());
            assertThat(false).as("Should have thrown RuntimeException for duplicate friend request").isTrue();
        } catch (RuntimeException e) {
            assertThat(e.getMessage()).contains("Friend request already exists");
        }
    }

    /**
     * Test unauthorized deletion throws RuntimeException.
     * Validates: Requirements 8.3
     */
    @Test
    void unauthorizedDeletionThrowsException() {
        // Setup: Create three users and a friendship between two of them
        User user1 = generateRandomUser();
        User user2 = generateRandomUser();
        User user3 = generateRandomUser(); // Unauthorized user
        
        user1 = userRepository.save(user1);
        user2 = userRepository.save(user2);
        user3 = userRepository.save(user3);
        userRepository.flush();
        
        // Create friendship between user1 and user2
        Friendship friendship = Friendship.builder()
                .userId1(user1.getId())
                .userId2(user2.getId())
                .status(FriendshipStatus.ACCEPTED)
                .build();
        
        friendship = friendshipRepository.save(friendship);
        friendshipRepository.flush();
        
        Long friendshipId = friendship.getId();
        
        // Execute & Verify: Attempt to delete by unauthorized user should throw exception
        try {
            friendshipService.deleteFriendship(friendshipId, user3.getId());
            assertThat(false).as("Should have thrown RuntimeException for unauthorized deletion").isTrue();
        } catch (RuntimeException e) {
            assertThat(e.getMessage()).contains("Not authorized to delete this friendship");
        }
    }

    /**
     * Test user not found throws RuntimeException.
     * Validates: Requirements 8.4
     */
    @Test
    void userNotFoundThrowsException() {
        // Setup: Create one user
        User user1 = generateRandomUser();
        user1 = userRepository.save(user1);
        userRepository.flush();
        
        // Generate a random UUID that doesn't exist in database
        UUID nonExistentUserId = UUID.randomUUID();
        
        // Execute & Verify: Attempt to send friend request to non-existent user should throw exception
        try {
            friendshipService.sendFriendRequest(user1.getId(), nonExistentUserId);
            assertThat(false).as("Should have thrown RuntimeException for non-existent user").isTrue();
        } catch (RuntimeException e) {
            assertThat(e.getMessage()).contains("not found");
        }
    }

    /**
     * Test friendship not found throws RuntimeException.
     * Validates: Requirements 8.3
     */
    @Test
    void friendshipNotFoundThrowsException() {
        // Setup: Create a user
        User user = generateRandomUser();
        user = userRepository.save(user);
        userRepository.flush();
        
        // Use a non-existent friendship ID
        Long nonExistentFriendshipId = 999999L;
        
        // Execute & Verify: Attempt to delete non-existent friendship should throw exception
        try {
            friendshipService.deleteFriendship(nonExistentFriendshipId, user.getId());
            assertThat(false).as("Should have thrown RuntimeException for non-existent friendship").isTrue();
        } catch (RuntimeException e) {
            assertThat(e.getMessage()).contains("Friendship not found");
        }
    }
}
