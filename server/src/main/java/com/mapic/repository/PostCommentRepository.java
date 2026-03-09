package com.mapic.repository;

import com.mapic.entity.PostComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PostCommentRepository extends JpaRepository<PostComment, Long> {

    /**
     * Find comments for a post with pagination
     */
    @Query("SELECT pc FROM PostComment pc JOIN FETCH pc.user WHERE pc.post.id = :postId ORDER BY pc.createdAt DESC")
    Page<PostComment> findByPostIdWithUser(@Param("postId") Long postId, Pageable pageable);

    /**
     * Count comments for a post
     */
    @Query("SELECT COUNT(pc) FROM PostComment pc WHERE pc.post.id = :postId")
    Long countByPostId(@Param("postId") Long postId);

    /**
     * Find comments by user
     */
    @Query("SELECT pc FROM PostComment pc WHERE pc.user.id = :userId ORDER BY pc.createdAt DESC")
    Page<PostComment> findByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Check if user owns comment
     */
    @Query("SELECT CASE WHEN COUNT(pc) > 0 THEN true ELSE false END FROM PostComment pc WHERE pc.id = :commentId AND pc.user.id = :userId")
    boolean isCommentOwnedByUser(@Param("commentId") Long commentId, @Param("userId") UUID userId);

    /**
     * Delete all comments for a post
     */
    void deleteByPostId(Long postId);

    /**
     * Delete all comments by user
     */
    void deleteByUserId(UUID userId);
}
