package com.mapic.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "avatar_frames")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AvatarFrame {
    
    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "frame_type", nullable = false, length = 20)
    private FrameType frameType;

    @Column(name = "svg_path", columnDefinition = "TEXT", nullable = false)
    private String svgPath;

    @Column(name = "is_premium")
    @Builder.Default
    private Boolean isPremium = false;

    @Column(name = "unlock_condition", length = 100)
    private String unlockCondition;

    @Column(name = "unlock_requirement_value")
    private Integer unlockRequirementValue;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "is_seasonal")
    @Builder.Default
    private Boolean isSeasonal = false;

    @Column(name = "available_from")
    private LocalDate availableFrom;

    @Column(name = "available_until")
    private LocalDate availableUntil;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum FrameType {
        CIRCULAR,
        SQUARE,
        HEART,
        STAR,
        HEXAGON,
        DIAMOND,
        FLOWER,
        CLOUD,
        BADGE,
        NEON
    }
}
