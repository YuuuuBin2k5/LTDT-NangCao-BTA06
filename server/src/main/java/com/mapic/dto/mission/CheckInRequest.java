package com.mapic.dto.mission;

import lombok.Data;

@Data
public class CheckInRequest {
    private Double latitude;
    private Double longitude;
    private String photoUrl;  // URL ảnh đã upload (optional)
}
