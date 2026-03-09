package com.mapic.service;

import com.mapic.dto.feed.CreatePresetDTO;
import com.mapic.dto.feed.FilterPresetDTO;
import com.mapic.entity.FilterPreset;
import com.mapic.entity.User;
import com.mapic.exception.ResourceNotFoundException;
import com.mapic.repository.FilterPresetRepository;
import com.mapic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FilterPresetServiceImpl implements FilterPresetService {
    
    private final FilterPresetRepository presetRepository;
    private final UserRepository userRepository;
    private static final SecureRandom RANDOM = new SecureRandom();
    
    @Override
    @Transactional
    public FilterPresetDTO savePreset(CreatePresetDTO dto, UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Check if preset name already exists for this user
        if (presetRepository.existsByUserIdAndName(userId, dto.getName())) {
            throw new IllegalArgumentException("A preset with this name already exists");
        }
        
        FilterPreset preset = FilterPreset.builder()
            .user(user)
            .name(dto.getName())
            .description(dto.getDescription())
            .filters(dto.getFilters())
            .isPublic(dto.getIsPublic())
            .isDefault(false)
            .usageCount(0)
            .build();
        
        preset = presetRepository.save(preset);
        log.info("Created filter preset: {} for user: {}", preset.getName(), userId);
        
        return toDTO(preset);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<FilterPresetDTO> getPresets(UUID userId) {
        return presetRepository.findByUserIdOrderByUsageCountDesc(userId)
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public FilterPresetDTO getPreset(Long presetId, UUID userId) {
        FilterPreset preset = presetRepository.findByIdAndUserId(presetId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Preset not found"));
        
        return toDTO(preset);
    }
    
    @Override
    @Transactional
    public void deletePreset(Long presetId, UUID userId) {
        FilterPreset preset = presetRepository.findByIdAndUserId(presetId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Preset not found"));
        
        presetRepository.delete(preset);
        log.info("Deleted filter preset: {} for user: {}", presetId, userId);
    }
    
    @Override
    @Transactional
    public String sharePreset(Long presetId, UUID userId) {
        FilterPreset preset = presetRepository.findByIdAndUserId(presetId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Preset not found"));
        
        // Generate share token if not exists
        if (preset.getShareToken() == null) {
            String token = generateShareToken();
            preset.setShareToken(token);
            preset.setIsPublic(true);
            presetRepository.save(preset);
            log.info("Generated share token for preset: {}", presetId);
        }
        
        return preset.getShareToken();
    }
    
    @Override
    @Transactional
    public FilterPresetDTO applySharedPreset(String shareToken, UUID userId) {
        FilterPreset sharedPreset = presetRepository.findByShareToken(shareToken)
            .orElseThrow(() -> new ResourceNotFoundException("Shared preset not found"));
        
        // Increment usage count of shared preset
        sharedPreset.incrementUsageCount();
        presetRepository.save(sharedPreset);
        
        // Create a copy for the current user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        FilterPreset newPreset = FilterPreset.builder()
            .user(user)
            .name(sharedPreset.getName() + " (Shared)")
            .description(sharedPreset.getDescription())
            .filters(sharedPreset.getFilters())
            .isPublic(false)
            .isDefault(false)
            .usageCount(0)
            .build();
        
        newPreset = presetRepository.save(newPreset);
        log.info("Applied shared preset: {} for user: {}", shareToken, userId);
        
        return toDTO(newPreset);
    }
    
    @Override
    @Transactional
    public void setDefaultPreset(Long presetId, UUID userId) {
        // Clear existing default
        FilterPreset currentDefault = presetRepository.findByUserIdAndIsDefaultTrue(userId)
            .orElse(null);
        if (currentDefault != null) {
            currentDefault.setIsDefault(false);
            presetRepository.save(currentDefault);
        }
        
        // Set new default
        FilterPreset preset = presetRepository.findByIdAndUserId(presetId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Preset not found"));
        
        preset.setIsDefault(true);
        presetRepository.save(preset);
        log.info("Set default preset: {} for user: {}", presetId, userId);
    }
    
    @Override
    @Transactional
    public void incrementUsageCount(Long presetId) {
        FilterPreset preset = presetRepository.findById(presetId)
            .orElseThrow(() -> new ResourceNotFoundException("Preset not found"));
        
        preset.incrementUsageCount();
        presetRepository.save(preset);
    }
    
    private String generateShareToken() {
        byte[] randomBytes = new byte[32];
        RANDOM.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
    
    private FilterPresetDTO toDTO(FilterPreset preset) {
        return FilterPresetDTO.builder()
            .id(preset.getId())
            .name(preset.getName())
            .description(preset.getDescription())
            .filters(preset.getFilters())
            .isDefault(preset.getIsDefault())
            .isPublic(preset.getIsPublic())
            .shareToken(preset.getShareToken())
            .usageCount(preset.getUsageCount())
            .createdAt(preset.getCreatedAt())
            .updatedAt(preset.getUpdatedAt())
            .build();
    }
}
