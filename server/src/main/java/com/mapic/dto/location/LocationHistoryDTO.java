package com.mapic.dto.location;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationHistoryDTO {
    private Long id;
    private Double latitude;
    private Double longitude;
    private LocalDateTime timestamp;
    private String statusMessage;
    private String statusEmoji;
}
