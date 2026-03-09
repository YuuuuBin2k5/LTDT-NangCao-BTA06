package com.mapic.dto.mission;

import com.mapic.entity.Mission;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MissionDTO {
    private Long id;
    private String title;
    private String description;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private Long categoryId;
    private Double latitude;
    private Double longitude;
    private Integer radiusMeters;
    private Integer xpReward;
    private String badgeName;
    private Short difficulty;
    private LocalDateTime deadline;
    private String placeName;      // tên địa điểm (nếu có)
    private String placeAddress;

    public static MissionDTO from(Mission m) {
        return MissionDTO.builder()
            .id(m.getId())
            .title(m.getTitle())
            .description(m.getDescription())
            .categoryName(m.getCategory() != null ? m.getCategory().getName() : null)
            .categoryIcon(m.getCategory() != null ? m.getCategory().getIcon() : null)
            .categoryColor(m.getCategory() != null ? m.getCategory().getColor() : null)
            .categoryId(m.getCategory() != null ? m.getCategory().getId() : null)
            .latitude(m.getLatitude())
            .longitude(m.getLongitude())
            .radiusMeters(m.getRadiusMeters())
            .xpReward(m.getXpReward())
            .badgeName(m.getBadgeName())
            .difficulty(m.getDifficulty())
            .deadline(m.getDeadline())
            .placeName(m.getPlace() != null ? m.getPlace().getName() : null)
            .placeAddress(m.getPlace() != null ? m.getPlace().getAddress() : null)
            .build();
    }
}
