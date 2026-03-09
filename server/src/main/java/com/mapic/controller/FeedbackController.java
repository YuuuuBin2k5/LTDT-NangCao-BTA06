package com.mapic.controller;

import com.mapic.dto.feed.UserFeedbackDTO;
import com.mapic.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller for handling user feedback on posts
 */
@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
@Slf4j
public class FeedbackController {
    
    private final FeedbackService feedbackService;
    
    /**
     * Submit feedback for a post
     */
    @PostMapping
    public ResponseEntity<Void> submitFeedback(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody UserFeedbackDTO feedbackDTO
    ) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        feedbackService.submitFeedback(userId, feedbackDTO);
        return ResponseEntity.ok().build();
    }
}
