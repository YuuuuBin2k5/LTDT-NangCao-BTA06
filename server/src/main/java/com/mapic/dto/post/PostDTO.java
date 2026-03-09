package com.mapic.dto.post;

import com.mapic.entity.Post;
import com.mapic.entity.PostPrivacy;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDTO {

    private Long id;
    private UserSummaryDTO user;
    private String content;
    private Double latitude;
    private Double longitude;
    private String locationName;
    private PostPrivacy privacy;
    private List<PostImageDTO> images;
    private Integer likeCount;
    private Integer commentCount;
    private Boolean isLiked;
    private Integer viewCount;
    private List<String> hashtags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PostDTO from(Post post, UUID currentUserId) {
        if (post == null) {
            return null;
        }

        return PostDTO.builder()
            .id(post.getId())
            .user(UserSummaryDTO.from(post.getUser()))
            .content(post.getContent())
            .latitude(post.getLatitude())
            .longitude(post.getLongitude())
            .locationName(post.getLocationName())
            .privacy(post.getPrivacy())
            .images(post.getImages().stream()
                .map(PostImageDTO::from)
                .collect(Collectors.toList()))
            .likeCount(post.getLikeCount())
            .commentCount(post.getCommentCount())
            .isLiked(currentUserId != null && post.isLikedBy(currentUserId))
            .viewCount(post.getViewCount())
            .hashtags(post.getHashtags().stream()
                .map(h -> h.getName())
                .collect(Collectors.toList()))
            .createdAt(post.getCreatedAt())
            .updatedAt(post.getUpdatedAt())
            .build();
    }

    public static PostDTO from(Post post) {
        return from(post, null);
    }
}
