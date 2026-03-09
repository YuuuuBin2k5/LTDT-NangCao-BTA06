package com.mapic.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mapic.dto.interaction.InteractionDTO;
import com.mapic.dto.interaction.InteractionStatsDTO;
import com.mapic.dto.interaction.SendInteractionRequest;
import com.mapic.entity.FriendInteraction;
import com.mapic.entity.FriendInteraction.InteractionType;
import com.mapic.entity.User;
import com.mapic.repository.FriendInteractionRepository;
import com.mapic.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FriendInteractionService {
    
    private final FriendInteractionRepository interactionRepository;
    private final UserRepository userRepository;
    private static final int COOLDOWN_SECONDS = 10;
    
    @Transactional
    public InteractionDTO sendInteraction(User fromUser, SendInteractionRequest request) {
        // Validate request
        if (request.getInteractionType() == null) {
            throw new RuntimeException("Interaction type is required");
        }
        
        // Check cooldown
        checkCooldown(fromUser.getId());
        
        // Verify friendship
        User toUser = userRepository.findById(request.getToUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Create interaction (location fields are optional)
        FriendInteraction interaction = FriendInteraction.builder()
            .fromUser(fromUser)
            .toUser(toUser)
            .interactionType(request.getInteractionType())
            .fromLatitude(request.getFromLatitude())
            .fromLongitude(request.getFromLongitude())
            .toLatitude(request.getToLatitude())
            .toLongitude(request.getToLongitude())
            .isRead(false)
            .build();
        
        interaction = interactionRepository.save(interaction);
        
        System.out.println("✅ Interaction saved: " + interaction.getId() + " - " + interaction.getInteractionType());
        
        return mapToDTO(interaction);
    }
    
    @Transactional(readOnly = true)
    public List<InteractionDTO> getReceivedInteractions(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<FriendInteraction> interactions = interactionRepository.findReceivedInteractions(userId, pageable);
        
        return interactions.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public InteractionStatsDTO getStatistics(UUID userId) {
        // Count sent interactions by type
        Long heartsSent = interactionRepository.countSentByType(userId, InteractionType.HEART);
        Long wavesSent = interactionRepository.countSentByType(userId, InteractionType.WAVE);
        Long pokesSent = interactionRepository.countSentByType(userId, InteractionType.POKE);
        Long firesSent = interactionRepository.countSentByType(userId, InteractionType.FIRE);
        Long starsSent = interactionRepository.countSentByType(userId, InteractionType.STAR);
        Long hugsSent = interactionRepository.countSentByType(userId, InteractionType.HUG);
        
        // Count received interactions by type
        Long heartsReceived = interactionRepository.countReceivedByType(userId, InteractionType.HEART);
        Long wavesReceived = interactionRepository.countReceivedByType(userId, InteractionType.WAVE);
        Long pokesReceived = interactionRepository.countReceivedByType(userId, InteractionType.POKE);
        Long firesReceived = interactionRepository.countReceivedByType(userId, InteractionType.FIRE);
        Long starsReceived = interactionRepository.countReceivedByType(userId, InteractionType.STAR);
        Long hugsReceived = interactionRepository.countReceivedByType(userId, InteractionType.HUG);
        
        Long totalSent = heartsSent + wavesSent + pokesSent + firesSent + starsSent + hugsSent;
        Long totalReceived = heartsReceived + wavesReceived + pokesReceived + firesReceived + starsReceived + hugsReceived;
        
        // Get best friends
        List<Object[]> topPartners = interactionRepository.findTopInteractionPartners(userId, PageRequest.of(0, 5));
        List<InteractionStatsDTO.BestFriendDTO> bestFriends = topPartners.stream()
            .map(row -> {
                UUID friendId = (UUID) row[0];
                Long count = ((Number) row[1]).longValue();
                User friend = userRepository.findById(friendId).orElse(null);
                
                if (friend == null) return null;
                
                return InteractionStatsDTO.BestFriendDTO.builder()
                    .friendId(friendId)
                    .name(friend.getNickName())
                    .username(friend.getUsername())
                    .avatarUrl(friend.getAvatarUrl())
                    .interactionCount(count)
                    .build();
            })
            .filter(dto -> dto != null)
            .collect(Collectors.toList());
        
        return InteractionStatsDTO.builder()
            .totalSent(totalSent)
            .totalReceived(totalReceived)
            .heartsSent(heartsSent)
            .heartsReceived(heartsReceived)
            .wavesSent(wavesSent)
            .wavesReceived(wavesReceived)
            .pokesSent(pokesSent)
            .pokesReceived(pokesReceived)
            .firesSent(firesSent)
            .firesReceived(firesReceived)
            .starsSent(starsSent)
            .starsReceived(starsReceived)
            .hugsSent(hugsSent)
            .hugsReceived(hugsReceived)
            .bestFriends(bestFriends)
            .build();
    }
    
    private void checkCooldown(UUID userId) {
        interactionRepository.findLastInteractionByUser(userId)
            .ifPresent(lastInteraction -> {
                Duration timeSinceLastInteraction = Duration.between(lastInteraction.getCreatedAt(), LocalDateTime.now());
                if (timeSinceLastInteraction.getSeconds() < COOLDOWN_SECONDS) {
                    long remainingSeconds = COOLDOWN_SECONDS - timeSinceLastInteraction.getSeconds();
                    throw new RuntimeException("Please wait " + remainingSeconds + " seconds before sending another interaction");
                }
            });
    }
    
    private InteractionDTO mapToDTO(FriendInteraction interaction) {
        return InteractionDTO.builder()
            .id(interaction.getId())
            .fromUserId(interaction.getFromUser().getId())
            .fromUserName(interaction.getFromUser().getNickName())
            .fromUserAvatar(interaction.getFromUser().getAvatarUrl())
            .toUserId(interaction.getToUser().getId())
            .toUserName(interaction.getToUser().getNickName())
            .interactionType(interaction.getInteractionType())
            .fromLatitude(interaction.getFromLatitude())
            .fromLongitude(interaction.getFromLongitude())
            .toLatitude(interaction.getToLatitude())
            .toLongitude(interaction.getToLongitude())
            .isRead(interaction.getIsRead())
            .createdAt(interaction.getCreatedAt())
            .build();
    }
}
