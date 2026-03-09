package com.mapic.service;

import com.mapic.dto.feed.CreatePresetDTO;
import com.mapic.dto.feed.FilterPresetDTO;

import java.util.List;
import java.util.UUID;

public interface FilterPresetService {
    
    /**
     * Save a new filter preset
     */
    FilterPresetDTO savePreset(CreatePresetDTO dto, UUID userId);
    
    /**
     * Get all presets for a user
     */
    List<FilterPresetDTO> getPresets(UUID userId);
    
    /**
     * Get a specific preset by ID
     */
    FilterPresetDTO getPreset(Long presetId, UUID userId);
    
    /**
     * Delete a preset
     */
    void deletePreset(Long presetId, UUID userId);
    
    /**
     * Share a preset (generate share token)
     */
    String sharePreset(Long presetId, UUID userId);
    
    /**
     * Apply a shared preset
     */
    FilterPresetDTO applySharedPreset(String shareToken, UUID userId);
    
    /**
     * Set a preset as default
     */
    void setDefaultPreset(Long presetId, UUID userId);
    
    /**
     * Increment usage count
     */
    void incrementUsageCount(Long presetId);
}
