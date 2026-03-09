package com.mapic.dto.interaction;

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
public class SendInteractionRequest {
    private UUID toUserId;
    private InteractionType interactionType;
    private Double fromLatitude;
    private Double fromLongitude;
    private Double toLatitude;
    private Double toLongitude;
}
