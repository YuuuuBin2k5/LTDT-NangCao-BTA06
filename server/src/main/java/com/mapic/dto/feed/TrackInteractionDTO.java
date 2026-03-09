package com.mapic.dto.feed;

import com.mapic.entity.UserInteraction;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackInteractionDTO {
    
    @NotNull(message = "Post ID is required")
    private Long postId;
    
    @NotNull(message = "Interaction type is required")
    private UserInteraction.InteractionType interactionType;
    
    @Positive(message = "Duration must be positive")
    private Integer durationSeconds;
}
