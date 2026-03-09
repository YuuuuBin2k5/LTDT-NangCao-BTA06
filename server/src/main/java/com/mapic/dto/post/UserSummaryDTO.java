package com.mapic.dto.post;

import com.mapic.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSummaryDTO {

    private UUID id;
    private String username;
    private String nickName;
    private String avatarUrl;

    public static UserSummaryDTO from(User user) {
        if (user == null) {
            return null;
        }
        return UserSummaryDTO.builder()
            .id(user.getId())
            .username(user.getUsername())
            .nickName(user.getNickName())
            .avatarUrl(user.getAvatarUrl())
            .build();
    }
}
