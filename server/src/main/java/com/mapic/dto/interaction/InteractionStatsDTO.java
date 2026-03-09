package com.mapic.dto.interaction;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InteractionStatsDTO {
    private Long totalSent;
    private Long totalReceived;
    private Long heartsSent;
    private Long heartsReceived;
    private Long wavesSent;
    private Long wavesReceived;
    private Long pokesSent;
    private Long pokesReceived;
    private Long firesSent;
    private Long firesReceived;
    private Long starsSent;
    private Long starsReceived;
    private Long hugsSent;
    private Long hugsReceived;
    private List<BestFriendDTO> bestFriends;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BestFriendDTO {
        private UUID friendId;
        private String name;
        private String username;
        private String avatarUrl;
        private Long interactionCount;
    }
}
