package com.mapic.dto.feed;

public enum FilterType {
    SOCIAL("Xã hội"),
    LOCATION("Vị trí"),
    CONTENT("Nội dung"),
    TIME("Thời gian"),
    ENGAGEMENT("Tương tác"),
    DISCOVERY("Khám phá");

    private final String label;

    FilterType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
