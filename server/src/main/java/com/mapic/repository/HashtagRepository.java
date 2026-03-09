package com.mapic.repository;

import com.mapic.entity.Hashtag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HashtagRepository extends JpaRepository<Hashtag, Long> {

    /**
     * Find hashtag by name (case-insensitive)
     */
    @Query("SELECT h FROM Hashtag h WHERE LOWER(h.name) = LOWER(:name)")
    Optional<Hashtag> findByNameIgnoreCase(@Param("name") String name);

    /**
     * Find trending hashtags (most used)
     */
    @Query("SELECT h FROM Hashtag h WHERE h.usageCount > 0 ORDER BY h.usageCount DESC")
    Page<Hashtag> findTrending(Pageable pageable);

    /**
     * Find top N trending hashtags
     */
    @Query("SELECT h FROM Hashtag h WHERE h.usageCount > 0 ORDER BY h.usageCount DESC")
    List<Hashtag> findTopTrending(Pageable pageable);

    /**
     * Search hashtags by name prefix
     */
    @Query("SELECT h FROM Hashtag h WHERE LOWER(h.name) LIKE LOWER(CONCAT(:prefix, '%')) ORDER BY h.usageCount DESC")
    List<Hashtag> findByNameStartingWithIgnoreCase(@Param("prefix") String prefix, Pageable pageable);

    /**
     * Check if hashtag exists
     */
    @Query("SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE false END FROM Hashtag h WHERE LOWER(h.name) = LOWER(:name)")
    boolean existsByNameIgnoreCase(@Param("name") String name);
}
