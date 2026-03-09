package com.mapic.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mapic.dto.post.CreatePostRequest;
import com.mapic.dto.post.PostDTO;
import com.mapic.dto.post.UpdatePostRequest;
import com.mapic.dto.post.UserSummaryDTO;
import com.mapic.entity.PostPrivacy;
import com.mapic.service.PostService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PostController.class)
class PostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PostService postService;

    private PostDTO testPostDTO;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testPostDTO = PostDTO.builder()
            .id(1L)
            .user(UserSummaryDTO.builder()
                .id(userId)
                .username("testuser")
                .nickName("Test User")
                .build())
            .content("Test post #test")
            .latitude(10.762622)
            .longitude(106.660172)
            .locationName("Test Location")
            .privacy(PostPrivacy.PUBLIC)
            .images(List.of())
            .likeCount(0)
            .commentCount(0)
            .isLiked(false)
            .viewCount(0)
            .hashtags(List.of("test"))
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
    }

    @Test
    @WithMockUser(username = "testuser")
    void testCreatePost_Success() throws Exception {
        // Given
        CreatePostRequest request = CreatePostRequest.builder()
            .content("Test post #test")
            .latitude(10.762622)
            .longitude(106.660172)
            .locationName("Test Location")
            .privacy(PostPrivacy.PUBLIC)
            .imageUrls(List.of())
            .build();

        when(postService.createPost(any(CreatePostRequest.class), any(UUID.class)))
            .thenReturn(testPostDTO);

        // When/Then
        mockMvc.perform(post("/api/posts")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.content").value("Test post #test"))
            .andExpect(jsonPath("$.latitude").value(10.762622))
            .andExpect(jsonPath("$.longitude").value(106.660172));
    }

    @Test
    @WithMockUser(username = "testuser")
    void testCreatePost_InvalidRequest() throws Exception {
        // Given: Request without required fields
        CreatePostRequest request = CreatePostRequest.builder()
            .content("") // Empty content
            .build();

        // When/Then
        mockMvc.perform(post("/api/posts")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "testuser")
    void testGetPost_Success() throws Exception {
        // Given
        when(postService.getPost(eq(1L), any(UUID.class)))
            .thenReturn(testPostDTO);

        // When/Then
        mockMvc.perform(get("/api/posts/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.content").value("Test post #test"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void testUpdatePost_Success() throws Exception {
        // Given
        UpdatePostRequest request = UpdatePostRequest.builder()
            .content("Updated content")
            .privacy(PostPrivacy.FRIENDS_ONLY)
            .build();

        PostDTO updatedPost = PostDTO.builder()
            .id(1L)
            .content("Updated content")
            .privacy(PostPrivacy.FRIENDS_ONLY)
            .build();

        when(postService.updatePost(eq(1L), any(UUID.class), any(UpdatePostRequest.class)))
            .thenReturn(updatedPost);

        // When/Then
        mockMvc.perform(put("/api/posts/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").value("Updated content"))
            .andExpect(jsonPath("$.privacy").value("FRIENDS_ONLY"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void testDeletePost_Success() throws Exception {
        // When/Then
        mockMvc.perform(delete("/api/posts/1")
                .with(csrf()))
            .andExpect(status().isNoContent());
    }

    @Test
    void testGetNearbyPosts_Success() throws Exception {
        // Given
        when(postService.getNearbyPosts(anyDouble(), anyDouble(), anyDouble(), any()))
            .thenReturn(List.of(testPostDTO));

        // When/Then
        mockMvc.perform(get("/api/posts/nearby")
                .param("latitude", "10.762622")
                .param("longitude", "106.660172")
                .param("radius", "5.0"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[0].content").value("Test post #test"));
    }

    @Test
    void testGetNearbyPosts_MissingRequiredParams() throws Exception {
        // When/Then: Missing latitude and longitude
        mockMvc.perform(get("/api/posts/nearby"))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "testuser")
    void testGetUserPostCount_Success() throws Exception {
        // Given
        when(postService.getUserPostCount(any(UUID.class)))
            .thenReturn(5L);

        // When/Then
        mockMvc.perform(get("/api/posts/user/" + userId + "/count"))
            .andExpect(status().isOk())
            .andExpect(content().string("5"));
    }
}
