package com.mapic.repository;

import com.mapic.entity.PostLike;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    /**
     * Check if user has liked a post
     */
    @Query("SELECT CASE WHEN COUNT(pl) > 0 THEN true ELSE false END FROM PostLike pl WHERE pl.post.id = :postId AND pl.user.id = :userId")
    boolean existsByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") UUID userId);

    /**
     * Find like by post and user
     */
    @Query("SELECT pl FROM PostLike pl WHERE pl.post.id = :postId AND pl.user.id = :userId")
    Optional<PostLike> findByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") UUID userId);

    /**
     * Count likes for a post
     */
    @Query("SELECT COUNT(pl) FROM PostLike pl WHERE pl.post.id = :postId")
    Long countByPostId(@Param("postId") Long postId);

    /**
     * Find users who liked a post (with pagination)
     */
    @Query("SELECT pl FROM PostLike pl JOIN FETCH pl.user WHERE pl.post.id = :postId ORDER BY pl.createdAt DESC")
    Page<PostLike> findByPostIdWithUser(@Param("postId") Long postId, Pageable pageable);

    /**
     * Delete like by post and user
     */
    void deleteByPostIdAndUserId(Long postId, UUID userId);

    /**
     * Delete all likes for a post
     */
    void deleteByPostId(Long postId);

    /**
     * Find posts liked by user
     */
    @Query("SELECT pl FROM PostLike pl JOIN FETCH pl.post WHERE pl.user.id = :userId ORDER BY pl.createdAt DESC")
    Page<PostLike> findByUserIdWithPost(@Param("userId") UUID userId, Pageable pageable);
}
