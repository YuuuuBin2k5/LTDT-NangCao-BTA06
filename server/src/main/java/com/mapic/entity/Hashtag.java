package com.mapic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
    name = "hashtags",
    indexes = {
        @Index(name = "idx_hashtags_name", columnList = "name"),
        @Index(name = "idx_hashtags_usage", columnList = "usage_count")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hashtag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "usage_count", nullable = false)
    @Builder.Default
    private Integer usageCount = 0;

    @ManyToMany(mappedBy = "hashtags")
    @Builder.Default
    private Set<Post> posts = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Increment usage count when a post uses this hashtag
     */
    public void incrementUsageCount() {
        this.usageCount++;
    }

    /**
     * Decrement usage count when a post removes this hashtag
     */
    public void decrementUsageCount() {
        if (this.usageCount > 0) {
            this.usageCount--;
        }
    }
}
