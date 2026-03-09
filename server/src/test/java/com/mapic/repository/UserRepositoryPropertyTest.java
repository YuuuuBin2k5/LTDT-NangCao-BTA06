package com.mapic.repository;

import com.mapic.entity.ProfileVisibility;
import com.mapic.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Property-based tests for UserRepository.
 * Tests universal properties that should hold across all inputs.
 * Each test runs 100+ iterations with randomly generated data.
 */
@SpringBootTest
@Transactional
class UserRepositoryPropertyTest {

    @Autowired
    private UserRepository userRepository;

    private final Random random = new Random();

    /**
     * Feature: friends-search, Property 1: Keyword search matching
     * Validates: Requirements 1.1
     * 
     * For any search keyword and user database, all returned results should have 
     * the keyword in their name or username (case-insensitive).
     */
    @Test
    void keywordSearchMatching() {
        int iterations = 100;
        
        for (int i = 0; i < iterations; i++) {
            // Generate random keyword and users
            String keyword = generateRandomKeyword();
            List<User> users = generateRandomUsers(5, 10, keyword);
            
            // Setup: Clear database and save test users
            userRepository.deleteAll();
            userRepository.flush();
            userRepository.saveAll(users);
            userRepository.flush();
            
            // Execute: Search with keyword
            List<User> results = userRepository.searchPublicUsers(keyword);
            
            // Verify: All results contain the keyword (case-insensitive)
            String lowerKeyword = keyword.toLowerCase();
            for (User user : results) {
                boolean matchesNickName = user.getNickName().toLowerCase().contains(lowerKeyword);
                boolean matchesUsername = user.getUsername().toLowerCase().contains(lowerKeyword);
                
                assertThat(matchesNickName || matchesUsername)
                        .as("Iteration %d: User nickName '%s' or username '%s' should contain keyword '%s'", 
                            i, user.getNickName(), user.getUsername(), keyword)
                        .isTrue();
            }
        }
    }

    /**
     * Feature: friends-search, Property 2: SQL injection prevention
     * Validates: Requirements 1.2
     * 
     * For any search query containing SQL special characters, the system should 
     * sanitize the input and execute safely without SQL errors or unauthorized data access.
     */
    @Test
    void sqlInjectionPrevention() {
        String[] sqlInjectionAttempts = {
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "'; DELETE FROM users WHERE '1'='1",
            "' UNION SELECT * FROM users --",
            "admin'--",
            "' OR 1=1--",
            "'; UPDATE users SET nick_name='hacked' --",
            "1' AND '1'='1",
            "' OR 'x'='x",
            "%'; DROP TABLE users; --"
        };
        
        for (int i = 0; i < 100; i++) {
            // Generate random users
            List<User> users = generateRandomUsers(3, 8, null);
            
            // Setup: Clear database and save test users
            userRepository.deleteAll();
            userRepository.flush();
            userRepository.saveAll(users);
            userRepository.flush();
            long initialCount = userRepository.count();
            
            // Select random SQL injection attempt
            String maliciousKeyword = sqlInjectionAttempts[random.nextInt(sqlInjectionAttempts.length)];
            
            // Execute: Search with potentially malicious input
            // Should not throw exception
            List<User> results = userRepository.searchPublicUsers(maliciousKeyword);
            
            // Verify: Database integrity maintained
            long finalCount = userRepository.count();
            assertThat(finalCount)
                    .as("Iteration %d: Database should not be modified by SQL injection attempt", i)
                    .isEqualTo(initialCount);
            
            // Verify: Response is valid (not null)
            assertThat(results).isNotNull();
        }
    }

    /**
     * Feature: friends-search, Property 3: Public profile visibility
     * Validates: Requirements 1.3, 2.1
     * 
     * For any search query, all returned results should have profile_visibility set to PUBLIC.
     */
    @Test
    void publicProfileVisibility() {
        int iterations = 100;
        
        for (int i = 0; i < iterations; i++) {
            // Generate random keyword
            String keyword = generateRandomKeyword();
            
            // Generate users with various visibility settings
            List<User> users = generateRandomUsers(10, 20, keyword);
            
            // Setup: Clear database and save test users
            userRepository.deleteAll();
            userRepository.flush();
            userRepository.saveAll(users);
            userRepository.flush();
            
            // Execute: Search with keyword
            List<User> results = userRepository.searchPublicUsers(keyword);
            
            // Verify: All results have PUBLIC visibility
            for (User user : results) {
                assertThat(user.getProfileVisibility())
                        .as("Iteration %d: User should have PUBLIC profile visibility", i)
                        .isEqualTo(ProfileVisibility.PUBLIC);
            }
        }
    }

    /**
     * Feature: friends-search, Property 4: Private profile exclusion
     * Validates: Requirements 2.2
     * 
     * For any user with profile_visibility set to PRIVATE, that user should never 
     * appear in any search results.
     */
    @Test
    void privateProfileExclusion() {
        int iterations = 100;
        
        for (int i = 0; i < iterations; i++) {
            // Generate random keyword
            String keyword = generateRandomKeyword();
            
            // Generate users with various visibility settings
            List<User> users = generateRandomUsers(10, 20, keyword);
            
            // Setup: Clear database and save test users
            userRepository.deleteAll();
            userRepository.flush();
            userRepository.saveAll(users);
            userRepository.flush();
            
            // Execute: Search with keyword
            List<User> results = userRepository.searchPublicUsers(keyword);
            
            // Verify: No PRIVATE users in results
            for (User user : results) {
                assertThat(user.getProfileVisibility())
                        .as("Iteration %d: User should not have PRIVATE profile visibility", i)
                        .isNotEqualTo(ProfileVisibility.PRIVATE);
            }
        }
    }

    /**
     * Feature: friends-search, Property 5: Friends-only profile exclusion
     * Validates: Requirements 2.3
     * 
     * For any user with profile_visibility set to FRIENDS_ONLY, that user should not 
     * appear in search results for non-friends.
     */
    @Test
    void friendsOnlyProfileExclusion() {
        int iterations = 100;
        
        for (int i = 0; i < iterations; i++) {
            // Generate random keyword
            String keyword = generateRandomKeyword();
            
            // Generate users with various visibility settings
            List<User> users = generateRandomUsers(10, 20, keyword);
            
            // Setup: Clear database and save test users
            userRepository.deleteAll();
            userRepository.flush();
            userRepository.saveAll(users);
            userRepository.flush();
            
            // Execute: Search with keyword (simulating non-friend search)
            List<User> results = userRepository.searchPublicUsers(keyword);
            
            // Verify: No FRIENDS_ONLY users in results
            for (User user : results) {
                assertThat(user.getProfileVisibility())
                        .as("Iteration %d: User should not have FRIENDS_ONLY profile visibility", i)
                        .isNotEqualTo(ProfileVisibility.FRIENDS_ONLY);
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

    private List<User> generateRandomUsers(int minSize, int maxSize, String keyword) {
        int size = minSize + random.nextInt(maxSize - minSize + 1);
        List<User> users = new ArrayList<>();
        
        for (int i = 0; i < size; i++) {
            String nickName = generateRandomName(keyword);
            String username = generateRandomUsername(keyword);
            ProfileVisibility visibility = randomVisibility();
            
            // Ensure username is unique and within 50 character limit
            String uniqueUsername = username.substring(0, Math.min(username.length(), 30)) + "_" + i;
            String uniqueEmail = "user" + i + "_" + (System.nanoTime() % 100000) + "@example.com";
            
            User user = User.builder()
                    .username(uniqueUsername)
                    .email(uniqueEmail)
                    .password("password" + i)
                    .nickName(nickName)
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
