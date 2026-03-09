package com.mapic.dto.post;

import com.mapic.entity.PostComment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDTO {

    private Long id;
    private Long postId;
    private UserSummaryDTO user;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CommentDTO from(PostComment comment) {
        if (comment == null) {
            return null;
        }

        return CommentDTO.builder()
            .id(comment.getId())
            .postId(comment.getPost().getId())
            .user(UserSummaryDTO.from(comment.getUser()))
            .content(comment.getContent())
            .createdAt(comment.getCreatedAt())
            .updatedAt(comment.getUpdatedAt())
            .build();
    }
}
