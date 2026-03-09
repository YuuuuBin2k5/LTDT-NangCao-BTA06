package com.mapic.controller;

import com.mapic.dto.feed.CreatePresetDTO;
import com.mapic.dto.feed.FilterPresetDTO;
import com.mapic.entity.User;
import com.mapic.service.FilterPresetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/feed/presets")
@RequiredArgsConstructor
@Slf4j
public class FilterPresetController {
    
    private final FilterPresetService presetService;
    
    /**
     * Helper method to extract user ID from UserDetails
     */
    private UUID getUserId(UserDetails userDetails) {
        if (userDetails instanceof User) {
            return ((User) userDetails).getId();
        }
        return null;
    }
    
    @GetMapping
    public ResponseEntity<List<FilterPresetDTO>> getPresets(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = getUserId(userDetails);
        List<FilterPresetDTO> presets = presetService.getPresets(userId);
        return ResponseEntity.ok(presets);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<FilterPresetDTO> getPreset(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = getUserId(userDetails);
        FilterPresetDTO preset = presetService.getPreset(id, userId);
        return ResponseEntity.ok(preset);
    }
    
    @PostMapping
    public ResponseEntity<FilterPresetDTO> createPreset(
        @Valid @RequestBody CreatePresetDTO dto,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = getUserId(userDetails);
        FilterPresetDTO preset = presetService.savePreset(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(preset);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePreset(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = getUserId(userDetails);
        presetService.deletePreset(id, userId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/share")
    public ResponseEntity<Map<String, String>> sharePreset(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = getUserId(userDetails);
        String shareToken = presetService.sharePreset(id, userId);
        return ResponseEntity.ok(Map.of("shareToken", shareToken));
    }
    
    @PostMapping("/shared/{token}")
    public ResponseEntity<FilterPresetDTO> applySharedPreset(
        @PathVariable String token,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = getUserId(userDetails);
        FilterPresetDTO preset = presetService.applySharedPreset(token, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(preset);
    }
    
    @PutMapping("/{id}/default")
    public ResponseEntity<Void> setDefaultPreset(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = getUserId(userDetails);
        presetService.setDefaultPreset(id, userId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/use")
    public ResponseEntity<Void> incrementUsageCount(
        @PathVariable Long id
    ) {
        presetService.incrementUsageCount(id);
        return ResponseEntity.ok().build();
    }
}
