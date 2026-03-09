package com.mapic.dto.mission;

import com.mapic.entity.MissionCart;
import com.mapic.entity.MissionCartStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class MissionCartDTO {
    private Long id;
    private MissionCartStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime createdAt;
    private List<MissionCartItemDTO> items;
    private Integer totalXpPossible;  // tổng XP nếu hoàn thành tất cả

    public static MissionCartDTO from(MissionCart cart) {
        List<MissionCartItemDTO> items = cart.getItems().stream()
            .map(MissionCartItemDTO::from)
            .collect(Collectors.toList());

        int totalXp = items.stream()
            .mapToInt(i -> i.getMission() != null ? i.getMission().getXpReward() : 0)
            .sum();

        return MissionCartDTO.builder()
            .id(cart.getId())
            .status(cart.getStatus())
            .startedAt(cart.getStartedAt())
            .createdAt(cart.getCreatedAt())
            .items(items)
            .totalXpPossible(totalXp)
            .build();
    }
}
