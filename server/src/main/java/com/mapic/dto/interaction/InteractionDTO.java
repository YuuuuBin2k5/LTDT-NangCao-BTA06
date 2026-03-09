package com.mapic.dto.interaction;

import java.time.LocalDateTime;
import java.util.UUID;

import com.mapic.entity.FriendInteraction.InteractionType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InteractionDTO {
    private Long id;
    private UUID fromUserId;
    private String fromUserName;
    private String fromUserAvatar;
    private UUID toUserId;
    private String toUserName;
    private InteractionType interactionType;
    private Double fromLatitude;
    private Double fromLongitude;
    private Double toLatitude;
    private Double toLongitude;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
