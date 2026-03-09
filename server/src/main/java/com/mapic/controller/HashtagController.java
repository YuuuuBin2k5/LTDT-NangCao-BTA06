package com.mapic.controller;

import com.mapic.dto.post.HashtagDTO;
import com.mapic.service.HashtagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hashtags")
@RequiredArgsConstructor
@Slf4j
public class HashtagController {

    private final HashtagService hashtagService;

    /**
     * Get trending hashtags
     * GET /api/hashtags/trending?page=0&size=20
     */
    @GetMapping("/trending")
    public ResponseEntity<Page<HashtagDTO>> getTrending(
        @PageableDefault(size = 20, sort = "usageCount", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<HashtagDTO> hashtags = hashtagService.getTrending(pageable);
        return ResponseEntity.ok(hashtags);
    }

    /**
     * Get top N trending hashtags
     * GET /api/hashtags/top?limit=10
     */
    @GetMapping("/top")
    public ResponseEntity<List<HashtagDTO>> getTopTrending(
        @RequestParam(defaultValue = "10") int limit
    ) {
        List<HashtagDTO> hashtags = hashtagService.getTopTrending(limit);
        return ResponseEntity.ok(hashtags);
    }

    /**
     * Search hashtags by prefix
     * GET /api/hashtags/search?q=sun&limit=10
     */
    @GetMapping("/search")
    public ResponseEntity<List<HashtagDTO>> searchHashtags(
        @RequestParam String q,
        @RequestParam(defaultValue = "10") int limit
    ) {
        List<HashtagDTO> hashtags = hashtagService.searchByPrefix(q, limit);
        return ResponseEntity.ok(hashtags);
    }
}
