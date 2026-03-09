package com.mapic.dto.feed;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * DTO for filter usage analytics
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilterAnalyticsDTO {
    
    private Map<String, Long> filterUsageCount; // Filter type -> count
    private List<FilterUsageEntry> topFilters; // Most used filters
    private Map<String, Long> contentTypeBreakdown; // Content type -> count
    private Map<String, Double> engagementByFilter; // Filter -> avg engagement
    private Long totalFilteredViews;
    private Long totalPosts;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FilterUsageEntry {
        private String filterType;
        private String filterValue;
        private Long usageCount;
        private Double avgEngagement;
    }
}
