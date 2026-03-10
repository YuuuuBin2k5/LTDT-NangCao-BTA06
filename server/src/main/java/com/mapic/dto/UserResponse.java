package com.mapic.dto;

import com.mapic.entity.User;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private String message;
    private User user;
    private com.mapic.dto.avatar.AvatarFrameDTO selectedFrame;
}
