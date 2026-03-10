package com.mapic.dto;

import com.mapic.entity.FriendshipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Data Transfer Object for User information.
 * Used for returning user data in API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private UUID id;
    private String username;
    private String name;
    private String avatarUrl;
    private UUID friendshipId;
    private com.mapic.entity.FriendshipStatus friendshipStatus;
    private com.mapic.dto.avatar.AvatarFrameDTO selectedFrame;
}
