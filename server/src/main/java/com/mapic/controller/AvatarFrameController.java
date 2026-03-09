package com.mapic.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mapic.dto.avatar.AvatarFrameDTO;
import com.mapic.entity.User;
import com.mapic.service.AvatarFrameService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/avatar-frames")
@RequiredArgsConstructor
public class AvatarFrameController {
    
    private final AvatarFrameService frameService;
    
    @GetMapping
    public ResponseEntity<List<AvatarFrameDTO>> getAllFrames(@AuthenticationPrincipal User user) {
        System.out.println("🖼️  Get all frames request from user: " + user.getUsername());
        
        try {
            List<AvatarFrameDTO> frames = frameService.getAllFrames(user.getId());
            System.out.println("✅ Retrieved " + frames.size() + " frames");
            return ResponseEntity.ok(frames);
        } catch (Exception e) {
            System.out.println("❌ Failed to get frames: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/unlocked")
    public ResponseEntity<List<String>> getUnlockedFrames(@AuthenticationPrincipal User user) {
        System.out.println("🖼️  Get unlocked frames request from user: " + user.getUsername());
        
        try {
            List<String> frameIds = frameService.getUnlockedFrames(user.getId());
            System.out.println("✅ Retrieved " + frameIds.size() + " unlocked frames");
            return ResponseEntity.ok(frameIds);
        } catch (Exception e) {
            System.out.println("❌ Failed to get unlocked frames: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/{frameId}/select")
    public ResponseEntity<?> selectFrame(
            @AuthenticationPrincipal User user,
            @PathVariable String frameId) {
        
        System.out.println("🖼️  Select frame request from user: " + user.getUsername() + ", frame: " + frameId);
        
        try {
            frameService.selectFrame(user.getId(), frameId);
            System.out.println("✅ Frame selected successfully");
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            System.out.println("❌ Failed to select frame: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.out.println("❌ Failed to select frame: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/{frameId}/unlock")
    public ResponseEntity<?> unlockFrame(
            @AuthenticationPrincipal User user,
            @PathVariable String frameId) {
        
        System.out.println("🖼️  Unlock frame request from user: " + user.getUsername() + ", frame: " + frameId);
        
        try {
            frameService.unlockFrame(user.getId(), frameId);
            System.out.println("✅ Frame unlocked successfully");
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            System.out.println("❌ Failed to unlock frame: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.out.println("❌ Failed to unlock frame: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
