package com.mapic.repository;

import com.mapic.entity.PostImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostImageRepository extends JpaRepository<PostImage, Long> {

    /**
     * Find all images for a post, ordered by display order
     */
    @Query("SELECT pi FROM PostImage pi WHERE pi.post.id = :postId ORDER BY pi.displayOrder ASC")
    List<PostImage> findByPostIdOrderByDisplayOrder(@Param("postId") Long postId);

    /**
     * Delete all images for a post
     */
    void deleteByPostId(Long postId);

    /**
     * Count images for a post
     */
    @Query("SELECT COUNT(pi) FROM PostImage pi WHERE pi.post.id = :postId")
    Long countByPostId(@Param("postId") Long postId);
}
