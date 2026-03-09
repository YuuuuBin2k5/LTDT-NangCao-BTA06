package com.mapic.repository;

import com.mapic.entity.MissionCart;
import com.mapic.entity.MissionCartStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MissionCartRepository extends JpaRepository<MissionCart, Long> {

    // Lấy cart PENDING hoặc ACTIVE của user
    @Query("""
        SELECT c FROM MissionCart c
        LEFT JOIN FETCH c.items i
        LEFT JOIN FETCH i.mission m
        LEFT JOIN FETCH m.category
        WHERE c.userId = :userId
        AND c.status IN ('PENDING', 'ACTIVE')
        ORDER BY c.createdAt DESC
        """)
    Optional<MissionCart> findActiveCartByUserId(@Param("userId") UUID userId);

    boolean existsByUserIdAndStatus(UUID userId, MissionCartStatus status);
}
