package com.mapic.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    
    @JsonProperty("nickName")
    private String nickName;
    
    @JsonProperty("urlAvatar")
    private String urlAvatar;
    
    private String bio;
}