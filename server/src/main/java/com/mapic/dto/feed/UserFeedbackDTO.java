package com.mapic.dto.feed;

import com.mapic.entity.UserFeedback;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFeedbackDTO {
    
    @NotNull(message = "Post ID is required")
    private Long postId;
    
    @NotNull(message = "Feedback type is required")
    private UserFeedback.FeedbackType feedbackType;
    
    private String reason; // Optional reason for negative feedback
}
