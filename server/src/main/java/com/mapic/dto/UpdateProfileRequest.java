package com.mapic.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String nickName;
    private String bio;
    private String avatarUrl;
}
