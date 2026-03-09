package com.mapic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "places", indexes = {
    @Index(name = "idx_place_category_rating_name", columnList = "category, average_rating, name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "average_rating")
    private Double averageRating;

    // NEW: Total post count (NORMAL + REVIEW posts)
    @Column(name = "post_count", nullable = false)
    @Builder.Default
    private Integer postCount = 0;

    // NEW: Review count (subset of post_count, only REVIEW posts)
    @Column(name = "review_count", nullable = false)
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PlaceCategory category;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Column(length = 500)
    private String address;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper methods for count management

    /**
     * Increment post count
     */
    public void incrementPostCount() {
        this.postCount++;
    }

    /**
     * Decrement post count
     */
    public void decrementPostCount() {
        if (this.postCount > 0) {
            this.postCount--;
        }
    }

    /**
     * Increment review count
     */
    public void incrementReviewCount() {
        this.reviewCount++;
    }

    /**
     * Decrement review count
     */
    public void decrementReviewCount() {
        if (this.reviewCount > 0) {
            this.reviewCount--;
        }
    }

    /**
     * Check if place has any posts
     */
    public boolean hasPosts() {
        return postCount > 0;
    }

    /**
     * Check if place has any reviews
     */
    public boolean hasReviews() {
        return reviewCount > 0;
    }
}
