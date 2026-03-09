package com.mapic.dto;

import lombok.Data;

@Data
public class VerifyContactChangeRequest {
    private String otpCode;
    private ContactType type;
}
