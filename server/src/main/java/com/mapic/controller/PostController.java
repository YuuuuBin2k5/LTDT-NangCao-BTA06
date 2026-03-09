package com.mapic.controller;

import com.mapic.dto.post.CreatePostRequest;
import com.mapic.dto.post.PostDTO;
import com.mapic.dto.post.UpdatePostRequest;
import com.mapic.entity.User;
import com.mapic.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Slf4j
public class PostController {

    private final PostService postService;

    /**
     * Helper method to extract user ID from UserDetails
     */
    private UUID getUserId(UserDetails userDetails) {
        if (userDetails instanceof User) {
            return ((User) userDetails).getId();
        }
        return null;
    }

    /**
     * Create a new post
     * POST /api/posts
     */
    @PostMapping
    public ResponseEntity<PostDTO> createPost(
        @Valid @RequestBody CreatePostRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = getUserId(userDetails);
        PostDTO post = postService.createPost(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    /**
     * Get post by ID
     * GET /api/posts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPost(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = getUserId(userDetails);
        PostDTO post = postService.getPost(id, userId);
        return ResponseEntity.ok(post);
    }

    /**
     * Update a post
     * PUT /api/posts/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<PostDTO> updatePost(
        @PathVariable Long id,
        @Valid @RequestBody UpdatePostRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = getUserId(userDetails);
        PostDTO post = postService.updatePost(id, userId, request);
        return ResponseEntity.ok(post);
    }

    /**
     * Delete a post
     * DELETE /api/posts/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = getUserId(userDetails);
        postService.deletePost(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get nearby posts
     * GET /api/posts/nearby?latitude=10.762622&longitude=106.660172&radius=5
     */
    @GetMapping("/nearby")
    public ResponseEntity<List<PostDTO>> getNearbyPosts(
        @RequestParam Double latitude,
        @RequestParam Double longitude,
        @RequestParam(defaultValue = "5.0") Double radius,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = getUserId(userDetails);
        List<PostDTO> posts = postService.getNearbyPosts(latitude, longitude, radius, userId);
        return ResponseEntity.ok(posts);
    }

    /**
     * Get feed posts with filters
     * GET /api/posts/feed?page=0&size=20&socialFilter=friends&locationFilter=nearby&radius=5
     * 
     * This endpoint supports both authenticated and anonymous access.
     * When authenticated, it shows personalized content based on privacy settings.
     * When anonymous, it only shows public posts.
     */
    @GetMapping("/feed")
    public ResponseEntity<?> getFeedPosts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String socialFilter,
        @RequestParam(required = false) String locationFilter,
        @RequestParam(required = false) String contentFilter,
        @RequestParam(required = false) String timeFilter,
        @RequestParam(required = false) String engagementFilter,
        @RequestParam(required = false) String recommendationFilter,
        @RequestParam(required = false) Double radius,
        @RequestParam(required = false) Double latitude,
        @RequestParam(required = false) Double longitude,
        @RequestParam(defaultValue = "recent") String sortBy,
        @AuthenticationPrincipal(errorOnInvalidType = false) UserDetails userDetails
    ) {
        log.info("GET /api/posts/feed - page: {}, size: {}, authenticated: {}", 
            page, size, userDetails != null);
        
        // Extract user ID if authenticated, null otherwise
        UUID userId = userDetails != null ? getUserId(userDetails) : null;
        log.info("Extracted userId: {}", userId);
        
        // Build filter list from query params
        List<com.mapic.dto.feed.FilterConfigDTO> filters = new ArrayList<>();
        
        if (socialFilter != null) {
            filters.add(com.mapic.dto.feed.FilterConfigDTO.builder()
                .type(com.mapic.dto.feed.FilterType.SOCIAL)
                .value(socialFilter)
                .label(getSocialFilterLabel(socialFilter))
                .build());
        }
        
        if (locationFilter != null) {
            var filterConfig = com.mapic.dto.feed.FilterConfigDTO.builder()
                .type(com.mapic.dto.feed.FilterType.LOCATION)
                .value(locationFilter)
                .label(getLocationFilterLabel(locationFilter))
                .build();
            
            if (radius != null) {
                filterConfig.getParams().put("radius", radius);
            }
            
            filters.add(filterConfig);
        }
        
        if (contentFilter != null) {
            filters.add(com.mapic.dto.feed.FilterConfigDTO.builder()
                .type(com.mapic.dto.feed.FilterType.CONTENT)
                .value(contentFilter)
                .label(getContentFilterLabel(contentFilter))
                .build());
        }
        
        if (timeFilter != null) {
            filters.add(com.mapic.dto.feed.FilterConfigDTO.builder()
                .type(com.mapic.dto.feed.FilterType.TIME)
                .value(timeFilter)
                .label(getTimeFilterLabel(timeFilter))
                .build());
        }
        
        if (recommendationFilter != null) {
            filters.add(com.mapic.dto.feed.FilterConfigDTO.builder()
                .type(com.mapic.dto.feed.FilterType.RECOMMENDATION)
                .value(recommendationFilter)
                .label(getRecommendationFilterLabel(recommendationFilter))
                .build());
        }
        
        if (engagementFilter != null) {
            filters.add(com.mapic.dto.feed.FilterConfigDTO.builder()
                .type(com.mapic.dto.feed.FilterType.ENGAGEMENT)
                .value(engagementFilter)
                .label(getEngagementFilterLabel(engagementFilter))
                .build());
        }
        
        // Build request DTO
        com.mapic.dto.feed.FeedRequestDTO request = com.mapic.dto.feed.FeedRequestDTO.builder()
            .page(page)
            .size(size)
            .filters(filters)
            .sortBy(sortBy)
            .latitude(latitude)
            .longitude(longitude)
            .radius(radius)
            .build();
        
        // Get filtered feed
        com.mapic.dto.feed.FeedResponseDTO response = postService.getFeedWithFilters(request, userId);
        return ResponseEntity.ok(response);
    }
    
    private String getSocialFilterLabel(String value) {
        return switch (value.toLowerCase()) {
            case "friends" -> "Bạn bè";
            case "friends_of_friends" -> "Bạn của bạn bè";
            case "following" -> "Đang theo dõi";
            case "mutual_friends" -> "Bạn chung";
            default -> value;
        };
    }
    
    private String getLocationFilterLabel(String value) {
        return switch (value.toLowerCase()) {
            case "nearby" -> "Gần đây";
            case "my_city" -> "Thành phố của tôi";
            case "places_visited" -> "Nơi đã đến";
            case "trending_nearby" -> "Xu hướng gần đây";
            default -> value;
        };
    }
    
    private String getContentFilterLabel(String value) {
        return switch (value.toLowerCase()) {
            case "photos_only" -> "Chỉ ảnh";
            case "popular" -> "Phổ biến";
            case "recent" -> "Gần đây";
            case "long_posts" -> "Bài dài";
            case "check_ins" -> "Check-in";
            default -> value;
        };
    }
    
    private String getTimeFilterLabel(String value) {
        return switch (value.toLowerCase()) {
            case "today" -> "Hôm nay";
            case "this_week" -> "Tuần này";
            case "this_month" -> "Tháng này";
            case "custom" -> "Tùy chỉnh";
            default -> value;
        };
    }
    
    private String getEngagementFilterLabel(String value) {
        return switch (value.toLowerCase()) {
            case "trending" -> "Xu hướng";
            case "most_liked" -> "Nhiều thích nhất";
            case "most_discussed" -> "Nhiều bình luận nhất";
            case "viral" -> "Viral";
            default -> value;
        };
    }

    /**
     * Get posts by user
     * GET /api/posts/user/{userId}?page=0&size=20
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<PostDTO>> getUserPosts(
        @PathVariable UUID userId,
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID currentUserId = getUserId(userDetails);
        Page<PostDTO> posts = postService.getUserPosts(userId, currentUserId, pageable);
        return ResponseEntity.ok(posts);
    }

    /**
     * Get posts by hashtag
     * GET /api/posts/hashtag/{name}?page=0&size=20
     */
    @GetMapping("/hashtag/{name}")
    public ResponseEntity<Page<PostDTO>> getPostsByHashtag(
        @PathVariable String name,
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = getUserId(userDetails);
        Page<PostDTO> posts = postService.getPostsByHashtag(name, userId, pageable);
        return ResponseEntity.ok(posts);
    }

    /**
     * Get user's post count
     * GET /api/posts/user/{userId}/count
     */
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> getUserPostCount(@PathVariable UUID userId) {
        Long count = postService.getUserPostCount(userId);
        return ResponseEntity.ok(count);
    }
    
    private String getRecommendationFilterLabel(String value) {
        return switch (value.toLowerCase()) {
            case "for_you" -> "Dành cho bạn";
            case "discovery" -> "Khám phá";
            default -> value;
        };
    }

    /**
     * Test endpoint to verify authentication
     * GET /api/posts/test-auth
     */
    @GetMapping("/test-auth")
    public ResponseEntity<?> testAuth(@AuthenticationPrincipal(errorOnInvalidType = false) UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.ok(java.util.Map.of(
                "authenticated", false,
                "message", "No authentication provided"
            ));
        }
        
        UUID userId = getUserId(userDetails);
        return ResponseEntity.ok(java.util.Map.of(
            "authenticated", true,
            "username", userDetails.getUsername(),
            "userId", userId != null ? userId.toString() : "null",
            "authorities", userDetails.getAuthorities().toString()
        ));
    }
}
