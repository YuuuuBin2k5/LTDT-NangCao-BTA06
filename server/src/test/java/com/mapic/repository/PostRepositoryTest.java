package com.mapic.repository;

import com.mapic.entity.Post;
import com.mapic.entity.PostPrivacy;
import com.mapic.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class PostRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private Post testPost;

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = User.builder()
            .username("testuser")
            .email("test@example.com")
            .password("password")
            .nickName("Test User")
            .isActive(true)
            .build();
        testUser = userRepository.save(testUser);

        // Create test post
        testPost = Post.builder()
            .user(testUser)
            .content("Test post content #test")
            .latitude(10.762622)
            .longitude(106.660172)
            .locationName("Test Location")
            .privacy(PostPrivacy.PUBLIC)
            .viewCount(0)
            .build();
        testPost = postRepository.save(testPost);
    }

    @Test
    void testFindNearbyPublicPosts() {
        // Given: A post at (10.762622, 106.660172)
        // When: Search within 10km radius
        List<Post> posts = postRepository.findNearbyPublicPosts(
            10.762622, 106.660172, 10000.0, 10
        );

        // Then: Should find the post
        assertThat(posts).isNotEmpty();
        assertThat(posts).contains(testPost);
    }

    @Test
    void testFindNearbyPublicPosts_OutOfRange() {
        // Given: A post at (10.762622, 106.660172)
        // When: Search far away (Hanoi coordinates)
        List<Post> posts = postRepository.findNearbyPublicPosts(
            21.028511, 105.852219, 10000.0, 10
        );

        // Then: Should not find the post
        assertThat(posts).doesNotContain(testPost);
    }

    @Test
    void testFindNearbyPublicPosts_PrivatePostNotIncluded() {
        // Given: A private post
        Post privatePost = Post.builder()
            .user(testUser)
            .content("Private post")
            .latitude(10.762622)
            .longitude(106.660172)
            .locationName("Test Location")
            .privacy(PostPrivacy.PRIVATE)
            .viewCount(0)
            .build();
        postRepository.save(privatePost);

        // When: Search nearby
        List<Post> posts = postRepository.findNearbyPublicPosts(
            10.762622, 106.660172, 10000.0, 10
        );

        // Then: Should not include private post
        assertThat(posts).doesNotContain(privatePost);
        assertThat(posts).contains(testPost);
    }

    @Test
    void testFindByUserId() {
        // When: Find posts by user
        Page<Post> posts = postRepository.findByUserId(
            testUser.getId(), PageRequest.of(0, 10)
        );

        // Then: Should find user's posts
        assertThat(posts.getContent()).contains(testPost);
        assertThat(posts.getTotalElements()).isEqualTo(1);
    }

    @Test
    void testFindByUserIdAndPrivacy() {
        // Given: Multiple posts with different privacy
        Post publicPost = testPost;
        Post privatePost = Post.builder()
            .user(testUser)
            .content("Private post")
            .latitude(10.762622)
            .longitude(106.660172)
            .privacy(PostPrivacy.PRIVATE)
            .viewCount(0)
            .build();
        postRepository.save(privatePost);

        // When: Find only public posts
        Page<Post> posts = postRepository.findByUserIdAndPrivacy(
            testUser.getId(), PostPrivacy.PUBLIC, PageRequest.of(0, 10)
        );

        // Then: Should only find public posts
        assertThat(posts.getContent()).contains(publicPost);
        assertThat(posts.getContent()).doesNotContain(privatePost);
    }

    @Test
    void testFindByIdWithUser() {
        // When: Find post with user eager loaded
        var result = postRepository.findByIdWithUser(testPost.getId());

        // Then: Should find post with user loaded
        assertThat(result).isPresent();
        assertThat(result.get().getUser()).isNotNull();
        assertThat(result.get().getUser().getUsername()).isEqualTo("testuser");
    }

    @Test
    void testCountByUserId() {
        // Given: User with one post
        // When: Count posts
        Long count = postRepository.countByUserId(testUser.getId());

        // Then: Should return 1
        assertThat(count).isEqualTo(1);
    }

    @Test
    void testCountPublicPostsByUserId() {
        // Given: User with public and private posts
        Post privatePost = Post.builder()
            .user(testUser)
            .content("Private post")
            .latitude(10.762622)
            .longitude(106.660172)
            .privacy(PostPrivacy.PRIVATE)
            .viewCount(0)
            .build();
        postRepository.save(privatePost);

        // When: Count public posts
        Long count = postRepository.countPublicPostsByUserId(testUser.getId());

        // Then: Should return 1 (only public post)
        assertThat(count).isEqualTo(1);
    }

    @Test
    void testIsPostOwnedByUser() {
        // When: Check ownership
        boolean isOwned = postRepository.isPostOwnedByUser(
            testPost.getId(), testUser.getId()
        );

        // Then: Should return true
        assertThat(isOwned).isTrue();
    }

    @Test
    void testIsPostOwnedByUser_NotOwner() {
        // Given: Another user
        User anotherUser = User.builder()
            .username("another")
            .email("another@example.com")
            .password("password")
            .nickName("Another User")
            .isActive(true)
            .build();
        anotherUser = userRepository.save(anotherUser);

        // When: Check ownership
        boolean isOwned = postRepository.isPostOwnedByUser(
            testPost.getId(), anotherUser.getId()
        );

        // Then: Should return false
        assertThat(isOwned).isFalse();
    }
}
