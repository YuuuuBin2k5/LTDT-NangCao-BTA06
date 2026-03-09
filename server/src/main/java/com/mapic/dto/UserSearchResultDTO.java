package com.mapic.dto;

import com.mapic.entity.FriendshipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Data Transfer Object for user search results.
 * Contains only public, non-sensitive user information along with friendship status.
 * Excludes sensitive fields like email, phone, and password.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchResultDTO {
    private UUID id;
    private String name; // Maps to nickName from User entity
    private String username;
    private String avatarUrl;
    private FriendshipStatus friendshipStatus; // null if no friendship exists
    private Long friendshipId; // For delete operations, null if no friendship exists
}
