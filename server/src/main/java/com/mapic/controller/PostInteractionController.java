package com.mapic.controller;

import com.mapic.dto.post.CommentDTO;
import com.mapic.dto.post.CreateCommentRequest;
import com.mapic.dto.post.UserSummaryDTO;
import com.mapic.entity.User;
import com.mapic.service.PostInteractionService;
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

import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Slf4j
public class PostInteractionController {

    private final PostInteractionService postInteractionService;

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
     * Like a post
     * POST /api/posts/{id}/like
     */
    @PostMapping("/{id}/like")
    public ResponseEntity<Void> likePost(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = getUserId(userDetails);
        postInteractionService.likePost(id, userId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /**
     * Unlike a post
     * DELETE /api/posts/{id}/like
     */
    @DeleteMapping("/{id}/like")
    public ResponseEntity<Void> unlikePost(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = getUserId(userDetails);
        postInteractionService.unlikePost(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get users who liked a post
     * GET /api/posts/{id}/likes?page=0&size=20
     */
    @GetMapping("/{id}/likes")
    public ResponseEntity<Page<UserSummaryDTO>> getLikes(
        @PathVariable Long id,
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<UserSummaryDTO> likes = postInteractionService.getLikes(id, pageable);
        return ResponseEntity.ok(likes);
    }

    /**
     * Check if user liked a post
     * GET /api/posts/{id}/liked
     */
    @GetMapping("/{id}/liked")
    public ResponseEntity<Boolean> isPostLiked(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = getUserId(userDetails);
        boolean liked = postInteractionService.isPostLikedByUser(id, userId);
        return ResponseEntity.ok(liked);
    }

    /**
     * Add comment to post
     * POST /api/posts/{id}/comments
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDTO> addComment(
        @PathVariable Long id,
        @Valid @RequestBody CreateCommentRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = getUserId(userDetails);
        CommentDTO comment = postInteractionService.addComment(id, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    /**
     * Get comments for a post
     * GET /api/posts/{id}/comments?page=0&size=20
     */
    @GetMapping("/{id}/comments")
    public ResponseEntity<Page<CommentDTO>> getComments(
        @PathVariable Long id,
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<CommentDTO> comments = postInteractionService.getComments(id, pageable);
        return ResponseEntity.ok(comments);
    }

    /**
     * Update comment
     * PUT /api/posts/comments/{commentId}
     */
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentDTO> updateComment(
        @PathVariable Long commentId,
        @Valid @RequestBody CreateCommentRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = getUserId(userDetails);
        CommentDTO comment = postInteractionService.updateComment(commentId, userId, request);
        return ResponseEntity.ok(comment);
    }

    /**
     * Delete comment
     * DELETE /api/posts/comments/{commentId}
     */
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
        @PathVariable Long commentId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = getUserId(userDetails);
        postInteractionService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get like count for a post
     * GET /api/posts/{id}/likes/count
     */
    @GetMapping("/{id}/likes/count")
    public ResponseEntity<Long> getLikeCount(@PathVariable Long id) {
        Long count = postInteractionService.getLikeCount(id);
        return ResponseEntity.ok(count);
    }

    /**
     * Get comment count for a post
     * GET /api/posts/{id}/comments/count
     */
    @GetMapping("/{id}/comments/count")
    public ResponseEntity<Long> getCommentCount(@PathVariable Long id) {
        Long count = postInteractionService.getCommentCount(id);
        return ResponseEntity.ok(count);
    }
}
