package com.mapic.dto.avatar;

import java.time.LocalDate;

import com.mapic.entity.AvatarFrame.FrameType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvatarFrameDTO {
    private String id;
    private String name;
    private String description;
    private FrameType frameType;
    private String svgPath;
    private Boolean isPremium;
    private String unlockCondition;
    private Integer unlockRequirementValue;
    private Integer displayOrder;
    private Boolean isSeasonal;
    private LocalDate availableFrom;
    private LocalDate availableUntil;
    private Boolean isUnlocked;
    private Boolean isSelected;
}
