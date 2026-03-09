package com.mapic.service;

import com.mapic.dto.post.CreatePostRequest;
import com.mapic.dto.post.PostDTO;
import com.mapic.dto.post.UpdatePostRequest;
import com.mapic.entity.*;
import com.mapic.repository.PostRepository;
import com.mapic.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HashtagService hashtagService;

    @Mock
    private FriendshipService friendshipService;

    @InjectMocks
    private PostService postService;

    private User testUser;
    private Post testPost;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = User.builder()
            .id(userId)
            .username("testuser")
            .email("test@example.com")
            .nickName("Test User")
            .build();

        testPost = Post.builder()
            .id(1L)
            .user(testUser)
            .content("Test post #test")
            .latitude(10.762622)
            .longitude(106.660172)
            .locationName("Test Location")
            .privacy(PostPrivacy.PUBLIC)
            .viewCount(0)
            .images(new ArrayList<>())
            .hashtags(new HashSet<>())
            .build();
    }

    @Test
    void testCreatePost_Success() {
        // Given
        CreatePostRequest request = CreatePostRequest.builder()
            .content("Test post #test #hashtag")
            .latitude(10.762622)
            .longitude(106.660172)
            .locationName("Test Location")
            .privacy(PostPrivacy.PUBLIC)
            .imageUrls(List.of("https://example.com/image.jpg"))
            .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(hashtagService.extractHashtags(anyString()))
            .thenReturn(Set.of("test", "hashtag"));
        when(hashtagService.findOrCreate(anyString()))
            .thenReturn(Hashtag.builder().name("test").build());
        when(postRepository.save(any(Post.class))).thenReturn(testPost);

        // When
        PostDTO result = postService.createPost(request, userId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEqualTo(testPost.getContent());
        verify(postRepository).save(any(Post.class));
        verify(hashtagService, times(2)).incrementUsageCount(any(Hashtag.class));
    }

    @Test
    void testCreatePost_UserNotFound() {
        // Given
        CreatePostRequest request = CreatePostRequest.builder()
            .content("Test post")
            .latitude(10.762622)
            .longitude(106.660172)
            .privacy(PostPrivacy.PUBLIC)
            .build();

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> postService.createPost(request, userId))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("User not found");
    }

    @Test
    void testUpdatePost_Success() {
        // Given
        UpdatePostRequest request = UpdatePostRequest.builder()
            .content("Updated content #new")
            .privacy(PostPrivacy.FRIENDS_ONLY)
            .build();

        when(postRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(testPost));
        when(hashtagService.extractHashtags("Test post #test")).thenReturn(Set.of("test"));
        when(hashtagService.extractHashtags("Updated content #new")).thenReturn(Set.of("new"));
        when(hashtagService.findOrCreate(anyString()))
            .thenReturn(Hashtag.builder().name("new").build());
        when(postRepository.save(any(Post.class))).thenReturn(testPost);

        // When
        PostDTO result = postService.updatePost(1L, userId, request);

        // Then
        assertThat(result).isNotNull();
        verify(postRepository).save(any(Post.class));
    }

    @Test
    void testUpdatePost_NotAuthorized() {
        // Given
        UUID anotherUserId = UUID.randomUUID();
        UpdatePostRequest request = UpdatePostRequest.builder()
            .content("Updated content")
            .build();

        when(postRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(testPost));

        // When/Then
        assertThatThrownBy(() -> postService.updatePost(1L, anotherUserId, request))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Not authorized");
    }

    @Test
    void testDeletePost_Success() {
        // Given
        when(postRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(testPost));

        // When
        postService.deletePost(1L, userId);

        // Then
        verify(postRepository).delete(testPost);
    }

    @Test
    void testDeletePost_NotAuthorized() {
        // Given
        UUID anotherUserId = UUID.randomUUID();
        when(postRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(testPost));

        // When/Then
        assertThatThrownBy(() -> postService.deletePost(1L, anotherUserId))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Not authorized");
    }

    @Test
    void testGetPost_Success() {
        // Given
        when(postRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(testPost));

        // When
        PostDTO result = postService.getPost(1L, userId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(postRepository).save(any(Post.class)); // View count incremented
    }

    @Test
    void testGetPost_NotFound() {
        // Given
        when(postRepository.findByIdWithDetails(1L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> postService.getPost(1L, userId))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Post not found");
    }

    @Test
    void testGetNearbyPosts_WithUser() {
        // Given
        when(postRepository.findNearbyPostsForUser(
            anyDouble(), anyDouble(), anyDouble(), any(UUID.class), anyInt()
        )).thenReturn(List.of(testPost));

        // When
        List<PostDTO> results = postService.getNearbyPosts(
            10.762622, 106.660172, 5.0, userId
        );

        // Then
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getId()).isEqualTo(1L);
    }

    @Test
    void testGetNearbyPosts_WithoutUser() {
        // Given
        when(postRepository.findNearbyPublicPosts(
            anyDouble(), anyDouble(), anyDouble(), anyInt()
        )).thenReturn(List.of(testPost));

        // When
        List<PostDTO> results = postService.getNearbyPosts(
            10.762622, 106.660172, 5.0, null
        );

        // Then
        assertThat(results).hasSize(1);
        verify(postRepository).findNearbyPublicPosts(anyDouble(), anyDouble(), anyDouble(), anyInt());
    }

    @Test
    void testGetUserPostCount() {
        // Given
        when(postRepository.countByUserId(userId)).thenReturn(5L);

        // When
        Long count = postService.getUserPostCount(userId);

        // Then
        assertThat(count).isEqualTo(5L);
    }
}
