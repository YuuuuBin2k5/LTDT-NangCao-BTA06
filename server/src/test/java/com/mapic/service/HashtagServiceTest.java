package com.mapic.service;

import com.mapic.entity.Hashtag;
import com.mapic.repository.HashtagRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HashtagServiceTest {

    @Mock
    private HashtagRepository hashtagRepository;

    @InjectMocks
    private HashtagService hashtagService;

    @Test
    void testExtractHashtags_SingleHashtag() {
        // Given
        String content = "This is a post with #hashtag";

        // When
        Set<String> hashtags = hashtagService.extractHashtags(content);

        // Then
        assertThat(hashtags).containsExactly("hashtag");
    }

    @Test
    void testExtractHashtags_MultipleHashtags() {
        // Given
        String content = "Post with #hashtag1 and #hashtag2 #hashtag3";

        // When
        Set<String> hashtags = hashtagService.extractHashtags(content);

        // Then
        assertThat(hashtags).containsExactlyInAnyOrder("hashtag1", "hashtag2", "hashtag3");
    }

    @Test
    void testExtractHashtags_NoHashtags() {
        // Given
        String content = "Post without hashtags";

        // When
        Set<String> hashtags = hashtagService.extractHashtags(content);

        // Then
        assertThat(hashtags).isEmpty();
    }

    @Test
    void testExtractHashtags_DuplicateHashtags() {
        // Given
        String content = "Post with #hashtag and #hashtag again";

        // When
        Set<String> hashtags = hashtagService.extractHashtags(content);

        // Then
        assertThat(hashtags).containsExactly("hashtag");
    }

    @Test
    void testExtractHashtags_CaseInsensitive() {
        // Given
        String content = "Post with #Hashtag and #HASHTAG";

        // When
        Set<String> hashtags = hashtagService.extractHashtags(content);

        // Then
        assertThat(hashtags).containsExactly("hashtag");
    }

    @Test
    void testExtractHashtags_NullContent() {
        // When
        Set<String> hashtags = hashtagService.extractHashtags(null);

        // Then
        assertThat(hashtags).isEmpty();
    }

    @Test
    void testExtractHashtags_EmptyContent() {
        // When
        Set<String> hashtags = hashtagService.extractHashtags("");

        // Then
        assertThat(hashtags).isEmpty();
    }

    @Test
    void testFindOrCreate_ExistingHashtag() {
        // Given
        Hashtag existingHashtag = Hashtag.builder()
            .id(1L)
            .name("test")
            .usageCount(5)
            .build();
        when(hashtagRepository.findByNameIgnoreCase("test"))
            .thenReturn(Optional.of(existingHashtag));

        // When
        Hashtag result = hashtagService.findOrCreate("test");

        // Then
        assertThat(result).isEqualTo(existingHashtag);
        verify(hashtagRepository, never()).save(any());
    }

    @Test
    void testFindOrCreate_NewHashtag() {
        // Given
        when(hashtagRepository.findByNameIgnoreCase("newtag"))
            .thenReturn(Optional.empty());
        when(hashtagRepository.save(any(Hashtag.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        Hashtag result = hashtagService.findOrCreate("newtag");

        // Then
        assertThat(result.getName()).isEqualTo("newtag");
        assertThat(result.getUsageCount()).isEqualTo(0);
        verify(hashtagRepository).save(any(Hashtag.class));
    }

    @Test
    void testIncrementUsageCount() {
        // Given
        Hashtag hashtag = Hashtag.builder()
            .id(1L)
            .name("test")
            .usageCount(5)
            .build();

        // When
        hashtagService.incrementUsageCount(hashtag);

        // Then
        assertThat(hashtag.getUsageCount()).isEqualTo(6);
        verify(hashtagRepository).save(hashtag);
    }

    @Test
    void testDecrementUsageCount() {
        // Given
        Hashtag hashtag = Hashtag.builder()
            .id(1L)
            .name("test")
            .usageCount(5)
            .build();

        // When
        hashtagService.decrementUsageCount(hashtag);

        // Then
        assertThat(hashtag.getUsageCount()).isEqualTo(4);
        verify(hashtagRepository).save(hashtag);
    }

    @Test
    void testDecrementUsageCount_DoesNotGoBelowZero() {
        // Given
        Hashtag hashtag = Hashtag.builder()
            .id(1L)
            .name("test")
            .usageCount(0)
            .build();

        // When
        hashtagService.decrementUsageCount(hashtag);

        // Then
        assertThat(hashtag.getUsageCount()).isEqualTo(0);
        verify(hashtagRepository).save(hashtag);
    }
}
