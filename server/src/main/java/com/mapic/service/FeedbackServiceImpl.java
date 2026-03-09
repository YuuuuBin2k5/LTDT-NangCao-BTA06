package com.mapic.service;

import com.mapic.dto.feed.UserFeedbackDTO;
import com.mapic.entity.Post;
import com.mapic.entity.User;
import com.mapic.entity.UserFeedback;
import com.mapic.repository.PostRepository;
import com.mapic.repository.UserFeedbackRepository;
import com.mapic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackServiceImpl implements FeedbackService {
    
    private final UserFeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    
    @Override
    @Transactional
    public void submitFeedback(UUID userId, UserFeedbackDTO feedbackDTO) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Post post = postRepository.findById(feedbackDTO.getPostId())
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        // Check if feedback already exists
        if (feedbackRepository.existsByUserIdAndPostId(userId, feedbackDTO.getPostId())) {
            log.debug("Feedback already exists for user {} and post {}", userId, feedbackDTO.getPostId());
            return;
        }
        
        UserFeedback feedback = UserFeedback.builder()
            .user(user)
            .post(post)
            .feedbackType(feedbackDTO.getFeedbackType())
            .reason(feedbackDTO.getReason())
            .build();
        
        feedbackRepository.save(feedback);
        log.info("Saved feedback {} from user {} for post {}", 
            feedbackDTO.getFeedbackType(), userId, feedbackDTO.getPostId());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Long> getNotInterestedPostIds(UUID userId) {
        return feedbackRepository.findNotInterestedPostIds(userId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean hasFeedback(UUID userId, Long postId) {
        return feedbackRepository.existsByUserIdAndPostId(userId, postId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserFeedback> getNegativeFeedback(UUID userId, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return feedbackRepository.findNegativeFeedbackByUser(userId, since);
    }
}
