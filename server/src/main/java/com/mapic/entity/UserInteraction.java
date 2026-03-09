package com.mapic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_interactions", indexes = {
    @Index(name = "idx_user_interaction_user_time", columnList = "user_id, timestamp DESC"),
    @Index(name = "idx_user_interaction_post", columnList = "post_id"),
    @Index(name = "idx_user_interaction_type", columnList = "interaction_type, timestamp DESC")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInteraction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "interaction_type", nullable = false, length = 20)
    private InteractionType interactionType;
    
    @Column(name = "duration_seconds")
    private Integer durationSeconds;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    public enum InteractionType {
        VIEW,
        LIKE,
        COMMENT,
        SHARE,
        SAVE
    }
}
