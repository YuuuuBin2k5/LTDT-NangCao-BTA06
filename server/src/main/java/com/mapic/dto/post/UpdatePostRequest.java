package com.mapic.dto.post;

import com.mapic.entity.PostPrivacy;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePostRequest {

    @Size(max = 5000, message = "Content must not exceed 5000 characters")
    private String content;

    private PostPrivacy privacy;

    @Size(max = 255, message = "Location name must not exceed 255 characters")
    private String locationName;
}
