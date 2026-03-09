package com.mapic.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_avatar_frames")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserAvatarFrame {
    
    @EmbeddedId
    private UserAvatarFrameId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("frameId")
    @JoinColumn(name = "frame_id")
    private AvatarFrame frame;

    @Column(name = "is_selected")
    @Builder.Default
    private Boolean isSelected = false;

    @CreationTimestamp
    @Column(name = "unlocked_at")
    private LocalDateTime unlockedAt;

    @Embeddable
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    @EqualsAndHashCode
    public static class UserAvatarFrameId implements Serializable {
        @Column(name = "user_id")
        private UUID userId;

        @Column(name = "frame_id", length = 50)
        private String frameId;
    }
}
