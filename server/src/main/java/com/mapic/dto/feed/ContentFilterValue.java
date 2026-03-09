package com.mapic.dto.feed;

public enum ContentFilterValue {
    PHOTOS_ONLY("Chỉ ảnh"),
    POPULAR("Phổ biến"),
    RECENT("Gần đây"),
    LONG_POSTS("Bài dài"),
    CHECK_INS("Check-in");

    private final String label;

    ContentFilterValue(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
