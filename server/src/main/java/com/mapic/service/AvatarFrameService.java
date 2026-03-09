package com.mapic.service;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mapic.dto.avatar.AvatarFrameDTO;
import com.mapic.entity.AvatarFrame;
import com.mapic.entity.User;
import com.mapic.entity.UserAvatarFrame;
import com.mapic.repository.AvatarFrameRepository;
import com.mapic.repository.UserAvatarFrameRepository;
import com.mapic.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AvatarFrameService {
    
    private final AvatarFrameRepository frameRepository;
    private final UserAvatarFrameRepository userFrameRepository;
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public List<AvatarFrameDTO> getAllFrames(UUID userId) {
        List<AvatarFrame> allFrames = frameRepository.findAllOrderedByDisplayOrder();
        Set<String> unlockedFrameIds = userFrameRepository.findByUserId(userId).stream()
            .map(uaf -> uaf.getFrame().getId())
            .collect(Collectors.toSet());
        
        String selectedFrameId = userFrameRepository.findSelectedByUserId(userId)
            .map(uaf -> uaf.getFrame().getId())
            .orElse(null);
        
        return allFrames.stream()
            .map(frame -> mapToDTO(frame, unlockedFrameIds.contains(frame.getId()), 
                                   frame.getId().equals(selectedFrameId)))
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<String> getUnlockedFrames(UUID userId) {
        return userFrameRepository.findByUserId(userId).stream()
            .map(uaf -> uaf.getFrame().getId())
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void selectFrame(UUID userId, String frameId) {
        // Check if user has unlocked this frame
        if (!userFrameRepository.existsByUserIdAndFrameId(userId, frameId)) {
            throw new RuntimeException("Frame not unlocked");
        }
        
        // Deselect all frames for user
        userFrameRepository.deselectAllForUser(userId);
        
        // Select the new frame
        UserAvatarFrame.UserAvatarFrameId id = new UserAvatarFrame.UserAvatarFrameId();
        id.setUserId(userId);
        id.setFrameId(frameId);
        
        UserAvatarFrame userFrame = userFrameRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Frame not found"));
        
        userFrame.setIsSelected(true);
        userFrameRepository.save(userFrame);
    }
    
    @Transactional
    public void unlockFrame(UUID userId, String frameId) {
        // Check if frame exists
        AvatarFrame frame = frameRepository.findById(frameId)
            .orElseThrow(() -> new RuntimeException("Frame not found"));
        
        // Check if already unlocked
        if (userFrameRepository.existsByUserIdAndFrameId(userId, frameId)) {
            throw new RuntimeException("Frame already unlocked");
        }
        
        // Get user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Create unlock entry
        UserAvatarFrame.UserAvatarFrameId id = new UserAvatarFrame.UserAvatarFrameId();
        id.setUserId(userId);
        id.setFrameId(frameId);
        
        UserAvatarFrame userFrame = UserAvatarFrame.builder()
            .id(id)
            .user(user)
            .frame(frame)
            .isSelected(false)
            .build();
        
        userFrameRepository.save(userFrame);
    }
    
    private AvatarFrameDTO mapToDTO(AvatarFrame frame, boolean isUnlocked, boolean isSelected) {
        return AvatarFrameDTO.builder()
            .id(frame.getId())
            .name(frame.getName())
            .description(frame.getDescription())
            .frameType(frame.getFrameType())
            .svgPath(frame.getSvgPath())
            .isPremium(frame.getIsPremium())
            .unlockCondition(frame.getUnlockCondition())
            .unlockRequirementValue(frame.getUnlockRequirementValue())
            .displayOrder(frame.getDisplayOrder())
            .isSeasonal(frame.getIsSeasonal())
            .availableFrom(frame.getAvailableFrom())
            .availableUntil(frame.getAvailableUntil())
            .isUnlocked(isUnlocked)
            .isSelected(isSelected)
            .build();
    }
}
