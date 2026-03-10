package com.mapic.dto.location;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendLocationDTO {
    private UUID userId;  // Changed from friendId to match client expectation
    private String name;
    private String username;
    private String avatarUrl;
    private com.mapic.dto.avatar.AvatarFrameDTO selectedFrame;
    private Double latitude;
    private Double longitude;
    private LocalDateTime timestamp;
    private Boolean isOnline;
    private Integer lastSeenMinutes;
    private String statusMessage;
    private String statusEmoji;
}
