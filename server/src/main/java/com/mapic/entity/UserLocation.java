package com.mapic.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_locations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserLocation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "accuracy")
    private Float accuracy;
    
    @Column(name = "speed")
    private Double speed;
    
    @Column(name = "heading")
    private Double heading;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "is_current")
    @Builder.Default
    private Boolean isCurrent = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "privacy_mode", length = 20)
    @Builder.Default
    private PrivacyMode privacyMode = PrivacyMode.ALL_FRIENDS;

    @Column(name = "status_message", length = 255)
    private String statusMessage;

    @Column(name = "status_emoji", length = 10)
    private String statusEmoji;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum PrivacyMode {
        ALL_FRIENDS,
        CLOSE_FRIENDS,
        GHOST_MODE
    }
}
