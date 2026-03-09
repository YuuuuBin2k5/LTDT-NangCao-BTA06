package com.mapic.service;

import com.mapic.dto.post.CommentDTO;
import com.mapic.dto.post.CreateCommentRequest;
import com.mapic.dto.post.UserSummaryDTO;
import com.mapic.entity.Post;
import com.mapic.entity.PostComment;
import com.mapic.entity.PostLike;
import com.mapic.entity.User;
import com.mapic.repository.PostCommentRepository;
import com.mapic.repository.PostLikeRepository;
import com.mapic.repository.PostRepository;
import com.mapic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostInteractionService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostCommentRepository postCommentRepository;
    private final UserRepository userRepository;

    /**
     * Like a post
     */
    @Transactional
    public void likePost(Long postId, UUID userId) {
        // Check if already liked
        if (postLikeRepository.existsByPostIdAndUserId(postId, userId)) {
            log.debug("User {} already liked post {}", userId, postId);
            return;
        }

        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        PostLike like = PostLike.builder()
            .post(post)
            .user(user)
            .build();

        postLikeRepository.save(like);
        log.info("User {} liked post {}", userId, postId);
    }

    /**
     * Unlike a post
     */
    @Transactional
    public void unlikePost(Long postId, UUID userId) {
        PostLike like = postLikeRepository.findByPostIdAndUserId(postId, userId)
            .orElseThrow(() -> new RuntimeException("Like not found"));

        postLikeRepository.delete(like);
        log.info("User {} unliked post {}", userId, postId);
    }

    /**
     * Get users who liked a post
     */
    @Transactional(readOnly = true)
    public Page<UserSummaryDTO> getLikes(Long postId, Pageable pageable) {
        Page<PostLike> likes = postLikeRepository.findByPostIdWithUser(postId, pageable);
        return likes.map(like -> UserSummaryDTO.from(like.getUser()));
    }

    /**
     * Check if user liked a post
     */
    @Transactional(readOnly = true)
    public boolean isPostLikedByUser(Long postId, UUID userId) {
        return postLikeRepository.existsByPostIdAndUserId(postId, userId);
    }

    /**
     * Add comment to post
     */
    @Transactional
    public CommentDTO addComment(Long postId, UUID userId, CreateCommentRequest request) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        PostComment comment = PostComment.builder()
            .post(post)
            .user(user)
            .content(request.getContent())
            .build();

        PostComment saved = postCommentRepository.save(comment);
        log.info("User {} commented on post {}", userId, postId);

        return CommentDTO.from(saved);
    }

    /**
     * Update comment
     */
    @Transactional
    public CommentDTO updateComment(Long commentId, UUID userId, CreateCommentRequest request) {
        PostComment comment = postCommentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Check ownership
        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this comment");
        }

        comment.setContent(request.getContent());
        PostComment updated = postCommentRepository.save(comment);

        log.info("User {} updated comment {}", userId, commentId);
        return CommentDTO.from(updated);
    }

    /**
     * Delete comment
     */
    @Transactional
    public void deleteComment(Long commentId, UUID userId) {
        PostComment comment = postCommentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Check ownership or post ownership
        if (!comment.getUser().getId().equals(userId) &&
            !comment.getPost().getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this comment");
        }

        postCommentRepository.delete(comment);
        log.info("User {} deleted comment {}", userId, commentId);
    }

    /**
     * Get comments for a post
     */
    @Transactional(readOnly = true)
    public Page<CommentDTO> getComments(Long postId, Pageable pageable) {
        Page<PostComment> comments = postCommentRepository.findByPostIdWithUser(postId, pageable);
        return comments.map(CommentDTO::from);
    }

    /**
     * Get comment count for a post
     */
    @Transactional(readOnly = true)
    public Long getCommentCount(Long postId) {
        return postCommentRepository.countByPostId(postId);
    }

    /**
     * Get like count for a post
     */
    @Transactional(readOnly = true)
    public Long getLikeCount(Long postId) {
        return postLikeRepository.countByPostId(postId);
    }
}
