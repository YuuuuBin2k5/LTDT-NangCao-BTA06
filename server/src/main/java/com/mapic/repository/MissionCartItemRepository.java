package com.mapic.repository;

import com.mapic.entity.MissionCartItem;
import com.mapic.entity.MissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MissionCartItemRepository extends JpaRepository<MissionCartItem, Long> {

    // Lịch sử hoàn thành của user
    @Query("""
        SELECT i FROM MissionCartItem i
        JOIN FETCH i.mission m
        JOIN FETCH m.category
        JOIN i.cart c
        WHERE c.userId = :userId
        AND i.status = 'COMPLETED'
        ORDER BY i.completedAt DESC
        """)
    List<MissionCartItem> findCompletedByUserId(@Param("userId") UUID userId);

    // Kiểm tra user đã thêm mission này chưa (trong cart đang active)
    @Query("""
        SELECT COUNT(i) > 0 FROM MissionCartItem i
        JOIN i.cart c
        WHERE c.userId = :userId
        AND i.mission.id = :missionId
        AND c.status IN ('PENDING', 'ACTIVE')
        AND i.status NOT IN ('CANCELLED', 'CANCEL_REQUESTED')
        """)
    boolean existsActiveMissionForUser(
        @Param("userId") UUID userId,
        @Param("missionId") Long missionId
    );
}
