package com.mapic.dto.post;

import com.mapic.entity.Hashtag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HashtagDTO {

    private Long id;
    private String name;
    private Integer usageCount;

    public static HashtagDTO from(Hashtag hashtag) {
        if (hashtag == null) {
            return null;
        }

        return HashtagDTO.builder()
            .id(hashtag.getId())
            .name(hashtag.getName())
            .usageCount(hashtag.getUsageCount())
            .build();
    }
}
