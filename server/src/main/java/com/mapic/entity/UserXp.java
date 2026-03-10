package com.mapic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_xp")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserXp {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "total_xp", nullable = false)
    @Builder.Default
    private Integer totalXp = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer level = 1;

    @Column(name = "missions_completed", nullable = false)
    @Builder.Default
    private Integer missionsCompleted = 0;

    @Column(name = "spendable_xp", nullable = false)
    @Builder.Default
    private Integer spendableXp = 0;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Tính level từ XP: mỗi 200 XP = 1 level
     */
    public void recalculateLevel() {
        this.level = Math.max(1, this.totalXp / 200 + 1);
    }

    public void addXp(int xp) {
        this.totalXp += xp;
        if (this.spendableXp == null) {
            this.spendableXp = 0;
        }
        this.spendableXp += xp;
        this.missionsCompleted++;
        this.updatedAt = LocalDateTime.now();
        recalculateLevel();
    }
}
