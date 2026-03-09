package com.mapic.service;

import com.mapic.dto.post.HashtagDTO;
import com.mapic.entity.Hashtag;
import com.mapic.repository.HashtagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class HashtagService {

    private final HashtagRepository hashtagRepository;
    private static final Pattern HASHTAG_PATTERN = Pattern.compile("#(\\w+)");

    /**
     * Extract hashtags from content
     */
    public Set<String> extractHashtags(String content) {
        if (content == null || content.isBlank()) {
            return new HashSet<>();
        }

        Set<String> hashtags = new HashSet<>();
        Matcher matcher = HASHTAG_PATTERN.matcher(content);

        while (matcher.find()) {
            String tag = matcher.group(1).toLowerCase();
            if (!tag.isBlank()) {
                hashtags.add(tag);
            }
        }

        return hashtags;
    }

    /**
     * Find or create hashtag
     */
    @Transactional
    public Hashtag findOrCreate(String name) {
        String normalizedName = name.toLowerCase().trim();

        return hashtagRepository.findByNameIgnoreCase(normalizedName)
            .orElseGet(() -> {
                Hashtag newHashtag = Hashtag.builder()
                    .name(normalizedName)
                    .usageCount(0)
                    .build();
                return hashtagRepository.save(newHashtag);
            });
    }

    /**
     * Get trending hashtags
     */
    @Transactional(readOnly = true)
    public Page<HashtagDTO> getTrending(Pageable pageable) {
        Page<Hashtag> hashtags = hashtagRepository.findTrending(pageable);
        return hashtags.map(HashtagDTO::from);
    }

    /**
     * Get top N trending hashtags
     */
    @Transactional(readOnly = true)
    public List<HashtagDTO> getTopTrending(int limit) {
        List<Hashtag> hashtags = hashtagRepository.findTopTrending(PageRequest.of(0, limit));
        return hashtags.stream()
            .map(HashtagDTO::from)
            .collect(Collectors.toList());
    }

    /**
     * Search hashtags by prefix
     */
    @Transactional(readOnly = true)
    public List<HashtagDTO> searchByPrefix(String prefix, int limit) {
        List<Hashtag> hashtags = hashtagRepository.findByNameStartingWithIgnoreCase(
            prefix,
            PageRequest.of(0, limit)
        );
        return hashtags.stream()
            .map(HashtagDTO::from)
            .collect(Collectors.toList());
    }

    /**
     * Increment usage count for hashtag
     */
    @Transactional
    public void incrementUsageCount(Hashtag hashtag) {
        hashtag.incrementUsageCount();
        hashtagRepository.save(hashtag);
    }

    /**
     * Decrement usage count for hashtag
     */
    @Transactional
    public void decrementUsageCount(Hashtag hashtag) {
        hashtag.decrementUsageCount();
        hashtagRepository.save(hashtag);
    }
}
