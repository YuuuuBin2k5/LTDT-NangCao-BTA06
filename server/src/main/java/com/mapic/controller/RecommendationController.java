package com.mapic.controller;

import com.mapic.dto.feed.TrackInteractionDTO;
import com.mapic.dto.post.PostDTO;
import com.mapic.entity.Post;
import com.mapic.service.RecommendationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@Slf4j
public class RecommendationController {
    
    private final RecommendationService recommendationService;
    
    /**
     * Get personalized "For You" feed
     */
    @GetMapping("/for-you")
    public ResponseEntity<Page<PostDTO>> getForYouFeed(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        Pageable pageable = PageRequest.of(page, size);
        
        Page<Post> posts = recommendationService.getPersonalizedFeed(userId, pageable);
        Page<PostDTO> postDTOs = posts.map(post -> PostDTO.from(post, userId));
        
        return ResponseEntity.ok(postDTOs);
    }
    
    /**
     * Get discovery feed (posts outside user's network)
     */
    @GetMapping("/discovery")
    public ResponseEntity<Page<PostDTO>> getDiscoveryFeed(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam(required = false) Double latitude,
        @RequestParam(required = false) Double longitude,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        Pageable pageable = PageRequest.of(page, size);
        
        Page<Post> posts = recommendationService.getDiscoveryFeed(userId, latitude, longitude, pageable);
        Page<PostDTO> postDTOs = posts.map(post -> PostDTO.from(post, userId));
        
        return ResponseEntity.ok(postDTOs);
    }
    
    /**
     * Track user interaction with post
     */
    @PostMapping("/track")
    public ResponseEntity<Void> trackInteraction(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody TrackInteractionDTO dto
    ) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        
        recommendationService.trackInteraction(
            userId,
            dto.getPostId(),
            dto.getInteractionType().name(),
            dto.getDurationSeconds()
        );
        
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get recommendation reason for a post
     */
    @GetMapping("/reason/{postId}")
    public ResponseEntity<String> getRecommendationReason(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long postId
    ) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        String reason = recommendationService.getRecommendationReason(userId, postId);
        
        return ResponseEntity.ok(reason);
    }
}
