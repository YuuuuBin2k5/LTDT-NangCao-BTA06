package com.mapic.dto.feed;

public enum TimeFilterValue {
    TODAY("Hôm nay"),
    THIS_WEEK("Tuần này"),
    THIS_MONTH("Tháng này"),
    CUSTOM("Tùy chỉnh");

    private final String label;

    TimeFilterValue(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
