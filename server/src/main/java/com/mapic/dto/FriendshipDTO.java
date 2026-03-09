package com.mapic.dto;

import com.mapic.entity.FriendshipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Data Transfer Object for Friendship entity.
 * Used for API responses when creating or retrieving friendship data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendshipDTO {
    private UUID id;
    private UUID userId1;
    private UUID userId2;
    private FriendshipStatus status;
    private LocalDateTime createdAt;
}
