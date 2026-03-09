package com.mapic.dto.post;

import com.mapic.entity.PostImage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostImageDTO {

    private Long id;
    private String imageUrl;
    private String thumbnailUrl;
    private Integer displayOrder;

    public static PostImageDTO from(PostImage image) {
        if (image == null) {
            return null;
        }
        return PostImageDTO.builder()
            .id(image.getId())
            .imageUrl(image.getImageUrl())
            .thumbnailUrl(image.getThumbnailUrl())
            .displayOrder(image.getDisplayOrder())
            .build();
    }
}
