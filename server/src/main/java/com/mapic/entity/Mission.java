package com.mapic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "missions", indexes = {
    @Index(name = "idx_missions_category", columnList = "category_id"),
    @Index(name = "idx_missions_active",   columnList = "is_active")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private MissionCategory category;

    // Link tới địa điểm (có thể null nếu là mission tự do)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    private Place place;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "radius_meters", nullable = false)
    @Builder.Default
    private Integer radiusMeters = 100;

    @Column(name = "xp_reward", nullable = false)
    @Builder.Default
    private Integer xpReward = 50;

    @Column(name = "badge_name", length = 100)
    private String badgeName;

    @Column(nullable = false)
    @Builder.Default
    private Short difficulty = 1;  // 1=dễ 2=trung bình 3=khó

    private LocalDateTime deadline; // null = không giới hạn

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
