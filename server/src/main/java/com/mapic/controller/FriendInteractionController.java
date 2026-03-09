package com.mapic.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mapic.dto.interaction.InteractionDTO;
import com.mapic.dto.interaction.InteractionStatsDTO;
import com.mapic.dto.interaction.SendInteractionRequest;
import com.mapic.entity.User;
import com.mapic.service.FriendInteractionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/friend-interactions")
@RequiredArgsConstructor
public class FriendInteractionController {
    
    private final FriendInteractionService interactionService;
    
    @PostMapping("/send")
    public ResponseEntity<?> sendInteraction(
            @AuthenticationPrincipal User user,
            @RequestBody SendInteractionRequest request) {
        
        System.out.println("💫 Send interaction request from user: " + user.getUsername());
        System.out.println("   Type: " + request.getInteractionType() + ", To: " + request.getToUserId());
        
        try {
            InteractionDTO interaction = interactionService.sendInteraction(user, request);
            System.out.println("✅ Interaction sent successfully");
            return ResponseEntity.ok(interaction);
        } catch (RuntimeException e) {
            System.out.println("❌ Failed to send interaction: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.out.println("❌ Failed to send interaction: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/received")
    public ResponseEntity<List<InteractionDTO>> getReceivedInteractions(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        System.out.println("💫 Get received interactions request from user: " + user.getUsername());
        
        try {
            List<InteractionDTO> interactions = interactionService.getReceivedInteractions(user.getId(), page, size);
            System.out.println("✅ Retrieved " + interactions.size() + " interactions");
            return ResponseEntity.ok(interactions);
        } catch (Exception e) {
            System.out.println("❌ Failed to get received interactions: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/statistics")
    public ResponseEntity<InteractionStatsDTO> getStatistics(@AuthenticationPrincipal User user) {
        
        System.out.println("💫 Get interaction statistics request from user: " + user.getUsername());
        
        try {
            InteractionStatsDTO stats = interactionService.getStatistics(user.getId());
            System.out.println("✅ Retrieved interaction statistics");
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.out.println("❌ Failed to get statistics: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
