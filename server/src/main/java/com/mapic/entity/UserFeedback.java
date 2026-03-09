package com.mapic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity for tracking user feedback on recommended posts
 */
@Entity
@Table(name = "user_feedback", indexes = {
    @Index(name = "idx_user_feedback_user", columnList = "user_id"),
    @Index(name = "idx_user_feedback_post", columnList = "post_id"),
    @Index(name = "idx_user_feedback_type", columnList = "feedback_type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserFeedback {
    
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
    @Column(name = "feedback_type", nullable = false)
    private FeedbackType feedbackType;
    
    @Column(name = "reason")
    private String reason; // Optional reason for negative feedback
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    public enum FeedbackType {
        NOT_INTERESTED,
        HIDE_POST,
        REPORT_SPAM,
        HELPFUL,
        NOT_RELEVANT
    }
}
