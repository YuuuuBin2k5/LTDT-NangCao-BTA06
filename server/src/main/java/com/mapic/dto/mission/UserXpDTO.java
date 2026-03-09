package com.mapic.dto.mission;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserXpDTO {
    private Integer totalXp;
    private Integer level;
    private Integer missionsCompleted;
    private Integer xpToNextLevel;  // XP còn cần để lên level tiếp
}
