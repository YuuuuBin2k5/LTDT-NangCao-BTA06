package com.mapic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "posts", indexes = {
    @Index(name = "idx_posts_user_created", columnList = "user_id, created_at"),
    @Index(name = "idx_posts_created", columnList = "created_at"),
    @Index(name = "idx_posts_privacy_created", columnList = "privacy, created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    // NEW: Post type (NORMAL or REVIEW)
    @Enumerated(EnumType.STRING)
    @Column(name = "post_type", nullable = false, length = 20)
    @Builder.Default
    private PostType postType = PostType.NORMAL;

    // NEW: Place relationship (optional for NORMAL, required for REVIEW)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    private Place place;

    // NEW: Rating (required for REVIEW, null for NORMAL)
    @Column(name = "rating")
    private Integer rating;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "location_name", length = 255)
    private String locationName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PostPrivacy privacy = PostPrivacy.PUBLIC;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Integer viewCount = 0;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<PostImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PostLike> likes = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    @Builder.Default
    private List<PostComment> comments = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "post_hashtags",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "hashtag_id")
    )
    @Builder.Default
    private Set<Hashtag> hashtags = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Helper methods

    /**
     * Get the number of likes on this post
     */
    public int getLikeCount() {
        return likes != null ? likes.size() : 0;
    }

    /**
     * Get the number of comments on this post
     */
    public int getCommentCount() {
        return comments != null ? comments.size() : 0;
    }

    /**
     * Check if a user has liked this post
     */
    public boolean isLikedBy(UUID userId) {
        if (likes == null || userId == null) {
            return false;
        }
        return likes.stream()
            .anyMatch(like -> like.getUser().getId().equals(userId));
    }

    /**
     * Add an image to this post
     */
    public void addImage(PostImage image) {
        images.add(image);
        image.setPost(this);
    }

    /**
     * Remove an image from this post
     */
    public void removeImage(PostImage image) {
        images.remove(image);
        image.setPost(null);
    }

    /**
     * Add a hashtag to this post
     */
    public void addHashtag(Hashtag hashtag) {
        hashtags.add(hashtag);
        hashtag.getPosts().add(this);
    }

    /**
     * Remove a hashtag from this post
     */
    public void removeHashtag(Hashtag hashtag) {
        hashtags.remove(hashtag);
        hashtag.getPosts().remove(this);
    }

    /**
     * Increment view count
     */
    public void incrementViewCount() {
        this.viewCount++;
    }

    /**
     * Check if this is a REVIEW post
     */
    public boolean isReview() {
        return postType == PostType.REVIEW;
    }

    /**
     * Check if this is a NORMAL post
     */
    public boolean isNormal() {
        return postType == PostType.NORMAL;
    }

    /**
     * Check if this post has a place
     */
    public boolean hasPlace() {
        return place != null;
    }

    /**
     * Check if this post has a rating
     */
    public boolean hasRating() {
        return rating != null;
    }

    /**
     * Validate post constraints
     * - REVIEW posts must have place and rating
     * - NORMAL posts must not have rating
     */
    public boolean isValid() {
        if (postType == PostType.REVIEW) {
            return place != null && rating != null && rating >= 1 && rating <= 5;
        } else {
            return rating == null;
        }
    }
}
