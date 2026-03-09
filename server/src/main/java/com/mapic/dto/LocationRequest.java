package com.mapic.dto;

import com.mapic.entity.UserLocation.PrivacyMode;

import lombok.Data;

@Data
public class LocationRequest {
    private Double latitude;
    private Double longitude;
    private Double heading;
    private Double speed;
    private Integer batteryLevel;
    private Float accuracy;
    private PrivacyMode privacyMode;
    private String statusMessage;
    private String statusEmoji;
}