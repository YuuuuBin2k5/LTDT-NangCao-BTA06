package com.mapic.repository;

import com.mapic.entity.Mission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MissionRepository extends JpaRepository<Mission, Long> {

    // Lấy missions active, filter theo category (nếu có)
    @Query("""
        SELECT m FROM Mission m
        LEFT JOIN FETCH m.category
        LEFT JOIN FETCH m.place
        WHERE m.isActive = true
        AND (:categoryId IS NULL OR m.category.id = :categoryId)
        ORDER BY m.difficulty ASC, m.xpReward DESC
        """)
    Page<Mission> findActiveByCategory(
        @Param("categoryId") Long categoryId,
        Pageable pageable
    );

    // Lấy missions gần vị trí user (bounding box đơn giản)
    @Query("""
        SELECT m FROM Mission m
        LEFT JOIN FETCH m.category
        LEFT JOIN FETCH m.place
        WHERE m.isActive = true
        AND (:categoryId IS NULL OR m.category.id = :categoryId)
        AND m.latitude BETWEEN :latMin AND :latMax
        AND m.longitude BETWEEN :lngMin AND :lngMax
        ORDER BY m.difficulty ASC
        """)
    Page<Mission> findNearbyByCategory(
        @Param("categoryId") Long categoryId,
        @Param("latMin") Double latMin,
        @Param("latMax") Double latMax,
        @Param("lngMin") Double lngMin,
        @Param("lngMax") Double lngMax,
        Pageable pageable
    );
}
