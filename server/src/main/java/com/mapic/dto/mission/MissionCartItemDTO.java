package com.mapic.dto.mission;

import com.mapic.entity.MissionCartItem;
import com.mapic.entity.MissionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MissionCartItemDTO {
    private Long id;
    private MissionDTO mission;
    private MissionStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
    private String checkInPhotoUrl;

    public static MissionCartItemDTO from(MissionCartItem item) {
        return MissionCartItemDTO.builder()
            .id(item.getId())
            .mission(MissionDTO.from(item.getMission()))
            .status(item.getStatus())
            .startedAt(item.getStartedAt())
            .completedAt(item.getCompletedAt())
            .cancelledAt(item.getCancelledAt())
            .checkInPhotoUrl(item.getCheckInPhotoUrl())
            .build();
    }
}
