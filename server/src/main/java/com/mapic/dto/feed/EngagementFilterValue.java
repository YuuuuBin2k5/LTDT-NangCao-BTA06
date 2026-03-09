package com.mapic.dto.feed;

public enum EngagementFilterValue {
    TRENDING("Xu hướng"),
    MOST_LIKED("Nhiều thích nhất"),
    MOST_DISCUSSED("Nhiều bình luận nhất"),
    VIRAL("Viral");

    private final String label;

    EngagementFilterValue(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
