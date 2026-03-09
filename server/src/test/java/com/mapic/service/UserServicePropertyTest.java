package com.mapic.service;

import com.mapic.dto.UserSearchResultDTO;
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
 * Property-based tests for UserService.
 * Tests universal properties that should hold across all inputs.
 * Each test runs 100+ iterations with randomly generated data.
 */
@SpringBootTest
@Transactional
class UserServicePropertyTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FriendshipRepository friendshipRepository;

    private final Random random = new Random();

    /**
     * Feature: friends-search, Property 6: Search result completeness
     * Validates: Requirements 3.1
     * 
     * For any search result, it should contain all required fields: 
     * id, name, username, and avatarUrl.
     */
    @Test
    void searchResultCompleteness() {
        int iterations = 100;
        
        for (int i = 0; i < iterations; i++) {
            // Generate random keyword and users
            String keyword = generateRandomKeyword();
            User authenticatedUser = createAndSaveUser("auth_user_" + i, ProfileVisibility.PUBLIC);
            List<User> users = generateRandomUsers(5, 10, keyword);
            
            // Setup: Clear database and save test users
            userRepository.deleteAll();
            friendshipRepository.deleteAll();
            userRepository.flush();
            friendshipRepository.flush();
            
            userRepository.save(authenticatedUser);
            userRepository.saveAll(users);
            userRepository.flush();
            
            // Execute: Search with keyword
            List<UserSearchResultDTO> results = userService.searchUsers(keyword, authenticatedUser.getId());
            
            // Verify: All results contain required fields
            for (UserSearchResultDTO result : results) {
                assertThat(result.getId())
                        .as("Iteration %d: Result should have non-null id", i)
                        .isNotNull();
                
                assertThat(result.getName())
                        .as("Iteration %d: Result should have non-null name", i)
                        .isNotNull();
                
                assertThat(result.getUsername())
                        .as("Iteration %d: Result should have non-null username", i)
                        .isNotNull();
                
                // avatarUrl can be null, but the field should exist
                assertThat(result)
                        .as("Iteration %d: Result should have avatarUrl field (can be null)", i)
                        .hasFieldOrProperty("avatarUrl");
            }
        }
    }

    /**
     * Feature: friends-search, Property 7: Sensitive data exclusion
     * Validates: Requirements 3.2, 7.5
     * 
     * For any search result, it should never contain sensitive fields 
     * such as email, phone, or password hash.
     */
    @Test
    void sensitiveDataExclusion() {
        int iterations = 100;
        
        for (int i = 0; i < iterations; i++) {
            // Generate random keyword and users with sensitive data
            String keyword = generateRandomKeyword();
            User authenticatedUser = createAndSaveUser("auth_user_" + i, ProfileVisibility.PUBLIC);
            List<User> users = generateRandomUsersWithSensitiveData(5, 10, keyword);
            
            // Setup: Clear database and save test users
            userRepository.deleteAll();
            friendshipRepository.deleteAll();
            userRepository.flush();
            friendshipRepository.flush();
            
            userRepository.save(authenticatedUser);
            userRepository.saveAll(users);
            userRepository.flush();
            
            // Execute: Search with keyword
            List<UserSearchResultDTO> results = userService.searchUsers(keyword, authenticatedUser.getId());
            
            // Verify: No sensitive fields in results
            for (UserSearchResultDTO result : results) {
                // Verify DTO class doesn't have sensitive fields
                assertThat(result)
                        .as("Iteration %d: Result should not have email field", i)
                        .doesNotHaveToString("email");
                
                assertThat(result)
                        .as("Iteration %d: Result should not have phone field", i)
                        .doesNotHaveToString("phone");
                
                assertThat(result)
                        .as("Iteration %d: Result should not have password field", i)
                        .doesNotHaveToString("password");
                
                // Verify the DTO only has expected fields
                assertThat(result)
                        .as("Iteration %d: Result should only have non-sensitive fields", i)
                        .hasOnlyFields("id", "name", "username", "avatarUrl", "friendshipStatus", "friendshipId");
            }
        }
    }

    /**
     * Feature: friends-search, Property 8: Friendship status inclusion
     * Validates: Requirements 4.1, 4.3
     * 
     * For any search result, it should include the friendship status between 
     * the authenticated user and the result user.
     */
    @Test
    void friendshipStatusInclusion() {
        int iterations = 100;
        
        for (int i = 0; i < iterations; i++) {
            // Generate random keyword and users
            String keyword = generateRandomKeyword();
            User authenticatedUser = createAndSaveUser("auth_user_" + i, ProfileVisibility.PUBLIC);
            List<User> users = generateRandomUsers(3, 6, keyword);
            
            // Setup: Clear database and save test users
            userRepository.deleteAll();
            friendshipRepository.deleteAll();
            userRepository.flush();
            friendshipRepository.flush();
            
            userRepository.save(authenticatedUser);
            userRepository.saveAll(users);
            userRepository.flush();
            
            // Create some random friendships
            for (User user : users) {
                if (random.nextBoolean() && user.getProfileVisibility() == ProfileVisibility.PUBLIC) {
                    // Create friendship with random status
                    FriendshipStatus status = randomFriendshipStatus();
                    Friendship friendship = Friendship.builder()
                            .userId1(authenticatedUser.getId())
                            .userId2(user.getId())
                            .status(status)
                            .build();
                    friendshipRepository.save(friendship);
                }
            }
            friendshipRepository.flush();
            
            // Execute: Search with keyword
            List<UserSearchResultDTO> results = userService.searchUsers(keyword, authenticatedUser.getId());
            
            // Verify: All results have friendship status field (can be null)
            for (UserSearchResultDTO result : results) {
                assertThat(result)
                        .as("Iteration %d: Result should have friendshipStatus field", i)
                        .hasFieldOrProperty("friendshipStatus");
                
                // Verify the friendship status matches what's in the database
                FriendshipStatus expectedStatus = friendshipRepository
                        .findByUserIds(authenticatedUser.getId(), result.getId())
                        .map(Friendship::getStatus)
                        .orElse(null);
                
                assertThat(result.getFriendshipStatus())
                        .as("Iteration %d: Friendship status should match database for user %s", 
                            i, result.getId())
                        .isEqualTo(expectedStatus);
            }
        }
    }

    // ==================== Helper Methods (Generators) ====================

    private String generateRandomKeyword() {
        int length = 3 + random.nextInt(15);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append((char) ('a' + random.nextInt(26)));
        }
        return sb.toString();
    }

    private ProfileVisibility randomVisibility() {
        ProfileVisibility[] visibilities = ProfileVisibility.values();
        return visibilities[random.nextInt(visibilities.length)];
    }

    private FriendshipStatus randomFriendshipStatus() {
        FriendshipStatus[] statuses = FriendshipStatus.values();
        return statuses[random.nextInt(statuses.length)];
    }

    private User createAndSaveUser(String usernamePrefix, ProfileVisibility visibility) {
        String uniqueUsername = usernamePrefix + "_" + System.nanoTime();
        String uniqueEmail = uniqueUsername + "@example.com";
        
        return User.builder()
                .username(uniqueUsername)
                .email(uniqueEmail)
                .password("password123")
                .nickName("Nick " + uniqueUsername)
                .profileVisibility(visibility)
                .isActive(true)
                .build();
    }

    private List<User> generateRandomUsers(int minSize, int maxSize, String keyword) {
        int size = minSize + random.nextInt(maxSize - minSize + 1);
        List<User> users = new ArrayList<>();
        
        for (int i = 0; i < size; i++) {
            String nickName = generateRandomName(keyword);
            String username = generateRandomUsername(keyword);
            ProfileVisibility visibility = randomVisibility();
            
            // Ensure username is unique and within 50 character limit
            String uniqueUsername = username.substring(0, Math.min(username.length(), 30)) + "_" + System.nanoTime() + "_" + i;
            String uniqueEmail = "user" + i + "_" + System.nanoTime() + "@example.com";
            
            User user = User.builder()
                    .username(uniqueUsername)
                    .email(uniqueEmail)
                    .password("password" + i)
                    .nickName(nickName)
                    .avatarUrl(random.nextBoolean() ? "https://example.com/avatar" + i + ".jpg" : null)
                    .profileVisibility(visibility)
                    .isActive(true)
                    .build();
            
            users.add(user);
        }
        
        return users;
    }

    private List<User> generateRandomUsersWithSensitiveData(int minSize, int maxSize, String keyword) {
        int size = minSize + random.nextInt(maxSize - minSize + 1);
        List<User> users = new ArrayList<>();
        
        for (int i = 0; i < size; i++) {
            String nickName = generateRandomName(keyword);
            String username = generateRandomUsername(keyword);
            ProfileVisibility visibility = randomVisibility();
            
            // Ensure username is unique and within 50 character limit
            String uniqueUsername = username.substring(0, Math.min(username.length(), 30)) + "_" + System.nanoTime() + "_" + i;
            String uniqueEmail = "sensitive" + i + "_" + System.nanoTime() + "@secret.com";
            String sensitivePhone = "123456789" + i;
            String sensitivePassword = "secretPassword" + i + "_" + System.nanoTime();
            
            User user = User.builder()
                    .username(uniqueUsername)
                    .email(uniqueEmail)
                    .phone(sensitivePhone)
                    .password(sensitivePassword)
                    .nickName(nickName)
                    .avatarUrl(random.nextBoolean() ? "https://example.com/avatar" + i + ".jpg" : null)
                    .profileVisibility(visibility)
                    .isActive(true)
                    .build();
            
            users.add(user);
        }
        
        return users;
    }

    private String generateRandomName(String keyword) {
        String baseName = generateRandomKeyword();
        
        // If keyword is provided, ensure some users contain it
        if (keyword != null && random.nextBoolean()) {
            // Insert keyword at random position
            int position = random.nextInt(baseName.length() + 1);
            baseName = baseName.substring(0, position) + keyword + baseName.substring(position);
        }
        
        return baseName;
    }

    private String generateRandomUsername(String keyword) {
        String baseUsername = generateRandomKeyword();
        
        // If keyword is provided, ensure some users contain it
        if (keyword != null && random.nextBoolean()) {
            // Insert keyword at random position
            int position = random.nextInt(baseUsername.length() + 1);
            baseUsername = baseUsername.substring(0, position) + keyword + baseUsername.substring(position);
        }
        
        return baseUsername;
    }
}
